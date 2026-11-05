import reminderWorker from '../notifications/worker.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {addInitialLessonChecks} from '../server/lesson-checks.mjs';
import {dispatchNotifications,enqueueRenewals} from '../server/platform.mjs';
const script=(await build({entryPoints:[new URL('../server/worker.mjs',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser'})).outputFiles[0].text;
const origin='https://learning.test',password='isolated platform fixture phrase';
function client(mf,ip='192.0.2.70'){let cookie='';return {async req(path,body,method,headers={}){const binary=body instanceof Uint8Array,r=await mf.dispatchFetch(origin+path,{method:method||(body===undefined?'GET':'POST'),headers:{Origin:origin,Cookie:cookie,'CF-Connecting-IP':ip,...(body!==undefined&&!binary?{'Content-Type':'application/json'}:{}),...headers},...(body===undefined?{}:{body:binary?body:JSON.stringify(body)})});if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r;},async json(path,body,status=200){const r=await this.req(path,body);assert.equal(r.status,status,await r.clone().text());return r.json();}};}
const make=()=>new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password,PAYMENT_MERCHANT_CODE:'0000000',PAYMENT_MERCHANT_NAME:'Isolated Test Merchant'}});

test('class availability, lesson checks, payment alerts, private receipts and school consent work together',async t=>{
 const mf=make(),admin=client(mf),alice=client(mf),bob=client(mf),school=client(mf),otherSchool=client(mf),guest=client(mf);let db,a,b,s,os,lesson,payment;
 async function upload(name,mime,bytes){const data=await admin.json('/api/uploads',{name,mime,size:bytes.length},201);assert.equal((await admin.req('/api/uploads/'+data.id,bytes,'PUT')).status,200);return data.id;}
 try{
  await t.test('register independent student and school accounts',async()=>{
   await admin.json('/api/login',{password});
   a=(await alice.json('/api/learner/signup',{username:'workspace.alice',displayName:'Alice Student',schoolName:'Shared Name School',classLevel:'S1',email:'alice@example.test',phone:'0700000000',password},201)).learner;
   b=(await bob.json('/api/learner/signup',{username:'workspace.bob',displayName:'Bob Student',schoolName:'Shared Name School',classLevel:'S5',password},201)).learner;
   s=(await school.json('/api/learner/signup',{username:'workspace.school',displayName:'School Contact',schoolName:'Shared Name School',accountType:'school',password},201)).learner;
   os=(await otherSchool.json('/api/learner/signup',{username:'workspace.other',displayName:'Other Contact',schoolName:'Shared Name School',accountType:'school',password},201)).learner;
   db=await mf.getD1Database('DB');
  });
  await t.test('counts contain published materials and attached quizzes without leaking answers',async()=>{
   const video=await upload('fixture.mp4','video/mp4',new TextEncoder().encode('0000ftypisom isolated fixture')),cover=await upload('cover.jpg','image/jpeg',new Uint8Array([255,216,255,224,0,1,2,3])),pdf=await upload('fixture.pdf','application/pdf',new TextEncoder().encode('%PDF-1.4 fixture'));
   const base={title:'A topic-specific fixture',status:'published',kind:'lesson',level:'secondary',classLevel:'S1',subject:'Physics',topic:'Fixture',videoAssetId:video,coverAssetId:cover};
   const questions=[{question:'Which option is correct?',options:['First','Second','Third','Fourth'],answer:2,explanation:'The third option is the worked answer in this isolated fixture.'}];
   lesson=(await admin.json('/api/admin/content',{...base,questions})).item;
   await admin.json('/api/admin/content',{...base,title:'Private draft',status:'draft'});
   await admin.json('/api/admin/content',{...base,kind:'pdf',title:'Published notes',videoAssetId:'',pdfAssetId:pdf});
   await admin.json('/api/admin/content',{...base,kind:'quiz',title:'S5 practice',classLevel:'S5',videoAssetId:'',questions});
   const counts=await guest.json('/api/classes');assert.deepEqual(counts.items.find(r=>r.classLevel==='S1'),{classLevel:'S1',videos:1,notes:1,quizzes:1});assert.equal(counts.items.find(r=>r.classLevel==='S5').quizzes,1);
   assert.equal((await alice.req('/api/quiz/'+lesson.id+'/grade',{answers:[2]})).status,403);
   const claimed=await alice.json('/api/learner/free-lessons/'+lesson.id,{});assert.equal(claimed.item.questions.length,1);assert.equal(claimed.item.questions[0].answer,undefined);assert.equal(claimed.item.questions[0].explanation,undefined);
   const submissionId=randomUUID(),graded=await alice.json('/api/quiz/'+lesson.id+'/grade',{answers:[2],submissionId});assert.equal(graded.correct,1);assert.equal(graded.review[0].explanation,questions[0].explanation);
   await alice.json('/api/quiz/'+lesson.id+'/grade',{answers:[0],submissionId});assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM learner_quiz_results').first()).n,1);
   assert.equal((await guest.req('/api/quiz/'+lesson.id+'/grade',{answers:[2]})).status,401);
   assert.equal((await admin.req('/api/admin/content',{...base,questions:[{...questions[0],explanation:''}]})).status,400);
  });
  await t.test('payment notices are transactional, deduplicated and private',async()=>{
   payment=(await alice.json('/api/learner/payments',{plan:'weekly',reference:'PLATFORM-TEST-001',payerName:'<script>Fixture</script>',payerPhone:'0700000000'},201)).payment;
   assert.equal((await guest.req('/api/admin/notifications')).status,401);assert.equal((await bob.req('/api/admin/reports')).status,401);
   const inbox=await alice.json('/api/learner/notifications'),adminInbox=await admin.json('/api/admin/notifications');assert.equal(inbox.items.length,1);assert.equal(adminInbox.unread,1);assert.equal((await bob.json('/api/learner/notifications')).items.length,0);
   await bob.json('/api/learner/notifications/read',{id:inbox.items[0].id});assert.equal((await alice.json('/api/learner/notifications?summary=1')).unread,1);
   assert.equal((await alice.req('/api/learner/notifications/read',{all:true},'POST',{Origin:'https://foreign.test'})).status,403);
   assert.equal((await alice.req('/api/learner/notifications/read',null)).status,400);
   assert.equal((await alice.req('/api/learner/payments/'+payment.id+'/receipt')).status,409);
   const approval={action:'approve',verifiedReceived:true,receivedAmountUGX:10000};const result=await Promise.all([admin.req('/api/admin/payments/'+payment.id+'/review',approval),admin.req('/api/admin/payments/'+payment.id+'/review',approval)]);assert.deepEqual(result.map(r=>r.status).sort(),[200,409]);
   const approved=await alice.json('/api/learner/notifications');assert.equal(approved.items.filter(n=>n.title.startsWith('Payment approved')).length,1);assert.equal((await admin.json('/api/admin/notifications')).unread,0);
  });
  await t.test('a printable download is issued only to the verified payment owner or admin',async()=>{
   const path='/api/learner/payments/'+payment.id+'/receipt';assert.equal((await guest.req(path)).status,401);assert.equal((await bob.req(path)).status,404);assert.equal((await school.req(path)).status,404);
   const receipt=await alice.req(path+'?download=1');assert.equal(receipt.status,200);assert.match(receipt.headers.get('Content-Disposition'),/attachment; filename="VLU-.*\.html"/);assert.match(receipt.headers.get('Cache-Control'),/no-store/);const html=await receipt.text();assert.match(html,/10,000 UGX/);assert.match(html,/&lt;script&gt;Fixture&lt;\/script&gt;/);assert.equal(html.includes('<script>'),false);assert.equal((await admin.req('/api/admin/payments/'+payment.id+'/receipt')).status,200);
  });
  await t.test('matching school names do not grant roster access; only accepted invitations do',async()=>{
   assert.equal((await school.json('/api/learner/school')).summary.students,0);assert.equal((await otherSchool.json('/api/learner/school')).summary.students,0);
   await school.json('/api/learner/school/invite',{usernames:[a.username,b.username]});assert.equal((await school.json('/api/learner/school')).items.length,0);
   const invitation=await alice.json('/api/learner/school');assert.equal(invitation.memberships[0].schoolId,s.id);assert.equal((await guest.req('/api/learner/school')).status,401);
   await alice.json('/api/learner/school/respond',{schoolId:s.id,action:'accept'});const roster=await school.json('/api/learner/school');assert.equal(roster.summary.students,1);assert.equal(roster.summary.covered,1);assert.equal(roster.items[0].username,a.username);assert.equal(roster.items[0].classLevel,'S1');for(const key of ['email','phone','password','recovery','quiz'])assert.equal(JSON.stringify(roster).includes(key),false);
   assert.equal((await otherSchool.json('/api/learner/school')).items.length,0);assert.equal((await alice.req('/api/learner/school/invite',{usernames:[b.username]})).status,403);
   await otherSchool.json('/api/learner/school/invite',{usernames:[b.username]});const responses=await Promise.all([bob.req('/api/learner/school/respond',{schoolId:s.id,action:'accept'}),bob.req('/api/learner/school/respond',{schoolId:os.id,action:'accept'})]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
   await alice.json('/api/learner/school/respond',{schoolId:s.id,action:'leave'});assert.equal((await alice.json('/api/learner/session')).learner.subscription.active,true);assert.equal((await school.json('/api/learner/school')).items.some(r=>r.username===a.username),false);
  });
  await t.test('renewal reminders are issued once per expiry and respect opt-out and renewal',async()=>{
   const now=Date.now();await db.prepare('UPDATE subscription_grants SET expires_at=? WHERE learner_id=?').bind(now+2*86400000,a.id).run();
   let inbox=await alice.json('/api/learner/notifications');assert.equal(inbox.items.filter(n=>n.category==='renewal').length,1);await alice.json('/api/learner/notifications?summary=1');assert.equal((await alice.json('/api/learner/notifications')).items.filter(n=>n.category==='renewal').length,1);
   await db.prepare('UPDATE subscription_grants SET expires_at=? WHERE learner_id=?').bind(now+20*86400000,a.id).run();inbox=await alice.json('/api/learner/notifications');assert.ok(inbox.items.find(n=>n.category==='renewal').readAt);
   await alice.json('/api/learner/notifications/preferences',{channel:'in_app',renewals:false,payments:true});await db.prepare('UPDATE subscription_grants SET expires_at=? WHERE learner_id=?').bind(now+3600000,a.id).run();assert.equal((await alice.json('/api/learner/notifications')).items.filter(n=>n.category==='renewal').length,1);
   assert.equal((await alice.req('/api/learner/notifications/preferences',{channel:'email',renewals:true,payments:true})).status,400);assert.equal((await alice.req('/api/learner/notifications/verify-email',{})).status,503);
  });
  await t.test('reports use approved revenue, private access, and Uganda calendar boundaries',async()=>{
   let report=await admin.json('/api/admin/reports');assert.equal(report.summary.revenue,10000);assert.equal(report.summary.approved,1);assert.equal(report.summary.freeLessons,1);assert.equal(report.summary.active,1);assert.equal(report.summary.expiring,1);assert.equal(report.plans[0].seats,1);
   await db.prepare("UPDATE learners SET created_at='2026-11-03T10:00:00.000Z'").run();await db.prepare("UPDATE learners SET created_at='2026-11-04T22:00:00.000Z' WHERE id=?").bind(a.id).run();await db.prepare("UPDATE learners SET created_at='2026-11-04T20:00:00.000Z' WHERE id=?").bind(b.id).run();report=await admin.json('/api/admin/reports?from=2026-11-05&to=2026-11-05');assert.equal(report.summary.registrations,1);assert.equal(report.days.find(d=>d.date==='2026-11-05').registrations,1);
   assert.equal((await admin.req('/api/admin/reports?from=2026-02-30&to=2026-03-03')).status,400);assert.equal((await admin.req('/api/admin/reports?from=2026-11-06&to=2026-11-05')).status,400);
  });
  await t.test('initial checks fill the existing video topics and preserve educator-authored questions',async()=>{
   const legacy=randomUUID(),authored=randomUUID(),now=new Date().toISOString();
   await db.prepare("INSERT INTO content VALUES(?,'lesson','published',?,?,?)").bind(legacy,JSON.stringify({title:'Existing primary video',classLevel:'P6',subject:'Science',topic:'Blood Circulation'}),now,now).run();
   await db.prepare("INSERT INTO content VALUES(?,'lesson','published',?,?,?)").bind(authored,JSON.stringify({title:'Teacher authored',classLevel:'S1',subject:'Physics',topic:'Heat Transfer',questions:[{question:'Teacher question'}]}),now,now).run();
   await addInitialLessonChecks(db);await addInitialLessonChecks(db);
   assert.equal(JSON.parse((await db.prepare('SELECT data FROM content WHERE id=?').bind(legacy).first()).data).questions.length,4);
   assert.deepEqual(JSON.parse((await db.prepare('SELECT data FROM content WHERE id=?').bind(authored).first()).data).questions,[{question:'Teacher question'}]);
  });
 }finally{await mf.dispose();}
});

test('scheduled email delivery leases, consent checks and provider idempotency survive retries',async()=>{
 const mf=make(),user=client(mf);try{
  const learner=(await user.json('/api/learner/signup',{username:'mail.fixture',displayName:'Mail Fixture',email:'fixture@example.test',classLevel:'S1',password},201)).learner,db=await mf.getD1Database('DB'),now=Date.now();
  const env={DB:db,RESEND_API_KEY:'isolated-test-key',NOTIFICATION_FROM:'Fixture <noreply@example.test>'};
  await db.prepare("INSERT INTO notification_preferences VALUES(?,'email',1,1,?)").bind(learner.id,new Date(now-10000).toISOString()).run();await db.prepare("INSERT INTO notification_contacts VALUES(?,?,'',0,0,?)").bind(learner.id,'fixture@example.test',new Date(now).toISOString()).run();
  const insert=async(id,category='payment',expiry=null)=>db.prepare("INSERT INTO site_notifications(id,owner_id,category,title,body,destination,created_at,dedupe_key,expiry_at) VALUES(?,?,?,'Fixture notice','Isolated delivery test','subscribe',?,?,?)").bind(id,learner.id,category,new Date(now).toISOString(),id,expiry).run();
  const first=randomUUID();await insert(first);const calls=[];const fetcher=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');calls.push(options.headers['Idempotency-Key']);assert.deepEqual(JSON.parse(options.body).to,['fixture@example.test']);return new Response(JSON.stringify({id:'provider-'+calls.length}),{status:200});};
  await Promise.all([dispatchNotifications(env,{now,fetcher}),dispatchNotifications(env,{now,fetcher})]);assert.equal(calls.length,1);await dispatchNotifications(env,{now:now+1000,fetcher});assert.equal(calls.length,1);
  const second=randomUUID();await insert(second);let failedKey;await dispatchNotifications(env,{now,fetcher:async(url,options)=>{failedKey=options.headers['Idempotency-Key'];return new Response('{}',{status:429});}});const retry=await db.prepare('SELECT * FROM notification_deliveries WHERE notification_id=?').bind(second).first();assert.equal(retry.status,'failed');await dispatchNotifications(env,{now:retry.next_at+1,fetcher:async(url,options)=>{assert.equal(options.headers['Idempotency-Key'],failedKey);return new Response('{"id":"retried-provider"}',{status:200});}});assert.equal((await db.prepare('SELECT status FROM notification_deliveries WHERE notification_id=?').bind(second).first()).status,'sent');
  const third=randomUUID();await insert(third);await dispatchNotifications(env,{now,fetcher:async()=>new Response('{}',{status:500})});await db.prepare("UPDATE notification_preferences SET channel='in_app' WHERE learner_id=?").bind(learner.id).run();await dispatchNotifications(env,{now:now+86400000,fetcher:async()=>{assert.fail('Opted-out recipient must not be contacted.');}});assert.equal((await db.prepare('SELECT status FROM notification_deliveries WHERE notification_id=?').bind(third).first()).status,'cancelled');
  const grant=randomUUID();await db.prepare("INSERT INTO subscription_grants VALUES(?,?,'weekly',?,?)").bind(grant,learner.id,now,now+2*86400000).run();await db.prepare("UPDATE notification_preferences SET channel='email' WHERE learner_id=?").bind(learner.id).run();await enqueueRenewals(db,now,learner.id);await dispatchNotifications(env,{now,fetcher:async()=>new Response('{}',{status:500})});await db.prepare('UPDATE subscription_grants SET expires_at=? WHERE payment_id=?').bind(now+20*86400000,grant).run();await dispatchNotifications(env,{now:now+600000,fetcher:async()=>{assert.fail('A renewed subscription must not receive the old reminder.');}});
 }finally{await mf.dispose();}
});


test('scheduled Worker creates renewal notices without exposing a public job endpoint',async()=>{
 const mf=make(),user=client(mf);try{
  const learner=(await user.json('/api/learner/signup',{username:'cron.fixture',displayName:'Cron Fixture',classLevel:'S1',password},201)).learner,db=await mf.getD1Database('DB'),now=Date.now();
  await db.prepare("INSERT INTO subscription_grants VALUES(?,?,'weekly',?,?)").bind(randomUUID(),learner.id,now-5*86400000,now+2*86400000).run();
  assert.equal((await reminderWorker.fetch()).status,404);await reminderWorker.scheduled({}, {DB:db});await reminderWorker.scheduled({}, {DB:db});
  assert.equal((await db.prepare("SELECT COUNT(*) AS n FROM site_notifications WHERE owner_id=? AND category='renewal'").bind(learner.id).first()).n,1);
 }finally{await mf.dispose();}
});
