import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
const script=(await build({entryPoints:[new URL('../server/worker.mjs',import.meta.url).pathname],bundle:true,write:false,format:'esm',platform:'browser'})).outputFiles[0].text;
const origin='https://learning.test';
function runtime(connected=true){return new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:connected?['DB','SCHOOL_DB']:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:'isolated administrator test phrase'}});}
function client(mf){let cookie='';return{async request(path,body){const response=await mf.dispatchFetch(origin+path,{method:body===undefined?'GET':'POST',headers:{Origin:origin,'CF-Connecting-IP':'192.0.2.70',Cookie:cookie,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});if(response.headers.has('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];return response;}};}
async function schoolSetup(mf){const db=await mf.getD1Database('SCHOOL_DB');await db.prepare('CREATE TABLE students(id TEXT PRIMARY KEY,payload TEXT NOT NULL,created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL)').run();return db;}
const signup=(name='learner.one')=>({username:name,password:'a distinct private learner phrase',displayName:'Same Student Name',classLevel:'S2',schoolName:'A real school',phone:'+256 700 123456',email:'student@example.test'});
test('registrations and distinct marked attempts arrive in school without exposing credentials',async()=>{
 const mf=runtime(),learner=client(mf),other=client(mf),admin=client(mf);try{
 const school=await schoolSetup(mf);
 const response=await learner.request('/api/learner/signup',signup());assert.equal(response.status,201);const first=(await response.json()).learner;
 let record=await school.prepare('SELECT * FROM vlearning_students WHERE learner_id=?').bind(first.id).first();assert.equal(record.school_name,'A real school');assert.equal(record.phone,'+256 700 123456');assert.equal(record.class_level,'S2');
 const payload=JSON.parse((await school.prepare('SELECT payload FROM students').first()).payload);assert.equal(payload.dateOfBirth,'');assert.equal(payload.gender,'');assert.equal(payload.guardianContact,'');assert.equal(payload.className,'S.2');assert.equal(JSON.stringify(payload).includes('password'),false);
 assert.equal((await other.request('/api/learner/signup',signup('learner.two'))).status,201);assert.equal((await school.prepare('SELECT COUNT(*) AS n FROM students').first()).n,2,'same names remain separate accounts');
 assert.equal((await learner.request('/api/learner/profile',{displayName:'Updated Learner',classLevel:'P7',schoolName:'Updated school',phone:'',email:''})).status,200);
 record=await school.prepare('SELECT * FROM vlearning_students WHERE learner_id=?').bind(first.id).first();assert.equal(record.display_name,'Updated Learner');assert.equal(record.class_level,'P7');assert.equal(record.phone,'');
 assert.equal((await learner.request('/api/admin/school-access',{})).status,401);
 assert.equal((await admin.request('/api/login',{password:'isolated administrator test phrase'})).status,200);
 const id='11111111-1111-4111-8111-111111111111',db=await mf.getD1Database('DB');const now=new Date().toISOString();
 await db.prepare("INSERT INTO content(id,kind,status,data,created_at,updated_at) VALUES(?,'quiz','published',?,?,?)").bind(id,JSON.stringify({title:'Teacher reviewed quiz',subject:'Mathematics',classLevel:'P7',topic:'Number',questions:[{question:'2+2',options:['4','5','6','7'],answer:0,explanation:'Add two pairs.'}]}),now,now).run();
 const submission='22222222-2222-4222-8222-222222222222';
 for(const answers of [[0],[1]]){const sid=answers[0]===0?submission:'33333333-3333-4333-8333-333333333333';assert.equal((await learner.request('/api/quiz/'+id+'/grade',{answers,submissionId:sid})).status,200);}
 assert.equal((await learner.request('/api/quiz/'+id+'/grade',{answers:[1],submissionId:submission})).status,200);
 const results=(await school.prepare('SELECT * FROM vlearning_quiz_results ORDER BY percentage').all()).results;assert.equal(results.length,2);assert.deepEqual(results.map(r=>r.percentage),[0,100]);assert.equal(results[0].learner_id,first.id);
 assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM school_sync_queue').first()).n,0);
 const access=await admin.request('/api/admin/school-access',{});assert.equal(access.status,200);assert.match((await access.json()).url,/#school_code=[a-f0-9]{64}$/);
 }finally{await mf.dispose();}
});
test('missing or failed school connection keeps a durable queue for later retry',async()=>{
 const mf=runtime(false),user=client(mf),admin=client(mf);try{
 assert.equal((await user.request('/api/learner/signup',signup())).status,201);
 const db=await mf.getD1Database('DB');assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM learners').first()).n,1);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM school_sync_queue').first()).n,1);
 await admin.request('/api/login',{password:'isolated administrator test phrase'});
 const state=await (await admin.request('/api/admin/school-status')).json();assert.equal(state.connected,false);assert.equal(state.pending,1);
 assert.equal((await admin.request('/api/admin/school-access',{})).status,503);
 }finally{await mf.dispose();}
 const retry=runtime(),student=client(retry);try{
 // A missing school students table simulates an unavailable destination.
 assert.equal((await student.request('/api/learner/signup',signup())).status,201);
 const db=await retry.getD1Database('DB');assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM school_sync_queue').first()).n,1);
 const school=await schoolSetup(retry);await student.request('/api/learner/session');
 assert.equal((await school.prepare('SELECT COUNT(*) AS n FROM students').first()).n,1);assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM school_sync_queue').first()).n,0);
 }finally{await retry.dispose();}
});
