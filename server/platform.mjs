import {merchantDetails, PLANS} from './subscriptions.mjs';

export const platformSchema = [
  `CREATE TABLE IF NOT EXISTS site_notifications (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, category TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, destination TEXT NOT NULL, created_at TEXT NOT NULL, read_at TEXT, expiry_at INTEGER, dedupe_key TEXT NOT NULL UNIQUE)`,
  `CREATE INDEX IF NOT EXISTS notification_owner ON site_notifications(owner_id,created_at)`,
  `CREATE TABLE IF NOT EXISTS notification_preferences (learner_id TEXT PRIMARY KEY, channel TEXT NOT NULL DEFAULT 'in_app', renewals INTEGER NOT NULL DEFAULT 1, payments INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS notification_contacts (learner_id TEXT PRIMARY KEY, email TEXT NOT NULL, code_hash TEXT NOT NULL, expires_at INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, verified_at TEXT)`,
  `CREATE TABLE IF NOT EXISTS notification_deliveries (id TEXT PRIMARY KEY, notification_id TEXT NOT NULL UNIQUE, recipient TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', attempts INTEGER NOT NULL DEFAULT 0, next_at INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0, sent_at TEXT, provider_id TEXT NOT NULL DEFAULT '', last_error TEXT NOT NULL DEFAULT '')`,
  `CREATE INDEX IF NOT EXISTS notification_dispatch ON notification_deliveries(status,next_at)`,
  `CREATE TABLE IF NOT EXISTS school_memberships (school_id TEXT NOT NULL, learner_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'invited', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(school_id,learner_id))`,
  `CREATE UNIQUE INDEX IF NOT EXISTS school_active_membership ON school_memberships(learner_id) WHERE status='active'`,
  `CREATE INDEX IF NOT EXISTS school_roster ON school_memberships(school_id,status,updated_at)`,
];
export const ADMIN_OWNER = '__admin__';
const clean = (s,max=100) => typeof s==='string'?s.trim().slice(0,max):'';
const iso = n => new Date(n).toISOString();
const day = 86400000;
const escape = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => new Intl.NumberFormat('en-UG').format(n)+' UGX';
const eat = s => new Intl.DateTimeFormat('en-UG',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Kampala'}).format(new Date(s))+' EAT';
async function checkedInput(request,limit,bodyJSON,need){const input=await bodyJSON(request,limit);need(input&&typeof input==='object'&&!Array.isArray(input),400,'Enter valid workspace details.');return input;}
const hash = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(n=>n.toString(16).padStart(2,'0')).join('');

export function emailReady(env) { return typeof env.RESEND_API_KEY==='string' && env.RESEND_API_KEY.length>0 && typeof env.NOTIFICATION_FROM==='string' && env.NOTIFICATION_FROM.includes('@'); }
export async function sendEmail(env,{to,subject,text,key},fetcher=fetch) {
  if(!emailReady(env))throw new Error('Email delivery is not configured.');
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({from:env.NOTIFICATION_FROM,to:[to],subject,text})});
  if(!response.ok)throw new Error('Email provider returned '+response.status+'.');
  const result=await response.json();if(!result.id)throw new Error('Email provider did not confirm acceptance.');return result.id;
}

// These statements join the same transaction as the payment state change.
// Repeated submissions, concurrent reviews and retries cannot duplicate a notice.
export function paymentNoticeStatements(db,id,event) {
  const submitted=event==='submitted',approved=event==='approved';
  const title=submitted?'Payment reference received':approved?'Payment approved — access activated':'Payment reference needs attention';
  const body=submitted?'Your reference is awaiting administrator verification. Access begins after approval.':approved?'Your payment has been verified. Open Plans & payments to see your access dates.':'Your reference was not approved. Open your payment history to read the administrator’s explanation.';
  const owners=submitted?`SELECT learner_id FROM payment_requests WHERE id=? AND status='pending'`:`SELECT learner_id FROM payment_requests WHERE id=? AND status='${approved?'approved':'rejected'}' UNION SELECT learner_id FROM payment_beneficiaries WHERE payment_id=? AND EXISTS(SELECT 1 FROM payment_requests WHERE id=? AND status='approved')`;
  const args=submitted?[id]:[id,id,id];
  const statements=[db.prepare(`INSERT OR IGNORE INTO site_notifications(id,owner_id,category,title,body,destination,created_at,dedupe_key) SELECT lower(hex(randomblob(16))),learner_id,'payment',?,?,'subscribe',?,?||learner_id FROM (${owners})`).bind(title,body,iso(Date.now()),'payment:'+id+':'+event+':',...args)];
  if(submitted)statements.push(db.prepare(`INSERT OR IGNORE INTO site_notifications(id,owner_id,category,title,body,destination,created_at,dedupe_key) SELECT lower(hex(randomblob(16))),?,'payment','New payment reference',payer_name||' submitted '||CAST(amount_ugx AS TEXT)||' UGX for verification.','payments',created_at,? FROM payment_requests WHERE id=?`).bind(ADMIN_OWNER,'payment:'+id+':submitted:admin',id));
  else statements.push(db.prepare(`UPDATE site_notifications SET read_at=COALESCE(read_at,?) WHERE owner_id=? AND dedupe_key=?`).bind(iso(Date.now()),ADMIN_OWNER,'payment:'+id+':submitted:admin'));
  return statements;
}

export async function enqueueRenewals(db,now=Date.now(),learnerId='') {
  const aggregate=`SELECT g.learner_id,MAX(g.expires_at) AS expiry FROM subscription_grants g WHERE (?='' OR g.learner_id=?) GROUP BY g.learner_id`;
  const spans=[{tag:'3d',low:now+day,high:now+3*day,title:'Your subscription expires soon',body:'Your full access ends within three days. Renew now to keep learning; approval adds to your remaining paid time.'},{tag:'1d',low:now,high:now+day,title:'Your subscription ends within 24 hours',body:'Submit your renewal reference in Plans & payments. Access continues after administrator approval.'}];
  const statements=spans.map(s=>db.prepare(`INSERT OR IGNORE INTO site_notifications(id,owner_id,category,title,body,destination,created_at,expiry_at,dedupe_key) SELECT lower(hex(randomblob(16))),g.learner_id,'renewal',?,?,'subscribe',?,g.expiry,'renewal:'||g.learner_id||':'||g.expiry||':${s.tag}' FROM (${aggregate}) g LEFT JOIN notification_preferences p ON p.learner_id=g.learner_id WHERE g.expiry>? AND g.expiry<=? AND COALESCE(p.renewals,1)=1`).bind(s.title,s.body,iso(now),learnerId,learnerId,s.low,s.high));
  await db.batch(statements);
  await db.prepare("UPDATE site_notifications SET read_at=COALESCE(read_at,?) WHERE category='renewal' AND (?='' OR owner_id=?) AND (expiry_at<=? OR expiry_at<>COALESCE((SELECT MAX(expires_at) FROM subscription_grants WHERE learner_id=site_notifications.owner_id),0))").bind(iso(now),learnerId,learnerId,now).run();
}

export async function dispatchNotifications(env,{now=Date.now(),fetcher=fetch,limit=10}={}) {
  if(!emailReady(env))return {sent:0,failed:0,configured:false};
  await env.DB.prepare(`INSERT OR IGNORE INTO notification_deliveries(id,notification_id,recipient,next_at) SELECT lower(hex(randomblob(16))),n.id,c.email,? FROM site_notifications n JOIN notification_preferences p ON p.learner_id=n.owner_id JOIN notification_contacts c ON c.learner_id=n.owner_id JOIN learners l ON l.id=n.owner_id WHERE p.channel='email' AND c.verified_at IS NOT NULL AND c.email=l.email AND n.created_at>=p.updated_at AND n.created_at>=? AND ((n.category='payment' AND p.payments=1) OR (n.category='renewal' AND p.renewals=1))`).bind(now,iso(now-7*day)).run();
  if(typeof env.NOTIFICATION_ADMIN_EMAIL==='string'&&/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(env.NOTIFICATION_ADMIN_EMAIL))await env.DB.prepare(`INSERT OR IGNORE INTO notification_deliveries(id,notification_id,recipient,next_at) SELECT lower(hex(randomblob(16))),id,?,? FROM site_notifications WHERE owner_id=? AND read_at IS NULL AND created_at>=?`).bind(env.NOTIFICATION_ADMIN_EMAIL,now,ADMIN_OWNER,iso(now-day)).run();
  const candidates=(await env.DB.prepare(`SELECT d.id FROM notification_deliveries d WHERE attempts<5 AND next_at<=? AND (status IN ('pending','failed') OR (status='processing' AND locked_until<?)) ORDER BY next_at,id LIMIT ?`).bind(now,now,Math.min(5,limit)).all()).results;
  let sent=0,failed=0;
  for(const candidate of candidates){
    const lease=await env.DB.prepare(`UPDATE notification_deliveries SET status='processing',attempts=attempts+1,locked_until=? WHERE id=? AND attempts<5 AND next_at<=? AND (status IN ('pending','failed') OR (status='processing' AND locked_until<?)) RETURNING *`).bind(now+5*60000,candidate.id,now,now).first();
    if(!lease)continue;
    const notice=await env.DB.prepare('SELECT * FROM site_notifications WHERE id=?').bind(lease.notification_id).first();
    // Recheck consent and contact ownership at delivery time, including queued retries.
    const allowed=notice?.owner_id===ADMIN_OWNER?lease.recipient===env.NOTIFICATION_ADMIN_EMAIL:await env.DB.prepare(`SELECT 1 FROM notification_preferences p JOIN notification_contacts c ON c.learner_id=p.learner_id JOIN learners l ON l.id=p.learner_id WHERE p.learner_id=? AND p.channel='email' AND c.email=? AND c.email=l.email AND c.verified_at IS NOT NULL AND ((?='payment' AND p.payments=1) OR (?='renewal' AND p.renewals=1))`).bind(notice?.owner_id||'',lease.recipient,notice?.category||'',notice?.category||'').first();
    const expiryValid=notice?.category!=='renewal'||!!await env.DB.prepare('SELECT 1 FROM (SELECT MAX(expires_at) AS expiry FROM subscription_grants WHERE learner_id=?) WHERE expiry=? AND expiry>?').bind(notice.owner_id,notice.expiry_at,now).first();
    if(!notice||!allowed||!expiryValid||notice.created_at<iso(now-day)){await env.DB.prepare("UPDATE notification_deliveries SET status='cancelled',locked_until=0 WHERE id=?").bind(lease.id).run();continue;}
    try{
      const provider=await sendEmail(env,{to:lease.recipient,subject:'V-Learning Uganda: '+notice.title,text:notice.body+'\n\nOpen https://v-learning-uganda-app.pages.dev/'+(notice.owner_id===ADMIN_OWNER?'admin?section=payments':'subscribe')+'\n\nManage reminder preferences in your V-Learning notification settings.',key:'vlu-notice-'+lease.id},fetcher);
      await env.DB.prepare("UPDATE notification_deliveries SET status='sent',sent_at=?,provider_id=?,locked_until=0,last_error='' WHERE id=?").bind(iso(now),provider,lease.id).run();sent++;
    }catch(error){await env.DB.prepare("UPDATE notification_deliveries SET status='failed',next_at=?,locked_until=0,last_error=? WHERE id=?").bind(now+Math.min(day,2**lease.attempts*60000),String(error.message).slice(0,150),lease.id).run();failed++;}
  }
  return {sent,failed,configured:true};
}

async function preferences(env,learner){
  const p=await env.DB.prepare('SELECT * FROM notification_preferences WHERE learner_id=?').bind(learner.id).first();
  const c=await env.DB.prepare('SELECT email,verified_at FROM notification_contacts WHERE learner_id=?').bind(learner.id).first();
  return {channel:p?.channel||'in_app',renewals:p?.renewals!==0,payments:p?.payments!==0,emailAvailable:emailReady(env),email:learner.email||'',emailVerified:!!c?.verified_at&&c.email===learner.email};
}

export async function notificationAPI({request,env,path,method,learner,isAdmin,need,bodyJSON}) {
  const admin=path.startsWith('/api/admin/'),base=admin?'/api/admin/notifications':'/api/learner/notifications';
  if(!path.startsWith(base))return null;
  need(admin?isAdmin:learner,401,'Please sign in to view your notifications.');
  const owner=admin?ADMIN_OWNER:learner.id;
  if(path===base&&method==='GET'){
    if(!admin)await enqueueRenewals(env.DB,Date.now(),owner);
    const unread=await env.DB.prepare('SELECT COUNT(*) AS total FROM site_notifications WHERE owner_id=? AND read_at IS NULL').bind(owner).first();
    if(new URL(request.url).searchParams.get('summary')==='1')return {unread:unread.total};
    const rows=await env.DB.prepare('SELECT id,category,title,body,destination,created_at AS createdAt,read_at AS readAt FROM site_notifications WHERE owner_id=? ORDER BY created_at DESC,id DESC LIMIT 100').bind(owner).all();
    return {items:rows.results,unread:unread.total,...(!admin?{preferences:await preferences(env,learner)}:{delivery:{emailConfigured:emailReady(env),adminEmailConfigured:!!env.NOTIFICATION_ADMIN_EMAIL}})};
  }
  if(path===base+'/read'&&method==='POST'){
    const input=await checkedInput(request,2048,bodyJSON,need);need(input.all===true||/^[a-f0-9-]{32,36}$/.test(input.id||''),400,'Choose a notification.');
    await env.DB.prepare('UPDATE site_notifications SET read_at=COALESCE(read_at,?) WHERE owner_id=?'+(input.all?'':' AND id=?')).bind(iso(Date.now()),owner,...(input.all?[]:[input.id])).run();return {ok:true};
  }
  if(!admin&&path===base+'/preferences'&&method==='POST'){
    const input=await checkedInput(request,2048,bodyJSON,need);need(['in_app','email'].includes(input.channel)&&typeof input.renewals==='boolean'&&typeof input.payments==='boolean',400,'Choose your notification preferences.');
    const p=await preferences(env,learner);need(input.channel!=='email'||p.emailAvailable&&p.emailVerified,400,'Verify your email before choosing email delivery.');
    await env.DB.prepare(`INSERT INTO notification_preferences(learner_id,channel,renewals,payments,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(learner_id) DO UPDATE SET channel=excluded.channel,renewals=excluded.renewals,payments=excluded.payments,updated_at=excluded.updated_at`).bind(owner,input.channel,Number(input.renewals),Number(input.payments),iso(Date.now())).run();return {preferences:await preferences(env,learner)};
  }
  if(!admin&&path===base+'/verify-email'&&method==='POST'){
    need(emailReady(env),503,'Email notifications are not available yet. Your updates are available inside the site.');
    need(learner.email,400,'Add your email address in Account settings first.');
    const input=await checkedInput(request,2048,bodyJSON,need),contact=await env.DB.prepare('SELECT * FROM notification_contacts WHERE learner_id=?').bind(owner).first();
    if(input.code){
      need(/^\d{6}$/.test(input.code)&&contact&&contact.email===learner.email&&contact.expires_at>Date.now()&&contact.attempts<5,400,'Request a new email verification code.');
      await env.DB.prepare('UPDATE notification_contacts SET attempts=attempts+1 WHERE learner_id=?').bind(owner).run();
      need(await hash(owner+':'+input.code)===contact.code_hash,400,'The verification code is incorrect.');
      await env.DB.prepare("UPDATE notification_contacts SET verified_at=?,code_hash='',expires_at=0 WHERE learner_id=?").bind(iso(Date.now()),owner).run();return {verified:true,preferences:await preferences(env,learner)};
    }
    need(!contact||contact.expires_at<Date.now()+9*60000,429,'Wait one minute before requesting another code.');
    const bytes=crypto.getRandomValues(new Uint32Array(1)),code=String(bytes[0]%1000000).padStart(6,'0');
    await sendEmail(env,{to:learner.email,subject:'Verify your V-Learning Uganda notification email',text:'Your verification code is '+code+'. It expires in 10 minutes. If you did not request it, ignore this message.',key:'vlu-verify-'+crypto.randomUUID()});
    await env.DB.prepare(`INSERT INTO notification_contacts(learner_id,email,code_hash,expires_at,attempts,verified_at) VALUES(?,?,?,?,0,NULL) ON CONFLICT(learner_id) DO UPDATE SET email=excluded.email,code_hash=excluded.code_hash,expires_at=excluded.expires_at,attempts=0,verified_at=NULL`).bind(owner,learner.email,await hash(owner+':'+code),Date.now()+10*60000).run();return {sent:true};
  }
  return null;
}

export async function schoolDashboardAPI({request,env,path,method,learner,need,bodyJSON}){
  if(!path.startsWith('/api/learner/school'))return null;
  need(learner,401,'Log in to open your school workspace.');
  if(path==='/api/learner/school'&&method==='GET'){
    if(learner.account_type!=='school'){
      const rows=await env.DB.prepare(`SELECT m.school_id AS schoolId,m.status,s.school_name AS schoolName,s.display_name AS contactName FROM school_memberships m JOIN learners s ON s.id=m.school_id WHERE m.learner_id=? AND m.status IN ('invited','active') ORDER BY m.created_at DESC`).bind(learner.id).all();return {role:'student',memberships:rows.results};
    }
    const url=new URL(request.url),page=Math.max(1,Math.min(100000,parseInt(url.searchParams.get('page'))||1));
    const where=`FROM school_memberships m JOIN learners l ON l.id=m.learner_id LEFT JOIN (SELECT learner_id,MAX(expires_at) AS expiry FROM subscription_grants GROUP BY learner_id) g ON g.learner_id=l.id WHERE m.school_id=? AND m.status='active'`;
    const summary=await env.DB.prepare(`SELECT COUNT(*) AS students,COALESCE(SUM(CASE WHEN g.expiry>? THEN 1 ELSE 0 END),0) AS covered,COALESCE(SUM(CASE WHEN g.expiry>? AND g.expiry<=? THEN 1 ELSE 0 END),0) AS expiring ${where}`).bind(Date.now(),Date.now(),Date.now()+7*day,learner.id).first();
    const rows=await env.DB.prepare(`SELECT l.username,l.display_name AS displayName,l.class_level AS classLevel,g.expiry ${where} ORDER BY l.class_level,l.username LIMIT 50 OFFSET ?`).bind(learner.id,(page-1)*50).all();
    const invited=await env.DB.prepare("SELECT COUNT(*) AS total FROM school_memberships WHERE school_id=? AND status='invited'").bind(learner.id).first();
    return {role:'school',schoolName:learner.school_name,summary:{...summary,invited:invited.total},items:rows.results.map(r=>({...r,active:r.expiry>Date.now(),expiresAt:r.expiry?iso(r.expiry):null})),page};
  }
  if(path==='/api/learner/school/invite'&&method==='POST'){
    need(learner.account_type==='school',403,'Use a registered school account to invite students.');const input=await checkedInput(request,16384,bodyJSON,need);
    need(Array.isArray(input.usernames)&&input.usernames.length>=1&&input.usernames.length<=50,400,'Invite 1–50 student usernames at a time.');
    const names=input.usernames.map(n=>clean(n,31).toLowerCase());need(new Set(names).size===names.length&&names.every(n=>/^[a-z0-9][a-z0-9._-]{2,29}$/.test(n)),400,'Enter each valid student username once.');
    const found=(await env.DB.prepare("SELECT id FROM learners WHERE username IN (SELECT value FROM json_each(?)) AND account_type<>'school'").bind(JSON.stringify(names)).all()).results;
    need(found.length===names.length,400,'Every username must belong to a registered student. Check your list.');
    const now=iso(Date.now()),text=learner.school_name+' invites you to its school dashboard. Accept in My school to share your name, username, class and subscription expiry with this school. Your phone, email and quiz answers stay private.';
    // Two SQL statements handle the whole roster without exceeding D1 request limits.
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO school_memberships(school_id,learner_id,status,created_at,updated_at) SELECT ?,value,'invited',?,? FROM json_each(?) WHERE 1 ON CONFLICT(school_id,learner_id) DO UPDATE SET status='invited',updated_at=excluded.updated_at WHERE school_memberships.status IN ('declined','removed')`).bind(learner.id,now,now,JSON.stringify(found.map(r=>r.id))),
      env.DB.prepare(`INSERT OR IGNORE INTO site_notifications(id,owner_id,category,title,body,destination,created_at,dedupe_key) SELECT lower(hex(randomblob(16))),learner_id,'school','School invitation',?,'school',?,'school-invite:'||school_id||':'||learner_id||':'||updated_at FROM school_memberships WHERE school_id=? AND learner_id IN (SELECT value FROM json_each(?)) AND status='invited'`).bind(text,now,learner.id,JSON.stringify(found.map(r=>r.id))),
    ]);return {invited:found.length};
  }
  if(path==='/api/learner/school/respond'&&method==='POST'){
    need(learner.account_type!=='school',403,'Only student accounts can accept school invitations.');const input=await checkedInput(request,2048,bodyJSON,need);
    need(/^[a-f0-9-]{36}$/.test(input.schoolId||'')&&['accept','decline','leave'].includes(input.action),400,'Choose a school invitation.');
    if(input.action==='accept'){
      const active=await env.DB.prepare("SELECT school_id FROM school_memberships WHERE learner_id=? AND status='active'").bind(learner.id).first();need(!active,409,'Leave your current school connection before joining another.');
    }
    const changed=await env.DB.prepare(`UPDATE school_memberships SET status=?,updated_at=? WHERE school_id=? AND learner_id=? AND status=? AND (?<>'accept' OR NOT EXISTS(SELECT 1 FROM school_memberships own WHERE own.learner_id=? AND own.status='active'))`).bind(input.action==='accept'?'active':input.action==='decline'?'declined':'removed',iso(Date.now()),input.schoolId,learner.id,input.action==='leave'?'active':'invited',input.action,learner.id).run();need(changed.meta.changes===1,409,'This school invitation has changed. Refresh your school page.');return {ok:true};
  }
  return null;
}

export async function receiptAPI({request,env,path,method,learner,isAdmin,need}){
  const match=/^\/api\/(?:learner|admin)\/payments\/([a-f0-9-]{36})\/receipt$/.exec(path);if(!match||method!=='GET')return null;
  need(learner||isAdmin,401,'Log in to view your receipt.');
  const p=await env.DB.prepare('SELECT p.*,l.username FROM payment_requests p JOIN learners l ON l.id=p.learner_id WHERE p.id=?'+(isAdmin?'':' AND p.learner_id=?')).bind(match[1],...(isAdmin?[]:[learner.id])).first();need(p,404,'Receipt not found.');need(p.status==='approved',409,'A receipt is available after payment approval.');
  const grants=(await env.DB.prepare('SELECT MIN(starts_at) AS starts,MAX(expires_at) AS expires FROM subscription_grants WHERE payment_id=?').bind(p.id).first());
  const number='VLU-'+p.created_at.slice(0,10).replaceAll('-','')+'-'+p.id.replaceAll('-','').slice(0,16).toUpperCase(),merchant=merchantDetails(env);
  const rows=[['Receipt number',number],['Payment verified',eat(p.reviewed_at)],['Paid by',p.payer_name],['Account',p.username],...(p.school_name?[['School',p.school_name]]:[]),['Plan',PLANS[p.plan].name],['Students covered',p.seat_count],['Amount received',money(p.amount_ugx)],['Airtel transaction reference',p.transaction_ref],['Merchant',merchant.name],['Merchant code',merchant.code],...(grants.starts?[['Access begins',eat(grants.starts)],['Latest access expiry',eat(grants.expires)]]:[])];
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(number)} · Payment receipt</title><style>body{font:16px/1.6 system-ui,sans-serif;color:#172334;margin:40px auto;padding:0 24px;max-width:760px}header{border-bottom:4px solid #be1373;padding-bottom:20px}h1{font-size:28px;margin-bottom:0}.muted{color:#5a6573}table{width:100%;border-collapse:collapse;margin:28px 0}th,td{padding:12px;text-align:left;border-bottom:1px solid #e2e6ed;vertical-align:top;overflow-wrap:anywhere}th{width:42%;font-weight:600}footer{margin-top:30px;border-top:1px solid #e2e6ed;padding-top:16px;font-size:14px}@media print{body{margin:0;max-width:none}.print-help{display:none}}</style><header><p>VIDEO LEARNING UGANDA</p><h1>Payment receipt</h1><p class="muted">Verified and approved by the administrator</p></header><table><tbody>${rows.map(([k,v])=>`<tr><th scope="row">${escape(k)}</th><td>${escape(v)}</td></tr>`).join('')}</tbody></table><p>Thank you for learning with Video Learning Uganda. School access dates can differ when students have remaining paid time.</p><footer><p>Questions? Contact Tr Ojok on +256 778 441681.</p><p class="print-help">Use your browser’s Print option to print this receipt or save it as a PDF.</p></footer></html>`;
  return new Response(html,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff',...(new URL(request.url).searchParams.has('download')?{'Content-Disposition':`attachment; filename="${number}.html"`}:{})}});
}

function dateRange(url,need){
  const today=iso(Date.now()+3*3600000).slice(0,10),from=url.searchParams.get('from')||iso(Date.now()+3*3600000-29*day).slice(0,10),to=url.searchParams.get('to')||today;
  const valid=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&iso(Date.parse(s)).slice(0,10)===s;
  need(valid(from)&&valid(to)&&from<=to&&Date.parse(to)-Date.parse(from)<=365*day,400,'Choose a valid date range of up to one year.');
  return {from,to,start:iso(Date.parse(from+'T00:00:00+03:00')),end:iso(Date.parse(to+'T00:00:00+03:00')+day)};
}
export async function subscriptionReports({request,env,path,method,isAdmin,need}){
  if(path!=='/api/admin/reports'||method!=='GET')return null;need(isAdmin,401,'Administrator sign-in required.');const range=dateRange(new URL(request.url),need),db=env.DB,now=Date.now();
  const result=await db.batch([
    db.prepare("SELECT COUNT(*) AS registrations,COALESCE(SUM(CASE WHEN account_type='school' THEN 1 ELSE 0 END),0) AS schools FROM learners WHERE created_at>=? AND created_at<?").bind(range.start,range.end),
    db.prepare('SELECT COUNT(*) AS lessons,COUNT(DISTINCT learner_id) AS learners FROM learner_free_lessons WHERE claimed_at>=? AND claimed_at<?').bind(range.start,range.end),
    db.prepare("SELECT COUNT(*) AS approved,COALESCE(SUM(amount_ugx),0) AS revenue,COUNT(DISTINCT learner_id) AS payingAccounts FROM payment_requests WHERE status='approved' AND reviewed_at>=? AND reviewed_at<?").bind(range.start,range.end),
    db.prepare("SELECT COUNT(*) AS pending FROM payment_requests WHERE status='pending'"),
    db.prepare('SELECT COUNT(*) AS active FROM (SELECT learner_id,MAX(expires_at) AS expiry FROM subscription_grants GROUP BY learner_id) WHERE expiry>?').bind(now),
    db.prepare('SELECT COUNT(*) AS expiring FROM (SELECT learner_id,MAX(expires_at) AS expiry FROM subscription_grants GROUP BY learner_id) WHERE expiry>? AND expiry<=?').bind(now,now+7*day),
    db.prepare("SELECT plan,COUNT(*) AS payments,SUM(seat_count) AS seats,SUM(amount_ugx) AS amountUGX FROM payment_requests WHERE status='approved' AND reviewed_at>=? AND reviewed_at<? GROUP BY plan").bind(range.start,range.end),
    db.prepare("SELECT date(created_at,'+3 hours') AS date,COUNT(*) AS registrations FROM learners WHERE created_at>=? AND created_at<? GROUP BY date(created_at,'+3 hours') ORDER BY date").bind(range.start,range.end),
    db.prepare("SELECT date(claimed_at,'+3 hours') AS date,COUNT(*) AS freeLessons FROM learner_free_lessons WHERE claimed_at>=? AND claimed_at<? GROUP BY date(claimed_at,'+3 hours') ORDER BY date").bind(range.start,range.end),
    db.prepare("SELECT date(reviewed_at,'+3 hours') AS date,COUNT(*) AS approvals,SUM(amount_ugx) AS amountUGX FROM payment_requests WHERE status='approved' AND reviewed_at>=? AND reviewed_at<? GROUP BY date(reviewed_at,'+3 hours') ORDER BY date").bind(range.start,range.end),
    db.prepare('SELECT l.username,l.display_name AS displayName,l.class_level AS classLevel,g.expiry FROM (SELECT learner_id,MAX(expires_at) AS expiry FROM subscription_grants GROUP BY learner_id) g JOIN learners l ON l.id=g.learner_id WHERE g.expiry>? AND g.expiry<=? ORDER BY g.expiry,l.username LIMIT 100').bind(now,now+7*day),
    db.prepare("SELECT status,COUNT(*) AS total FROM notification_deliveries GROUP BY status"),
  ]);
  const dates=new Map();for(let i=7;i<=9;i++)for(const r of result[i].results)dates.set(r.date,{...(dates.get(r.date)||{date:r.date,registrations:0,freeLessons:0,approvals:0,amountUGX:0}),...r});
  return {range:{from:range.from,to:range.to,timeZone:'Africa/Kampala'},summary:{...result[0].results[0],freeLessons:result[1].results[0].lessons,trialLearners:result[1].results[0].learners,...result[2].results[0],...result[3].results[0],...result[4].results[0],...result[5].results[0]},plans:result[6].results,days:[...dates.values()].sort((a,b)=>a.date.localeCompare(b.date)),expiring:result[10].results.map(r=>({...r,expiresAt:iso(r.expiry)})),deliveries:result[11].results,emailConfigured:emailReady(env)};
}
