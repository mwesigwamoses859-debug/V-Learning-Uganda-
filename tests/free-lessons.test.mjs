import {build} from 'esbuild';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Miniflare} from 'miniflare';
const script=(await build({entryPoints:[new URL('../server/worker.mjs',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser'})).outputFiles[0].text;
const origin='https://learning.test',password='isolated five free lessons fixture';
function client(mf){let cookie='';return {async req(path,body,method,extra={}){const binary=body instanceof Uint8Array;const r=await mf.dispatchFetch(origin+path,{method:method||(body===undefined?'GET':'POST'),headers:{Origin:origin,Cookie:cookie,'CF-Connecting-IP':'192.0.2.199',...(body===undefined||binary?{}:{'Content-Type':'application/json'}),...extra},...(body===undefined?{}:{body:binary?body:JSON.stringify(body)})});if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r;}};}
async function expect(r,status){assert.equal(r.status,status,await r.clone().text());if(r.headers.get('Content-Type')?.includes('application/json'))return r.json();return null;}
test('registration places students in S.1–S.6 and saves school accounts separately',async()=>{
 const mf=new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB','SCHOOL_DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password}});
 try{
  const school=await mf.getD1Database('SCHOOL_DB');await school.prepare('CREATE TABLE students(id TEXT PRIMARY KEY,payload TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL)').run();
  const aliases=['S.1','s2',' Senior 3 ','Secondary Four','S5','Senior Six'];
  for(let i=0;i<6;i++){const user=client(mf),d=await expect(await user.req('/api/learner/signup',{username:'placement.s'+(i+1),password,displayName:'Placement '+(i+1),classLevel:aliases[i],schoolName:'Fixture Secondary'}),201);
   assert.equal(d.learner.classLevel,'S'+(i+1));assert.equal(d.learner.trial.remaining,5);
   const row=await school.prepare('SELECT payload FROM students WHERE id=?').bind('vl-'+d.learner.id).first();assert.ok(row);assert.equal(JSON.parse(row.payload).className,'S.'+(i+1));
  }
  const coordinator=client(mf),d=await expect(await coordinator.req('/api/learner/signup',{username:'placement.school',password,displayName:'School Contact',accountType:'school',schoolName:'Fixture School',classLevel:'S1'}),201);
  assert.equal(d.learner.accountType,'school');assert.equal(d.learner.classLevel,'');assert.equal(d.learner.trial.remaining,5);
  assert.equal((await school.prepare('SELECT school_name FROM vlearning_schools WHERE account_id=?').bind(d.learner.id).first()).school_name,'Fixture School');
  assert.equal((await school.prepare('SELECT COUNT(*) AS n FROM students').first()).n,6,'school coordinators are not fabricated student records');
  const invalid=client(mf);await expect(await invalid.req('/api/learner/signup',{username:'placement.missing',displayName:'Missing Class',password}),400);
  await expect(await invalid.req('/api/learner/signup',{username:'placement.invalid',displayName:'Invalid Class',password,classLevel:'S7'}),400);
 }finally{await mf.dispose();}
});
test('five distinct video lessons are granted atomically, remain replayable, and cannot unlock a sixth or PDFs',async()=>{
 const mf=new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password}});
 const admin=client(mf),student=client(mf),other=client(mf),coordinator=client(mf),guest=client(mf);
 try{
  await expect(await admin.req('/api/login',{password}),200);
  for(const [user,name,accountType] of [[student,'trial.student','student'],[other,'trial.other','student'],[coordinator,'trial.school','school']])await expect(await user.req('/api/learner/signup',{username:name,password,displayName:name,classLevel:'S3',schoolName:'Trial Fixture School',accountType}),201);
  async function upload(name,mime,bytes){const d=await expect(await admin.req('/api/uploads',{name,mime,size:bytes.length}),201);await expect(await admin.req('/api/uploads/'+d.id,bytes,'PUT'),200);return d.id;}
  const cover=await upload('cover.jpg','image/jpeg',new Uint8Array([255,216,255,0,1,2])),pdf=await upload('notes.pdf','application/pdf',new TextEncoder().encode('%PDF-1.4 fixture'));
  const lessons=[];
  for(let i=0;i<6;i++){const video=await upload('video'+i+'.mp4','video/mp4',new TextEncoder().encode('0000ftypisom fixture '+i));const d=await expect(await admin.req('/api/admin/content',{kind:'lesson',status:'published',title:'Free lesson fixture '+i,description:'Fixture protected video',level:'secondary',classLevel:'S3',subject:'Physics',videoAssetId:video,pdfAssetId:pdf,coverAssetId:cover}),200);lessons.push({...d.item,video});}
  const published=(await expect(await student.req('/api/content'),200)).items;
  assert.equal(published.filter(i=>i.trialAvailable).length,6);assert.ok(published.every(i=>!i.videoAssetId),'listing the catalog must not consume a place or reveal an unclaimed video');
  await expect(await student.req('/api/media/'+lessons[0].video),403);
  await expect(await guest.req('/api/learner/free-lessons/'+lessons[0].id,{}),401);
  await expect(await student.req('/api/learner/free-lessons/'+lessons[0].id,{},undefined,{Origin:'https://untrusted.test'}),403);
  const responses=await Promise.all(lessons.map(l=>student.req('/api/learner/free-lessons/'+l.id,{})));assert.deepEqual(responses.map(r=>r.status).sort(),[200,200,200,200,200,403]);
  const state=await expect(await student.req('/api/learner/session'),200);assert.equal(state.learner.trial.used,5);assert.equal(state.learner.trial.remaining,0);
  const items=(await expect(await student.req('/api/content'),200)).items,claimed=items.filter(i=>i.freeLesson),locked=items.find(i=>i.requiresSubscription);assert.equal(claimed.length,5);assert.ok(locked);
  for(const item of claimed){assert.ok(item.videoAssetId);await expect(await student.req('/api/learner/free-lessons/'+item.id,{}),200);assert.equal((await student.req('/api/media/'+item.videoAssetId,undefined,'GET',{Range:'bytes=0-4'})).status,206);assert.equal((await student.req('/api/media/'+item.videoAssetId,undefined,'HEAD')).status,200);}
  await expect(await student.req('/api/learner/free-lessons/'+locked.id,{}),403);await expect(await student.req('/api/media/'+pdf),403);
  assert.equal((await expect(await other.req('/api/learner/session'),200)).learner.trial.remaining,5);
  await expect(await other.req('/api/media/'+claimed[0].videoAssetId),403);
  await expect(await coordinator.req('/api/learner/free-lessons/'+claimed[0].id,{}),200);
  assert.equal((await expect(await coordinator.req('/api/learner/session'),200)).learner.trial.remaining,4);
  assert.equal((await expect(await student.req('/api/learner/session'),200)).learner.trial.used,5,'replays do not consume or reset the allowance');
 }finally{await mf.dispose();}
});
