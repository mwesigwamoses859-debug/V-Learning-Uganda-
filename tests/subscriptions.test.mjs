import {build} from 'esbuild';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Miniflare} from 'miniflare';
const script=(await build({entryPoints:[new URL('../server/worker.mjs',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser'})).outputFiles[0].text;
const origin='https://learning.test',password='isolated billing fixture phrase';
function client(mf){let cookie='';return {async req(path,body,method,headers={}){const binary=body instanceof Uint8Array;const r=await mf.dispatchFetch(origin+path,{method:method||(body===undefined?'GET':'POST'),headers:{Origin:origin,Cookie:cookie,'CF-Connecting-IP':'192.0.2.14',...(body===undefined||binary?{}:{'Content-Type':'application/json'}),...headers},...(body===undefined?{}:{body:binary?body:JSON.stringify(body)})});if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return r;}};}
test('manual payments grant the paid duration only after verified, atomic administrator approval',async t=>{
 const mf=new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:password,PAYMENT_MERCHANT_CODE:'0000000',PAYMENT_MERCHANT_NAME:'Isolated Test Merchant',PAYMENT_QR_READY:'true'}});
 const admin=client(mf),alice=client(mf),bob=client(mf),school=client(mf),guest=client(mf);let db,aliceId,bobId,schoolId,video,pdf,preview,quiz,weekly,schoolPayment;
 const payment={plan:'weekly',reference:'AIRTEL-TEST-001',payerName:'Isolated Test Payer',payerPhone:'0700123456'};
 async function state(user=alice){return (await (await user.req('/api/learner/subscription')).json());}
 async function submit(user,input){const r=await user.req('/api/learner/payments',input);assert.equal(r.status,201,await r.clone().text());return (await r.json()).payment;}
 async function approve(p){const r=await admin.req(`/api/admin/payments/${p.id}/review`,{action:'approve',verifiedReceived:true,receivedAmountUGX:p.amountUGX});assert.equal(r.status,200,await r.clone().text());}
 async function upload(name,mime,bytes){const r=await admin.req('/api/uploads',{name,mime,size:bytes.length});assert.equal(r.status,201);const {id}=await r.json();assert.equal((await admin.req('/api/uploads/'+id,bytes,'PUT')).status,200);return id;}
 try{
  await t.test('plans have the requested prices and public payment destination',async()=>{
   const plans=await (await guest.req('/api/plans')).json();assert.equal(plans.plans.weekly.amountUGX,10000);assert.equal(plans.plans.weekly.days,7);assert.equal(plans.plans.monthly.amountUGX,30000);assert.equal(plans.plans.monthly.days,30);assert.equal(plans.plans.school.amountUGX,20000);assert.equal(plans.merchant.code,'0000000');
   assert.equal(plans.merchant.qr,'/api/payment-qr');assert.equal((await guest.req('/api/payment-qr')).status,404);
   const bucket=await mf.getR2Bucket('MEDIA');await bucket.put('payments/merchant-qr.jpeg',new Uint8Array([255,216,255,0]));
   const qr=await guest.req('/api/payment-qr');assert.equal(qr.status,200);assert.equal(qr.headers.get('Content-Type'),'image/jpeg');
   assert.equal((await guest.req('/api/learner/payments',payment)).status,401);assert.equal((await guest.req('/api/admin/payments')).status,401);
   for(const [user,name,cls] of [[alice,'billing.alice','S1'],[bob,'billing.bob','S5'],[school,'billing.school','S6']]){const r=await user.req('/api/learner/signup',{username:name,displayName:name,classLevel:cls,password});assert.equal(r.status,201);assert.equal((await r.json()).learner.subscription.active,false);}
   await admin.req('/api/login',{password});db=await mf.getD1Database('DB');
   aliceId=(await db.prepare("SELECT id FROM learners WHERE username='billing.alice'").first()).id;bobId=(await db.prepare("SELECT id FROM learners WHERE username='billing.bob'").first()).id;schoolId=(await db.prepare("SELECT id FROM learners WHERE username='billing.school'").first()).id;
   video=await upload('private.mp4','video/mp4',new TextEncoder().encode('0000ftypisom private video'));pdf=await upload('private.pdf','application/pdf',new TextEncoder().encode('%PDF-1.4 private notes'));
   preview=await upload('preview.mp4','video/mp4',new TextEncoder().encode('0000ftypisom preview only'));
   const cover=await upload('cover.jpg','image/jpeg',new Uint8Array([255,216,255,224,0,0,1,2]));
   const base={status:'published',title:'Isolated billing fixture',level:'secondary',classLevel:'S1',subject:'Physics',description:'Full protected description. '.repeat(30)};
   for(const entry of [{...base,kind:'lesson',videoAssetId:video,pdfAssetId:pdf,coverAssetId:cover},{...base,kind:'lesson',publicPreview:true,videoAssetId:preview,coverAssetId:cover},{...base,kind:'quiz',questions:[{question:'Protected question?',options:['a','b','c','d'],answer:1}]}]){const r=await admin.req('/api/admin/content',entry);assert.equal(r.status,200,await r.clone().text());const item=(await r.json()).item;if(item.kind==='quiz')quiz=item.id;}
  });
  await t.test('an account or a pending reference cannot unlock content or submit marks',async()=>{
   assert.equal((await guest.req('/api/media/'+preview)).status,200);
   for(const id of [video,pdf])assert.equal((await alice.req('/api/media/'+id)).status,403);
   assert.equal((await alice.req('/api/quiz/'+quiz+'/grade',{answers:[1]})).status,403);
   weekly=await submit(alice,{...payment,amountUGX:1,seats:200,learnerId:bobId,status:'approved'});assert.equal(weekly.amountUGX,10000);assert.equal(weekly.seats,1);assert.equal(weekly.status,'pending');assert.equal((await state()).subscription.active,false);
   assert.equal((await alice.req('/api/admin/payments')).status,401);assert.equal((await bob.req('/api/learner/payments',{...payment,reference:'airtel test 001'})).status,409);assert.equal((await state(bob)).payments.length,0);
   assert.equal((await alice.req('/api/admin/payments/'+weekly.id+'/review',{action:'approve',verifiedReceived:true,receivedAmountUGX:10000})).status,401);
   const list=await (await admin.req('/api/admin/payments')).json();assert.equal(list.items[0].beneficiaries[0].username,'billing.alice');assert.equal(list.items[0].payerPhone,'0700123456');assert.equal(JSON.stringify(list).includes('password_hash'),false);
   assert.equal((await alice.req('/api/media/'+video)).status,403);
  });
  await t.test('verification is mandatory and concurrent approvals grant exactly seven days once',async()=>{
   for(const input of [{action:'approve',receivedAmountUGX:10000},{action:'approve',verifiedReceived:true,receivedAmountUGX:9999}])assert.equal((await admin.req('/api/admin/payments/'+weekly.id+'/review',input)).status,400);
   const input={action:'approve',verifiedReceived:true,receivedAmountUGX:10000};const responses=await Promise.all([admin.req('/api/admin/payments/'+weekly.id+'/review',input),admin.req('/api/admin/payments/'+weekly.id+'/review',input)]);assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
   const grants=(await db.prepare('SELECT * FROM subscription_grants WHERE payment_id=?').bind(weekly.id).all()).results;assert.equal(grants.length,1);assert.equal(grants[0].learner_id,aliceId);assert.equal(grants[0].expires_at-grants[0].starts_at,7*86400000);
   assert.equal((await state()).subscription.active,true);assert.equal((await state(bob)).subscription.active,false);
   const paid=(await (await alice.req('/api/content')).json()).items.find(i=>i.kind==='quiz');assert.equal(paid.requiresSubscription,false);assert.equal(paid.questions[0].answer,undefined);assert.equal((await alice.req('/api/media/'+video)).status,200);assert.equal((await alice.req('/api/quiz/'+quiz+'/grade',{answers:[1]})).status,200);
  });
  await t.test('monthly renewals extend remaining paid time and replaying a reference adds nothing',async()=>{
   const previous=Date.parse((await state()).subscription.expiresAt);const monthly=await submit(alice,{...payment,plan:'monthly',reference:'AIRTEL-TEST-MONTH'});assert.equal(monthly.amountUGX,30000);await approve(monthly);assert.equal(Date.parse((await state()).subscription.expiresAt),previous+30*86400000);
   assert.equal((await alice.req('/api/learner/payments',{...payment,plan:'school',schoolName:'A School',usernames:['billing.alice','billing.bob']})).status,409);
  });
  await t.test('school rosters validate registered unique learners and charge per actual student',async()=>{
   const input={...payment,plan:'school',reference:'AIRTEL-TEST-SCHOOL',schoolName:'Isolated Test School'};
   for(const usernames of [['billing.alice'],['billing.alice','BILLING.ALICE'],['billing.alice','missing.student']])assert.equal((await school.req('/api/learner/payments',{...input,usernames})).status,400);
   assert.equal((await school.req('/api/learner/payments',{...input,plan:['monthly']})).status,400);
   assert.equal((await school.req('/api/learner/payments',{...input,usernames:['billing.alice','billing.bob']},'POST',{Origin:'https://foreign.test'})).status,403);
   schoolPayment=await submit(school,{...input,usernames:['BILLING.ALICE','billing.bob'],amountUGX:20000,seats:1});assert.equal(schoolPayment.seats,2);assert.equal(schoolPayment.amountUGX,40000);const before=Date.parse((await state()).subscription.expiresAt);await approve(schoolPayment);
   const grants=(await db.prepare('SELECT * FROM subscription_grants WHERE payment_id=? ORDER BY learner_id').bind(schoolPayment.id).all()).results;assert.equal(grants.length,2);assert.deepEqual(grants.map(g=>g.learner_id).sort(),[aliceId,bobId].sort());assert.equal(Date.parse((await state()).subscription.expiresAt),before+30*86400000);assert.equal((await state(bob)).subscription.active,true);assert.equal((await state(school)).subscription.active,false,'only named beneficiaries receive access');
  });
  await t.test('a rejected payment never grants access and its review is private to its owner',async()=>{
   const p=await submit(school,{...payment,plan:'monthly',reference:'AIRTEL-TEST-REJECT'});
   assert.equal((await admin.req('/api/admin/payments/'+p.id+'/review',{action:'reject',note:''})).status,400);
   assert.equal((await admin.req('/api/admin/payments/'+p.id+'/review',{action:'reject',note:'Reference not found in merchant statement.'})).status,200);assert.equal((await state(school)).payments[0].reviewNote,'Reference not found in merchant statement.');assert.equal((await state(school)).subscription.active,false);
   assert.equal((await admin.req('/api/admin/payments/'+p.id+'/review',{action:'approve',verifiedReceived:true,receivedAmountUGX:30000})).status,409);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM subscription_grants WHERE learner_id=?').bind(schoolId).first()).n,0);
   assert.equal(JSON.stringify(await state(bob)).includes('AIRTEL-TEST-REJECT'),false);
  });
  await t.test('expiry removes protected catalog, direct files, ranges, downloads and quiz access',async()=>{
   await db.prepare('UPDATE subscription_grants SET starts_at=?,expires_at=? WHERE learner_id=?').bind(Date.now()-86400000,Date.now()-1,aliceId).run();assert.equal((await state()).subscription.active,false);
   const items=(await (await alice.req('/api/content')).json()).items,locked=items.find(i=>i.kind==='quiz');assert.equal(locked.requiresLogin,false);assert.equal(locked.requiresSubscription,true);assert.deepEqual(locked.questions,[]);assert.equal((await (await alice.req('/api/learner/session')).json()).learner.subscription.active,false);
   for(const id of [pdf,video])for(const [method,suffix,headers] of [['GET','',{}],['HEAD','',{}],['GET','?download=1',{}],['GET','',{Range:'bytes=0-4'}]])assert.equal((await alice.req('/api/media/'+id+suffix,undefined,method,headers)).status,403);
   assert.equal((await alice.req('/api/quiz/'+quiz+'/grade',{answers:[1]})).status,403);assert.equal((await alice.req('/api/media/'+preview)).status,200);assert.equal((await admin.req('/api/media/'+video)).status,200);assert.equal((await alice.req('/api/learner/results')).status,200,'old personal results are retained');assert.equal((await bob.req('/api/media/'+video)).status,200,'other subscribers retain access');
  });
 }finally{await mf.dispose();}
});

test('payment submission fails closed until the owner configures a merchant destination',async()=>{
 const mf=new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA']});const user=client(mf);
 try{
  const plans=await (await user.req('/api/plans')).json();assert.equal(plans.merchant.ready,false);assert.equal(plans.merchant.code,'');assert.equal(plans.merchant.qr,'');assert.equal((await user.req('/api/payment-qr')).status,404);
  await user.req('/api/learner/signup',{username:'unconfigured.student',displayName:'Fixture',classLevel:'S1',password});
  assert.equal((await user.req('/api/learner/payments',{plan:'monthly',reference:'TEST-NOT-CONFIGURED',payerName:'Fixture',payerPhone:'0700000000'})).status,503);
  const db=await mf.getD1Database('DB');assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM payment_requests').first()).n,0);
 }finally{await mf.dispose();}
});
