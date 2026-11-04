import {build} from 'esbuild';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Miniflare} from 'miniflare';
const script=(await build({entryPoints:[new URL('../server/worker.mjs',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser'})).outputFiles[0].text;
const origin='https://learning.example',password='isolated member access test phrase';
const runtime=()=>new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password}});
function client(mf){let cookie='';return{async req(path,body,method,headers={}){const binary=body instanceof Uint8Array;const response=await mf.dispatchFetch(origin+path,{method:method||(body===undefined?'GET':'POST'),headers:{Origin:origin,Cookie:cookie,...(body===undefined||binary?{}:{'Content-Type':'application/json'}),...headers},...(body===undefined?{}:{body:binary?body:JSON.stringify(body)})});if(response.headers.has('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return response;}};}

test('only selected preview videos are public; direct files and quizzes require a live account',async()=>{
 const mf=runtime(),admin=client(mf),guest=client(mf),student=client(mf);
 const base={kind:'lesson',status:'published',title:'Isolated member lesson',description:'Private detailed content. '.repeat(30)+'PRIVATE_END',level:'primary',classLevel:'P7',subject:'Science',topic:'Plants'};
 async function upload(name,mime,bytes){const response=await admin.req('/api/uploads',{name,mime,size:bytes.length});assert.equal(response.status,201);const {id}=await response.json();assert.equal((await admin.req('/api/uploads/'+id,bytes,'PUT')).status,200);return id;}
 async function save(input){const response=await admin.req('/api/admin/content',input);assert.equal(response.status,200,await response.clone().text());return (await response.json()).item;}
 try{
  await admin.req('/api/login',{password});
  const video=await upload('preview.mp4','video/mp4',new TextEncoder().encode('0000ftypisom preview video fixture'));
  const low=await upload('low.mp4','video/mp4',new TextEncoder().encode('0000ftypisom small'));
  const lockedVideo=await upload('member.mp4','video/mp4',new TextEncoder().encode('0000ftypisom member video fixture'));
  const pdf=await upload('notes.pdf','application/pdf',new TextEncoder().encode('%PDF-1.4\nprivate notes\n%%EOF'));
  const cover=await upload('cover.jpg','image/jpeg',new Uint8Array([255,216,255,224,0,16,1,2,3]));
  const preview=await save({...base,title:'Public preview',publicPreview:true,videoAssetId:video,lowDataVideoAssetId:low,pdfAssetId:pdf,coverAssetId:cover});
  const member=await save({...base,videoAssetId:lockedVideo,coverAssetId:cover});
  const notes=await save({...base,kind:'pdf',title:'Member PDF',publicPreview:true,pdfAssetId:pdf});
  const quiz=await save({...base,kind:'quiz',publicPreview:true,questions:[{question:'Private quiz question',options:['one','two','three','four'],answer:1,explanation:'Private answer key'}]});
  const items=(await (await guest.req('/api/content')).json()).items;
  const find=id=>items.find(item=>item.id===id);
  assert.equal(find(preview.id).requiresLogin,false);assert.equal(find(preview.id).videoAssetId,video);assert.equal(find(preview.id).pdfAssetId,'');
  for(const item of [find(member.id),find(notes.id),find(quiz.id)]){assert.equal(item.requiresLogin,true);assert.equal(item.publicPreview,false);assert.equal(item.videoAssetId,'');assert.equal(item.pdfAssetId,'');assert.deepEqual(item.questions,[]);assert.equal(item.description.includes('PRIVATE_END'),false);}
  assert.equal((await guest.req('/api/media/'+video)).status,200);
  assert.equal((await guest.req('/api/media/'+low)).status,200);
  assert.equal((await guest.req('/api/media/'+video,undefined,'HEAD')).status,200);
  assert.equal((await guest.req('/api/media/'+video,undefined,'GET',{Range:'bytes=0-7'})).status,206);
  assert.equal((await guest.req('/api/media/'+cover)).status,200);
  for(const id of [lockedVideo,pdf])for(const [method,suffix,headers] of [['GET','',{}],['HEAD','',{}],['GET','',{Range:'bytes=0-4'}],['GET','?download=1',{}],['GET','',{Cookie:'vl_learner='+('f'.repeat(64))}]])assert.equal((await guest.req('/api/media/'+id+suffix,undefined,method,headers)).status,401);
  assert.equal((await guest.req('/api/quiz/'+quiz.id+'/grade',{answers:[1]})).status,401);
  assert.equal((await student.req('/api/learner/signup',{username:'access.student',displayName:'Student',classLevel:'P7',password})).status,201);
  const full=(await (await student.req('/api/content')).json()).items.find(item=>item.id===quiz.id);
  assert.equal(full.requiresLogin,false);assert.equal(full.questions[0].question,'Private quiz question');assert.equal(full.questions[0].answer,undefined);
  assert.equal((await student.req('/api/media/'+lockedVideo)).status,200);
  assert.equal((await student.req('/api/media/'+pdf,undefined,'GET',{Range:'bytes=0-4'})).status,206);
  assert.equal((await (await student.req('/api/quiz/'+quiz.id+'/grade',{answers:[1]})).json()).saved,true);
  assert.equal((await student.req('/api/admin/content')).status,401);
  assert.equal((await student.req('/api/admin/school-access',{})).status,401);
  await student.req('/api/learner/logout',{});
  assert.equal((await student.req('/api/media/'+lockedVideo)).status,401);
  assert.equal((await student.req('/api/media/'+pdf)).status,401);
  assert.equal((await student.req('/api/quiz/'+quiz.id+'/grade',{answers:[1]})).status,401);
  await save({...preview,publicPreview:false});
  assert.equal((await guest.req('/api/media/'+video)).status,401);
  assert.equal((await guest.req('/api/media/'+low)).status,401);
  assert.equal((await guest.req('/api/media/'+lockedVideo)).status,401,'revoking a preview never opens another lesson automatically');
  await save({...member,publicPreview:true});
  assert.equal((await guest.req('/api/media/'+lockedVideo)).status,200);
  await save({...member,publicPreview:true,status:'draft'});
  assert.equal((await guest.req('/api/media/'+lockedVideo)).status,404);
 }finally{await mf.dispose();}
});

test('the access upgrade keeps exactly one existing video as a preview and leaves the other records intact',async()=>{
 const mf=runtime();try{
  const db=await mf.getD1Database('DB');await db.prepare('CREATE TABLE content(id TEXT PRIMARY KEY,kind TEXT,status TEXT,data TEXT,created_at TEXT,updated_at TEXT)').run();
  const ids=[randomUUID(),randomUUID(),randomUUID()];
  for(let i=0;i<ids.length;i++)await db.prepare("INSERT INTO content VALUES(?,'lesson',?,?,?,?)").bind(ids[i],i===2?'draft':'published',JSON.stringify({title:'Existing lesson '+i,videoAssetId:randomUUID(),description:'Existing content remains'}),'2026-01-0'+(i+1),'2026-01-0'+(i+1)).run();
  const response=await mf.dispatchFetch(origin+'/api/content');assert.equal(response.status,200);const {items}=await response.json();
  assert.equal(items.length,2);assert.equal(items.filter(item=>item.publicPreview).length,1);assert.equal(items.find(item=>item.id===ids[1]).requiresLogin,false);assert.equal(items.find(item=>item.id===ids[0]).requiresLogin,true);
  assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM content').first()).n,3);assert.equal((await db.prepare("SELECT value FROM app_settings WHERE key='member_access_v1'").first()).value,'enabled');
 }finally{await mf.dispose();}
});
