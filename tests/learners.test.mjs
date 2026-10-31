import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pbkdf2Sync, createHash} from 'node:crypto';
import {Miniflare} from 'miniflare';

const script=await readFile(new URL('../server/worker.mjs',import.meta.url),'utf8');
const origin='https://learning.example';
const password='isolated learner phrase for tests';
const changedPassword='different isolated learner phrase';
const hash=value=>createHash('sha256').update(value).digest('hex');
function runtime(){return new Miniflare({modules:true,script,compatibilityDate:'2026-07-30',d1Databases:['DB'],r2Buckets:['MEDIA'],bindings:{ADMIN_PASSWORD:'isolated administrator test phrase'}});}
function client(mf){
  let cookie='';
  return {get cookie(){return cookie;},set cookie(value){cookie=value;},async request(path,body,options={}){
    const response=await mf.dispatchFetch(origin+path,{method:options.method||(body===undefined?'GET':'POST'),headers:{Origin:origin,'CF-Connecting-IP':'192.0.2.40',...(cookie?{Cookie:cookie}:{}),...(body===undefined?{}:{'Content-Type':'application/json'}),...options.headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
    if(response.headers.has('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];
    return response;
  }};
}
const signup=(username='school.learner')=>({username,displayName:'School Learner',classLevel:'P7',password});

test('real learner lifecycle is durable, private and separate from administration',async t=>{
  const mf=runtime(),alice=client(mf),other=client(mf),guest=client(mf);let db,learnerId,recoveryCode,firstCookie;
  try{
    await t.test('anonymous browsing stays free; account writes require the same origin',async()=>{
      assert.deepEqual(await (await guest.request('/api/learner/session')).json(),{learner:null});
      assert.equal((await guest.request('/api/learner/signup',signup(),{headers:{Origin:'https://untrusted.example'}})).status,403);
      assert.equal((await guest.request('/api/learner/login',signup(),{headers:{'Sec-Fetch-Site':'cross-site'}})).status,403);
      assert.equal((await guest.request('/api/learner/profile',{displayName:'Forged profile'})).status,401);
      assert.equal((await (await guest.request('/api/content')).json()).access,'free');
      db=await mf.getD1Database('DB');
    });
    await t.test('rejects weak passwords, invalid data and oversized requests',async()=>{
      for(const input of [null,[],{...signup(),password:'short'},{...signup(),password:'password1234'},{...signup(),classLevel:'P8'},{...signup(),displayName:'x'},{...signup(),username:'admin'},{...signup(),username:'bad user'}])assert.equal((await guest.request('/api/learner/signup',input)).status,400);
      assert.equal((await guest.request('/api/learner/signup',{...signup(),displayName:'x'.repeat(5000)})).status,413);
      assert.equal((await db.prepare('SELECT COUNT(*) AS n FROM learners').first()).n,0);
    });
    await t.test('creates a persisted learner, salted password hash, recovery hash and opaque secure session',async()=>{
      const response=await alice.request('/api/learner/signup',{...signup('School.Learner'),role:'admin',admin:true});
      assert.equal(response.status,201);const result=await response.json();learnerId=result.learner.id;recoveryCode=result.recoveryCode;firstCookie=alice.cookie;
      assert.equal(result.learner.username,'school.learner');assert.equal(result.learner.classLevel,'P7');
      assert.match(recoveryCode,/^(?:[A-F0-9]{4}-){7}[A-F0-9]{4}$/);
      for(const attribute of ['HttpOnly','Secure','SameSite=Strict','Path=/api','Max-Age=604800'])assert.ok(response.headers.get('set-cookie').includes(attribute));
      const row=await db.prepare('SELECT * FROM learners WHERE id=?').bind(learnerId).first();
      const [algorithm,iterations,salt,derived]=row.password_hash.split('$');
      assert.equal(algorithm,'pbkdf2-sha256');assert.equal(Number(iterations),100000);
      assert.equal(derived,pbkdf2Sync(password,Buffer.from(salt,'hex'),Number(iterations),32,'sha256').toString('hex'));
      assert.equal(row.recovery_hash,hash('vl-learner-recovery:'+recoveryCode.replaceAll('-','')));
      assert.equal(JSON.stringify(row).includes(password),false);assert.equal(JSON.stringify(row).includes(recoveryCode),false);
      const token=alice.cookie.split('=')[1];const session=await db.prepare('SELECT * FROM learner_sessions WHERE learner_id=?').bind(learnerId).first();assert.equal(session.token_hash,hash(token));assert.notEqual(session.token_hash,token);
      const current=await (await alice.request('/api/learner/session')).json();assert.equal(current.learner.id,learnerId);assert.deepEqual(Object.keys(current.learner).sort(),['classLevel','createdAt','displayName','id','username']);
      assert.equal((await other.request('/api/learner/signup',signup('SCHOOL.LEARNER'))).status,409);
    });
    await t.test('learner sessions cannot access drafts, admin data or uploads',async()=>{
      assert.equal((await alice.request('/api/session')).status,200);assert.equal((await (await alice.request('/api/session')).json()).authenticated,false);
      for(const path of ['/api/admin/content','/api/uploads'])assert.equal((await alice.request(path,{})).status,401);
      other.cookie='vl_admin='+alice.cookie.split('=')[1];assert.equal((await other.request('/api/admin/content')).status,401);other.cookie='';
      await db.prepare("INSERT INTO assets(id,object_key,name,mime,size,state,created_at) VALUES(?,?,?,?,?,'ready',?)").bind('11111111-1111-4111-8111-111111111111','private/file','private.pdf','application/pdf',8,Date.now()).run();
      assert.equal((await alice.request('/api/media/11111111-1111-4111-8111-111111111111')).status,404);
    });
    await t.test('login is case insensitive, errors are generic and re-login rotates the session',async()=>{
      const wrong=await guest.request('/api/learner/login',{username:'school.learner',password:'wrong long test password'});
      const unknown=await guest.request('/api/learner/login',{username:'unknown.learner',password:'wrong long test password'});
      assert.equal(wrong.status,401);assert.equal(unknown.status,401);assert.deepEqual(await wrong.json(),await unknown.json());
      assert.equal((await alice.request('/api/learner/login',{username:'SCHOOL.LEARNER',password})).status,200);assert.notEqual(alice.cookie,firstCookie);
      guest.cookie=firstCookie;assert.equal((await (await guest.request('/api/learner/session')).json()).learner,null);guest.cookie='';
      assert.equal((await other.request('/api/learner/login',{username:'school.learner',password})).status,200);
    });
    await t.test('profile edits only affect the signed-in learner; salts differ for equal passwords',async()=>{
      assert.equal((await guest.request('/api/learner/signup',signup('second.learner'))).status,201);
      const second=await db.prepare('SELECT * FROM learners WHERE username=?').bind('second.learner').first();
      const first=await db.prepare('SELECT * FROM learners WHERE id=?').bind(learnerId).first();assert.notEqual(first.password_hash,second.password_hash);
      const response=await alice.request('/api/learner/profile',{id:second.id,username:'admin',role:'admin',displayName:'Updated Name',classLevel:'S2'});assert.equal(response.status,200);const result=await response.json();assert.equal(result.learner.id,learnerId);assert.equal(result.learner.username,'school.learner');assert.equal(result.learner.classLevel,'S2');
      assert.equal((await db.prepare('SELECT display_name FROM learners WHERE id=?').bind(second.id).first()).display_name,'School Learner');
      assert.equal((await alice.request('/api/learner/profile',{displayName:'Changed',classLevel:'S8'})).status,400);
    });
    await t.test('password changes require the current password and invalidate every previous session',async()=>{
      assert.equal((await alice.request('/api/learner/password',{currentPassword:'incorrect',newPassword:changedPassword})).status,401);
      const stolenCookie=other.cookie;assert.equal((await alice.request('/api/learner/password',{currentPassword:password,newPassword:changedPassword})).status,200);
      assert.equal((await (await other.request('/api/learner/session')).json()).learner,null);
      other.cookie=stolenCookie;assert.equal((await other.request('/api/learner/profile',{displayName:'Stale',classLevel:''})).status,401);
      assert.equal((await alice.request('/api/learner/login',{username:'school.learner',password})).status,401);
      assert.equal((await alice.request('/api/learner/login',{username:'school.learner',password:changedPassword})).status,200);
    });
    await t.test('recovery codes are one-time proofs that rotate and revoke sessions',async()=>{
      const before=alice.cookie;
      assert.equal((await guest.request('/api/learner/recover',{username:'school.learner',recoveryCode:'0000-0000',newPassword:password})).status,401);
      const response=await guest.request('/api/learner/recover',{username:'SCHOOL.LEARNER',recoveryCode:recoveryCode.toLowerCase().replaceAll('-',' '),newPassword:password});assert.equal(response.status,200);const replacement=(await response.json()).recoveryCode;assert.notEqual(replacement,recoveryCode);
      assert.equal((await (await alice.request('/api/learner/session')).json()).learner,null);
      assert.equal((await guest.request('/api/learner/recover',{username:'school.learner',recoveryCode,newPassword:changedPassword})).status,401);
      await db.prepare('DELETE FROM learner_attempts').run();
      assert.equal((await alice.request('/api/learner/login',{username:'school.learner',password:changedPassword})).status,401);
      assert.equal((await alice.request('/api/learner/login',{username:'school.learner',password})).status,200);
      other.cookie=before;assert.equal((await (await other.request('/api/learner/session')).json()).learner,null);
      const current=await db.prepare('SELECT * FROM learners WHERE id=?').bind(learnerId).first();assert.equal(current.recovery_hash,hash('vl-learner-recovery:'+replacement.replaceAll('-','')));
    });
    await t.test('logout and expiry prevent replay; public access remains unchanged',async()=>{
      const token=alice.cookie;assert.equal((await alice.request('/api/learner/logout',{})).status,200);other.cookie=token;assert.equal((await (await other.request('/api/learner/session')).json()).learner,null);
      assert.equal((await alice.request('/api/learner/login',{username:'school.learner',password})).status,200);
      await db.prepare('UPDATE learner_sessions SET expires=? WHERE learner_id=?').bind(Date.now()-1,learnerId).run();assert.equal((await (await alice.request('/api/learner/session')).json()).learner,null);
      assert.deepEqual(await (await alice.request('/api/content')).json(),{items:[],access:'free'});
      assert.equal((await alice.request('/api/learner/not-a-route')).status,404);
    });
  }finally{await mf.dispose();}
});

test('rate limits both account and network guesses before password work',async()=>{
  const mf=runtime(),user=client(mf);
  try{
    let response;
    for(let i=0;i<11;i++)response=await user.request('/api/learner/login',{username:'guess.account',password:'incorrect test phrase'},{headers:{'CF-Connecting-IP':'198.51.100.'+i}});
    assert.equal(response.status,429);
    for(let i=0;i<31;i++)response=await user.request('/api/learner/login',{username:'different.account.'+i,password:'incorrect test phrase'},{headers:{'CF-Connecting-IP':'203.0.113.1'}});
    assert.equal(response.status,429);
    for(let i=0;i<6;i++)response=await user.request('/api/learner/recover',{username:'recover.account',recoveryCode:'0000',newPassword:password});
    assert.equal(response.status,429);
    for(let i=0;i<51;i++)response=await user.request('/api/learner/signup',null,{headers:{'CF-Connecting-IP':'203.0.113.3'}});
    assert.equal(response.status,429);
  }finally{await mf.dispose();}
});

test('only one concurrent request can spend a recovery code',async()=>{
  const mf=runtime(),owner=client(mf),first=client(mf),second=client(mf);
  try{
    const signupResponse=await owner.request('/api/learner/signup',signup('recovery.race'));
    const {recoveryCode}=await signupResponse.json();
    const input={username:'recovery.race',recoveryCode,newPassword:changedPassword};
    const responses=await Promise.all([first.request('/api/learner/recover',input),second.request('/api/learner/recover',input)]);
    assert.deepEqual(responses.map(response=>response.status).sort(),[200,401]);
    assert.equal((await (await owner.request('/api/learner/session')).json()).learner,null);
    assert.equal((await owner.request('/api/learner/login',{username:'recovery.race',password:changedPassword})).status,200);
  }finally{await mf.dispose();}
});
