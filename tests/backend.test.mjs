import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Miniflare} from 'miniflare';
const script=await readFile(new URL('../server/worker.mjs',import.meta.url),'utf8');
const origin='https://learning.example';
const password='isolated-test-password-never-deployed';
function runtime(bindings={ADMIN_PASSWORD:password}){return new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings});}

test('durable content, file access, sessions and quizzes',async t=>{
  const mf=runtime();let cookie='';let pdfId='',draftId='';
  const req=(path,body,options={})=>mf.dispatchFetch(origin+path,{method:options.method || (body===undefined?'GET':'POST'),headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body===undefined||body instanceof Uint8Array?{}:{'Content-Type':'application/json'}),...options.headers},body:body===undefined?undefined:body instanceof Uint8Array?body:JSON.stringify(body)});
  const content={kind:'pdf',status:'draft',title:'Real educator material',description:'Private upload',level:'primary',classLevel:'P7',subject:'Science',topic:'Plant life',teacherName:'Tr Ojok Mtn'};
  try {
    await t.test('starts with an empty catalog and no demo content',async()=>{const r=await req('/api/content');assert.equal(r.status,200);assert.deepEqual(await r.json(),{items:[],access:'free'});});
    await t.test('blocks anonymous, forged and cross-origin writes',async()=>{
      assert.equal((await req('/api/admin/content',content)).status,401);
      assert.equal((await req('/api/admin/content',content,{headers:{Cookie:'vl_admin='+('f'.repeat(64))}})).status,401);
      assert.equal((await req('/api/login',{password},{headers:{Origin:'https://untrusted.example'}})).status,403);
      assert.equal((await req('/api/login',{password:'wrong-password'})).status,401);
    });
    await t.test('authenticates only at the server and issues a secure session',async()=>{const r=await req('/api/login',{password});assert.equal(r.status,200);const header=r.headers.get('set-cookie');for(const attribute of ['HttpOnly','Secure','SameSite=Strict','Path=/api'])assert.ok(header.includes(attribute));cookie=header.split(';')[0];assert.equal((await (await req('/api/session')).json()).authenticated,true);});
    await t.test('validates class levels and rejects missing or fake uploads',async()=>{
      assert.equal((await req('/api/admin/content',{...content,classLevel:'S4'})).status,400);
      assert.equal((await req('/api/admin/content',{...content,status:'published'})).status,400);
      assert.equal((await req('/api/uploads',{name:'file.html',mime:'text/html',size:20})).status,400);
      const fake=await (await req('/api/uploads',{name:'wrong.pdf',mime:'application/pdf',size:10})).json();
      assert.equal((await req('/api/uploads/'+fake.id,new Uint8Array(10),{method:'PUT'})).status,400);
    });
    await t.test('stores an actual PDF and protects it while it is a draft',async()=>{
      const bytes=new TextEncoder().encode('%PDF-1.4\nThis is isolated test data.\n%%EOF');
      const upload=await (await req('/api/uploads',{name:'teacher-notes.pdf',mime:'application/pdf',size:bytes.length})).json();pdfId=upload.id;
      assert.equal((await req('/api/uploads/'+pdfId,bytes,{method:'PUT'})).status,200);
      const saved=await req('/api/admin/content',{...content,pdfAssetId:pdfId});assert.equal(saved.status,200);draftId=(await saved.json()).item.id;
      const adminCookie=cookie;cookie='';assert.equal((await req('/api/media/'+pdfId)).status,404);assert.equal((await (await req('/api/content')).json()).items.length,0);cookie=adminCookie;
    });
    await t.test('publishes durable content for free and supports downloads and seeking',async()=>{
      assert.equal((await req('/api/admin/content',{...content,id:draftId,pdfAssetId:pdfId,status:'published',priceUGX:5000,access:'paid'})).status,200);
      const adminCookie=cookie;cookie='';
      const catalog=await (await req('/api/content')).json();assert.equal(catalog.items.length,1);assert.equal(catalog.items[0].access,'free');assert.equal(catalog.items[0].priceUGX,0);
      const file=await req('/api/media/'+pdfId);assert.equal(file.status,200);assert.equal(file.headers.get('Content-Type'),'application/pdf');assert.ok((await file.text()).startsWith('%PDF-'));
      const range=await req('/api/media/'+pdfId,undefined,{headers:{Range:'bytes=0-4'}});assert.equal(range.status,206);assert.equal(await range.text(),'%PDF-');
      assert.equal((await req('/api/media/'+pdfId,undefined,{headers:{Range:'bytes=999999-'}})).status,416);
      assert.ok((await req('/api/media/'+pdfId+'?download=1')).headers.get('Content-Disposition').startsWith('attachment'));
      cookie=adminCookie;
      const db=await mf.getD1Database('DB');assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM content').first()).n,1);
    });
    await t.test('multipart video upload keeps bytes intact across chunk boundaries',async()=>{
      const size=9*1024*1024;const bytes=new Uint8Array(size);bytes.set([0,0,0,24,102,116,121,112,109,112,52,50]);bytes[size-1]=73;
      const upload=await (await req('/api/uploads',{name:'lesson.mp4',mime:'video/mp4',size})).json();assert.equal(upload.multipart,true);const parts=[];
      for(let offset=0,number=1;offset<size;offset+=upload.chunkSize,number++){const r=await req('/api/uploads/'+upload.id+'/part/'+number,bytes.slice(offset,offset+upload.chunkSize),{method:'PUT'});assert.equal(r.status,200);parts.push(await r.json());}
      assert.equal((await req('/api/uploads/'+upload.id+'/complete',{parts})).status,200);
      const saved=await req('/api/admin/content',{...content,kind:'lesson',title:'Uploaded video',status:'published',videoAssetId:upload.id});assert.equal(saved.status,200);
      const video=await req('/api/media/'+upload.id,undefined,{headers:{Range:'bytes='+String(size-1)+'-'}});assert.equal(video.status,206);assert.deepEqual(new Uint8Array(await video.arrayBuffer()),new Uint8Array([73]));
    });
    await t.test('quiz answer keys stay private until server-side marking',async()=>{
      const saved=await req('/api/admin/content',{...content,kind:'quiz',title:'Teacher-authored practice',status:'published',questions:[{question:'How many?',options:['one','two','three','four'],answer:2,explanation:'Teacher-reviewed explanation.'}]});assert.equal(saved.status,200);const quiz=(await saved.json()).item;
      const adminCookie=cookie;cookie='';const publicItem=(await (await req('/api/content')).json()).items.find(x=>x.id===quiz.id);assert.deepEqual(Object.keys(publicItem.questions[0]).sort(),['options','question']);
      const marks=await (await req('/api/quiz/'+quiz.id+'/grade',{answers:[2]})).json();assert.equal(marks.correct,1);assert.equal(marks.total,1);assert.equal(marks.review[0].answer,2);cookie=adminCookie;
    });
    await t.test('unpublishing revokes public file access and logout invalidates the session',async()=>{
      assert.equal((await req('/api/admin/content',{...content,id:draftId,pdfAssetId:pdfId,status:'draft'})).status,200);
      assert.equal((await req('/api/media/'+pdfId,undefined,{headers:{Cookie:''}})).status,404);
      assert.equal((await req('/api/logout',{})).status,200);assert.equal((await req('/api/admin/content')).status,401);
    });
    await t.test('rate limits repeated password guesses',async()=>{let response;for(let i=0;i<11;i++)response=await req('/api/login',{password:'incorrect'},{headers:{'CF-Connecting-IP':'rate-limit-test'}});assert.equal(response.status,429);});
  }finally{await mf.dispose();}
});
test('admin setup fails closed without a configured password',async()=>{const mf=runtime({});try{const status=await (await mf.dispatchFetch(origin+'/api/status')).json();assert.equal(status.adminConfigured,false);const r=await mf.dispatchFetch(origin+'/api/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'admin'})});assert.equal(r.status,503);}finally{await mf.dispose();}});

for (const [label,value,issue] of [['short','test-only-short','too_short'],['long','x'.repeat(257),'too_long']]) {
  test('reports '+label+' password setup without exposing it',async()=>{const mf=runtime({ADMIN_PASSWORD:value});try{const response=await mf.dispatchFetch(origin+'/api/status');const raw=await response.text();const status=JSON.parse(raw);assert.equal(status.adminConfigured,false);assert.equal(status.adminSetupIssue,issue);assert.equal(raw.includes(value),false);const session=await (await mf.dispatchFetch(origin+'/api/session')).json();assert.equal(session.configured,false);assert.equal(session.setupIssue,issue);}finally{await mf.dispose();}});
}
