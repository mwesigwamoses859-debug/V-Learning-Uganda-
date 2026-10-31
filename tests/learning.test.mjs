import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {Miniflare} from 'miniflare';
const script=await readFile(new URL('../server/worker.mjs',import.meta.url),'utf8');
const origin='https://learning.example';
const password='isolated expansion test phrase';
function client(mf){let cookie='';return {async req(path,body,method,extra={}){const binary=body instanceof Uint8Array;const r=await mf.dispatchFetch(origin+path,{method:method||(body===undefined?'GET':'POST'),headers:{Origin:origin,...(cookie?{Cookie:cookie}:{}),...(body===undefined||binary?{}:{'Content-Type':'application/json'}),...extra},...(body===undefined?{}:{body:binary?body:JSON.stringify(body)})});if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r;}};}

test('saved learning, revision, notices, school bookings and management use real private records',async t=>{
 const mf=new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password}});
 const admin=client(mf),alice=client(mf),bob=client(mf),guest=client(mf);let db,video,low,pdf,lesson,quiz,event;
 const base={kind:'lesson',status:'published',title:'Isolated teacher lesson',description:'Fixture used only in this test runtime',level:'primary',classLevel:'P7',subject:'Science',topic:'Plants',teacherName:'Teacher'};
 async function upload(name,mime,size){const bytes=new Uint8Array(size);bytes.set(new TextEncoder().encode(mime==='application/pdf'?'%PDF-1.4\n':'0000ftypisom'));const r=await admin.req('/api/uploads',{name,mime,size});assert.equal(r.status,201);const {id}=await r.json();assert.equal((await admin.req('/api/uploads/'+id,bytes,'PUT')).status,200);return id;}
 async function save(input){const r=await admin.req('/api/admin/content',input);assert.equal(r.status,200,JSON.stringify(await r.clone().json()));return (await r.json()).item;}
 try{
  assert.equal((await admin.req('/api/login',{password})).status,200);
  for(const [user,name,cls] of [[alice,'learning.alice','P7'],[bob,'learning.bob','S4']])assert.equal((await user.req('/api/learner/signup',{username:name,displayName:name.split('.')[1],classLevel:cls,password})).status,201);
  db=await mf.getD1Database('DB');video=await upload('lesson.mp4','video/mp4',1200);low=await upload('smaller.mp4','video/mp4',400);pdf=await upload('real-upload.pdf','application/pdf',300);
  lesson=await save({...base,videoAssetId:video,lowDataVideoAssetId:low,pdfAssetId:pdf});
  quiz=await save({...base,kind:'quiz',title:'Private result fixture',questions:[{question:'First?',options:['A','B','C','D'],answer:0,explanation:'First explanation'},{question:'Second?',options:['A','B','C','D'],answer:1,explanation:'Second explanation'}]});
  await t.test('file sizes describe only real published media and lower-data upload must be smaller',async()=>{
   const items=(await (await guest.req('/api/content')).json()).items;const item=items.find(i=>i.id===lesson.id);assert.equal(item.mediaInfo[video].size,1200);assert.equal(item.mediaInfo[low].size,400);
   assert.equal((await guest.req('/api/media/'+low)).status,200);
   assert.equal((await admin.req('/api/admin/content',{...base,videoAssetId:low,lowDataVideoAssetId:video})).status,400);
   assert.equal((await admin.req('/api/admin/content',{...base,videoAssetId:video,lowDataVideoAssetId:video})).status,400);
  });
  await t.test('bookmarks and cross-device positions stay with the signed-in learner',async()=>{
   assert.equal((await guest.req('/api/learner/bookmarks/'+lesson.id,{saved:true})).status,401);
   assert.equal((await alice.req('/api/learner/bookmarks/'+lesson.id,{saved:true,learnerId:'not-the-owner'})).status,200);
   assert.equal((await alice.req('/api/learner/progress/'+lesson.id,{videoAssetId:video,position:42,duration:100})).status,200);
   const secondDevice=client(mf);assert.equal((await secondDevice.req('/api/learner/login',{username:'learning.alice',password})).status,200);
   const saved=await (await secondDevice.req('/api/learner/item/'+lesson.id)).json();assert.equal(saved.saved,true);assert.equal(saved.progress.position,42);
   assert.equal((await (await bob.req('/api/learner/item/'+lesson.id)).json()).progress,null);
   assert.equal((await (await bob.req('/api/learner/library')).json()).saved.length,0);
   assert.equal((await alice.req('/api/learner/progress/'+lesson.id,{videoAssetId:video,position:101,duration:50})).status,400);
   await alice.req('/api/learner/progress/'+lesson.id,{videoAssetId:video,position:95,duration:100});
   await alice.req('/api/learner/progress/'+lesson.id,{videoAssetId:video,position:12,duration:100});
   assert.equal((await (await alice.req('/api/learner/library')).json()).completed,1);
  });
  await t.test('unpublishing and replacing a video revoke stale saved learning and resume data',async()=>{
   await save({...lesson,status:'draft'});
   assert.equal((await (await alice.req('/api/learner/library')).json()).saved.length,0);
   assert.equal((await alice.req('/api/learner/item/'+lesson.id)).status,404);
   assert.equal((await guest.req('/api/media/'+low)).status,404);
   await save({...lesson,videoAssetId:low,lowDataVideoAssetId:''});
   assert.equal((await (await alice.req('/api/learner/item/'+lesson.id)).json()).progress,null);
   assert.equal((await alice.req('/api/learner/progress/'+lesson.id,{videoAssetId:video,position:42,duration:100})).status,409);
   await save(lesson);
  });
  await t.test('quiz scores are server-marked, idempotent, private and retain reviewed questions',async()=>{
   await guest.req('/api/quiz/'+quiz.id+'/grade',{answers:[0,0]});
   assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM learner_quiz_results').first()).n,0);
   const submissionId=randomUUID(),input={answers:[0,0],submissionId,correct:100,quizUpdatedAt:quiz.updatedAt};
   const results=await Promise.all([alice.req('/api/quiz/'+quiz.id+'/grade',input),alice.req('/api/quiz/'+quiz.id+'/grade',input)]);
   for(const r of results){assert.equal(r.status,200);const data=await r.json();assert.equal(data.correct,1);assert.equal(data.saved,true);}
   const history=await (await alice.req('/api/learner/results')).json();assert.equal(history.summary.attempts,1);assert.equal(history.summary.best,50);assert.equal(history.revisionTopics[0].topic,'Plants');assert.equal(history.attempts[0].review,undefined);const detail=await (await alice.req('/api/learner/results/'+history.attempts[0].id)).json();assert.equal(detail.attempt.review[0].question,'First?');assert.equal((await bob.req('/api/learner/results/'+history.attempts[0].id)).status,404);
   assert.equal((await (await bob.req('/api/learner/results')).json()).summary.attempts,0);
   assert.equal((await guest.req('/api/learner/results')).status,401);
   assert.equal((await alice.req('/api/quiz/'+quiz.id+'/grade',{answers:[0,1],quizUpdatedAt:'old-version'})).status,409);
   await save({...quiz,title:'Updated after attempt',questions:[{question:'Changed?',options:['1','2','3','4'],answer:3}]});
   const old=await (await alice.req('/api/learner/results')).json();assert.equal(old.attempts[0].title,'Private result fixture');assert.equal(old.attempts[0].total,2);
  });
  await t.test('revision metadata validates exam class, year and real attached documents',async()=>{
   const paper=await save({...base,kind:'pdf',pdfAssetId:pdf,title:'Teacher paper fixture',examType:'PLE',examYear:2025,revisionType:'paper'});assert.equal(paper.examYear,2025);
   for(const extra of [{examType:'UCE'},{examYear:1800},{kind:'lesson',videoAssetId:video,revisionType:'answers'}])assert.equal((await admin.req('/api/admin/content',{...paper,id:undefined,...extra})).status,400);
   const published=(await (await guest.req('/api/content')).json()).items;assert.equal(published.filter(i=>i.examType==='PLE').length,1);
  });
  await t.test('student management is admin-only and never includes credential material',async()=>{
   assert.equal((await alice.req('/api/admin/learners')).status,401);
   const r=await admin.req('/api/admin/learners?class=P7&q=alice');assert.equal(r.status,200);const raw=await r.text(),data=JSON.parse(raw);assert.equal(data.items.length,1);assert.equal(data.items[0].username,'learning.alice');assert.equal(data.totals.total,2);assert.ok(data.items[0].lastLogin);
   for(const field of ['password_hash','recovery_hash','credential_version','token_hash'])assert.equal(raw.includes(field),false);
   assert.equal((await admin.req('/api/admin/learners?class=P8')).status,400);
  });
  await t.test('announcements honour drafts, expiry, audience validation and pinning',async()=>{
   assert.equal((await alice.req('/api/admin/announcements',{title:'Forged',body:'Forged notice'})).status,401);
   for(const input of [{title:'Live school notice',body:'Teacher-reviewed announcement',level:'primary',classLevel:'P7',pinned:true,status:'published'}, {title:'Private draft',body:'Not public',status:'draft'}, {title:'Expired notice',body:'Not active',status:'published',expiresOn:'2020-01-01'}])assert.equal((await admin.req('/api/admin/announcements',input)).status,200);
   const notices=await (await guest.req('/api/announcements')).json();assert.equal(notices.items.length,1);assert.equal(notices.items[0].classLevel,'P7');assert.equal(notices.items[0].pinned,true);
   assert.equal((await admin.req('/api/admin/announcements',{title:'Invalid',body:'Wrong class',level:'primary',classLevel:'S4'})).status,400);
   assert.equal((await admin.req('/api/admin/announcements',{title:'Invalid',body:'Wrong date',expiresOn:'2026-02-31'})).status,400);
   assert.equal((await admin.req('/api/admin/announcements',{},undefined,{Origin:'https://untrusted.example'})).status,403);
  });
  await t.test('event capacity is reserved atomically and school contact details remain private',async()=>{
   event=await save({...base,kind:'event',level:'all',classLevel:'',date:'2099-12-15',time:'10:00',eventType:'Quiz',registrationOpen:true,registrationCapacity:4});
   const payload={schoolName:'Isolated school',teamName:'Fixture team',contactName:'Teacher contact',phone:'+256 700 000000',participants:3};
   const responses=await Promise.all([alice.req('/api/learner/registrations/'+event.id,payload),bob.req('/api/learner/registrations/'+event.id,payload)]);assert.deepEqual(responses.map(r=>r.status).sort(),[201,409]);
   const attendee=await (await admin.req('/api/admin/registrations?eventId='+event.id)).json();assert.equal(attendee.items.length,1);assert.equal(attendee.items[0].participants,3);
   assert.equal((await guest.req('/api/admin/registrations?eventId='+event.id)).status,401);
   const publicRaw=await (await guest.req('/api/content')).text();assert.equal(publicRaw.includes('Teacher contact'),false);assert.equal(publicRaw.includes('+256 700'),false);assert.equal(JSON.parse(publicRaw).items.find(i=>i.id===event.id).registeredParticipants,3);
   const aliceRows=(await (await alice.req('/api/learner/registrations')).json()).items,bobRows=(await (await bob.req('/api/learner/registrations')).json()).items;assert.equal(aliceRows.length+bobRows.length,1);
   const owner=aliceRows.length?alice:bob,nonOwner=aliceRows.length?bob:alice,registration=attendee.items[0];
   assert.equal((await nonOwner.req('/api/learner/registrations/'+event.id+'/cancel',{})).status,404);
   assert.equal((await owner.req('/api/learner/registrations/'+event.id,payload)).status,409);
   assert.equal((await owner.req('/api/admin/registrations/'+registration.id,{attended:true})).status,401);
   assert.equal((await admin.req('/api/admin/registrations/'+registration.id,{attended:true})).status,200);
   assert.equal((await owner.req('/api/learner/registrations/'+event.id+'/cancel',{})).status,200);
   assert.equal((await nonOwner.req('/api/learner/registrations/'+event.id,payload)).status,201);
   await save({...event,registrationOpen:false});assert.equal((await owner.req('/api/learner/registrations/'+event.id,payload)).status,409);
  });
 }finally{await mf.dispose();}
});
