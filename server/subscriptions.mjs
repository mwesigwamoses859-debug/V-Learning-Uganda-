export const PLANS = {
  weekly: {name:'Weekly student', amountUGX:10000, days:7},
  monthly: {name:'Monthly student', amountUGX:30000, days:30},
  school: {name:'School group', amountUGX:20000, days:30},
};
export function merchantDetails(env) {
  const code=String(env.PAYMENT_MERCHANT_CODE||'').trim(),name=String(env.PAYMENT_MERCHANT_NAME||'').trim();
  const ready=/^[0-9]{5,16}$/.test(code)&&name.length>=2&&name.length<=100;
  return {provider:'Airtel Money',code:ready?code:'',name:ready?name:'',ready,qr:ready&&env.PAYMENT_QR_READY==='true'?'/api/payment-qr':''};
}
export const billingSchema = [
  `CREATE TABLE IF NOT EXISTS payment_requests (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL, plan TEXT NOT NULL, amount_ugx INTEGER NOT NULL, seat_count INTEGER NOT NULL, school_name TEXT NOT NULL, payer_name TEXT NOT NULL, payer_phone TEXT NOT NULL, transaction_ref TEXT NOT NULL, reference_key TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'pending', review_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, reviewed_at TEXT, approval_nonce TEXT)`,
  `CREATE INDEX IF NOT EXISTS payment_owner ON payment_requests(learner_id,created_at)`,
  `CREATE INDEX IF NOT EXISTS payment_status ON payment_requests(status,created_at)`,
  `CREATE TABLE IF NOT EXISTS payment_beneficiaries (payment_id TEXT NOT NULL, learner_id TEXT NOT NULL, PRIMARY KEY(payment_id,learner_id))`,
  `CREATE TABLE IF NOT EXISTS subscription_grants (payment_id TEXT NOT NULL, learner_id TEXT NOT NULL, plan TEXT NOT NULL, starts_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, PRIMARY KEY(payment_id,learner_id))`,
  `CREATE INDEX IF NOT EXISTS subscription_owner ON subscription_grants(learner_id,expires_at)`,
];
export async function entitlement(db,learnerId,now=Date.now()) {
  const row=await db.prepare('SELECT MAX(expires_at) AS expires_at FROM subscription_grants WHERE learner_id=?').bind(learnerId).first();
  return {active:!!row?.expires_at&&row.expires_at>now,expiresAt:row?.expires_at?new Date(row.expires_at).toISOString():null};
}
function paymentSummary(row) {
  return {id:row.id,plan:row.plan,amountUGX:row.amount_ugx,seats:row.seat_count,schoolName:row.school_name,payerName:row.payer_name,payerPhone:row.payer_phone,reference:row.transaction_ref,status:row.status,reviewNote:row.review_note,createdAt:row.created_at,reviewedAt:row.reviewed_at};
}
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
export async function subscriptionAPI({request,env,path,method,learner,isAdmin,bodyJSON,need}) {
  if(path==='/api/plans'&&method==='GET')return {plans:PLANS,merchant:merchantDetails(env)};
  if(path==='/api/learner/subscription'&&method==='GET') {
    need(learner,401,'Log in to view your subscription.');
    const rows=await env.DB.prepare('SELECT * FROM payment_requests WHERE learner_id=? ORDER BY created_at DESC LIMIT 100').bind(learner.id).all();
    return {subscription:await entitlement(env.DB,learner.id),payments:rows.results.map(paymentSummary)};
  }
  if(path==='/api/learner/payments'&&method==='POST') {
    need(learner,401,'Log in before submitting your payment reference.');
    need(merchantDetails(env).ready,503,'Payments are being activated. Please check back before making a payment.');
    const input=await bodyJSON(request,32768);
    need(input&&typeof input==='object'&&!Array.isArray(input),400,'Enter your payment details.');
    need(typeof input.plan==='string'&&Object.hasOwn(PLANS,input.plan),400,'Choose a subscription plan.');
    const plan=PLANS[input.plan];
    const payerName=clean(input.payerName,100),payerPhone=clean(input.payerPhone,25),schoolName=clean(input.schoolName,150);
    const reference=clean(input.reference,80),referenceKey=reference.toUpperCase().replace(/[^A-Z0-9]/g,'');
    need(payerName.length>=2&&!/[\x00-\x1f\x7f]/.test(payerName),400,'Enter the name used for the payment.');
    need(/^\+?[0-9 ()-]{7,25}$/.test(payerPhone),400,'Enter the phone number used for the payment.');
    need(/^[A-Za-z0-9][A-Za-z0-9 ./_-]{4,79}$/.test(reference)&&referenceKey.length>=5,400,'Copy the transaction reference from your Airtel payment confirmation.');
    let recipients=[learner.id];
    if(input.plan==='school') {
      need(schoolName.length>=2&&!/[\x00-\x1f\x7f]/.test(schoolName),400,'Enter the school name.');
      need(Array.isArray(input.usernames)&&input.usernames.length>=2&&input.usernames.length<=200,400,'Include 2–200 registered student usernames per school payment.');
      const usernames=input.usernames.map(name=>clean(name,31).toLowerCase());
      need(usernames.every(name=>/^[a-z0-9][a-z0-9._-]{2,29}$/.test(name))&&new Set(usernames).size===usernames.length,400,'Use each registered student username once.');
      const found=await env.DB.prepare('SELECT id FROM learners WHERE username IN (SELECT value FROM json_each(?))').bind(JSON.stringify(usernames)).all();
      need(found.results.length===usernames.length,400,'Every student on the list must sign up first. Check the usernames before paying.');
      recipients=found.results.map(row=>row.id);
    }
    const id=crypto.randomUUID(),createdAt=new Date().toISOString();
    const existing=await env.DB.prepare('SELECT 1 FROM payment_requests WHERE reference_key=?').bind(referenceKey).first();
    need(!existing,409,'This payment reference has already been submitted. Check your payment history or contact the administrator.');
    const [inserted]=await env.DB.batch([
      env.DB.prepare(`INSERT INTO payment_requests(id,learner_id,plan,amount_ugx,seat_count,school_name,payer_name,payer_phone,transaction_ref,reference_key,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(reference_key) DO NOTHING`).bind(id,learner.id,input.plan,plan.amountUGX*recipients.length,recipients.length,input.plan==='school'?schoolName:'',payerName,payerPhone,reference,referenceKey,createdAt),
      env.DB.prepare('INSERT INTO payment_beneficiaries(payment_id,learner_id) SELECT ?,value FROM json_each(?) WHERE EXISTS(SELECT 1 FROM payment_requests WHERE id=?)').bind(id,JSON.stringify(recipients),id),
    ]);
    need(inserted.meta.changes===1,409,'This payment reference has already been submitted.');
    return {payment:paymentSummary(await env.DB.prepare('SELECT * FROM payment_requests WHERE id=?').bind(id).first())};
  }
  if(path==='/api/admin/payments'&&method==='GET') {
    need(isAdmin,401,'Please sign in to the administrator dashboard.');
    const url=new URL(request.url),status=url.searchParams.get('status')||'pending';
    need(['all','pending','approved','rejected'].includes(status),400,'Choose a valid payment status.');
    const page=Math.max(1,Math.min(100000,Number.parseInt(url.searchParams.get('page'))||1));
    const where=status==='all'?'':'WHERE p.status=?',args=status==='all'?[]:[status];
    const rows=await env.DB.prepare(`SELECT p.*,l.username,l.display_name FROM payment_requests p JOIN learners l ON l.id=p.learner_id ${where} ORDER BY p.created_at DESC,p.id LIMIT 50 OFFSET ?`).bind(...args,(page-1)*50).all();
    const total=await env.DB.prepare(`SELECT COUNT(*) AS count FROM payment_requests p ${where}`).bind(...args).first();
    const items=[];
    for(const row of rows.results) {
      const beneficiaries=await env.DB.prepare('SELECT l.username,l.display_name,l.class_level,g.starts_at,g.expires_at FROM payment_beneficiaries b JOIN learners l ON l.id=b.learner_id LEFT JOIN subscription_grants g ON g.payment_id=b.payment_id AND g.learner_id=b.learner_id WHERE b.payment_id=? ORDER BY l.username').bind(row.id).all();
      items.push({...paymentSummary(row),username:row.username,displayName:row.display_name,beneficiaries:beneficiaries.results.map(b=>({username:b.username,displayName:b.display_name,classLevel:b.class_level,startsAt:b.starts_at?new Date(b.starts_at).toISOString():null,expiresAt:b.expires_at?new Date(b.expires_at).toISOString():null}))});
    }
    return {items,total:total.count,page};
  }
  const review=/^\/api\/admin\/payments\/([a-f0-9-]{36})\/review$/.exec(path);
  if(review&&method==='POST') {
    need(isAdmin,401,'Please sign in to the administrator dashboard.');
    const input=await bodyJSON(request,4096),id=review[1];
    need(input&&['approve','reject'].includes(input.action),400,'Choose approve or reject.');
    const row=await env.DB.prepare('SELECT * FROM payment_requests WHERE id=?').bind(id).first();
    need(row,404,'Payment request not found.');need(row.status==='pending',409,'This request has already been reviewed. Refresh the payment list.');
    const note=clean(input.note,500),now=Date.now(),reviewedAt=new Date(now).toISOString();
    if(input.action==='reject') {
      need(note.length>=3,400,'Explain why this reference could not be verified.');
      const changed=await env.DB.prepare("UPDATE payment_requests SET status='rejected',review_note=?,reviewed_at=? WHERE id=? AND status='pending'").bind(note,reviewedAt,id).run();
      need(changed.meta.changes===1,409,'This request has already been reviewed.');
    }else{
      need(input.verifiedReceived===true&&input.receivedAmountUGX===row.amount_ugx,400,'Verify receipt in the Airtel merchant account and enter the exact amount received.');
      const nonce=crypto.randomUUID(),duration=PLANS[row.plan].days*86400000;
      // The status claim and all student grants commit in one D1 transaction.
      // A unique claim nonce prevents concurrent reviewers from extending access twice.
      // Renewal starts after any remaining paid time; separate approvals serialize in D1.
      const [changed]=await env.DB.batch([
        env.DB.prepare("UPDATE payment_requests SET status='approved',review_note=?,reviewed_at=?,approval_nonce=? WHERE id=? AND status='pending'").bind(note,reviewedAt,nonce,id),
        env.DB.prepare(`INSERT INTO subscription_grants(payment_id,learner_id,plan,starts_at,expires_at) SELECT p.id,b.learner_id,p.plan,MAX(?,COALESCE((SELECT MAX(g.expires_at) FROM subscription_grants g WHERE g.learner_id=b.learner_id),0)),MAX(?,COALESCE((SELECT MAX(g.expires_at) FROM subscription_grants g WHERE g.learner_id=b.learner_id),0))+? FROM payment_requests p JOIN payment_beneficiaries b ON b.payment_id=p.id WHERE p.id=? AND p.approval_nonce=? ON CONFLICT(payment_id,learner_id) DO NOTHING`).bind(now,now,duration,id,nonce),
      ]);
      need(changed.meta.changes===1,409,'This request has already been reviewed. Refresh the payment list.');
    }
    return {payment:paymentSummary(await env.DB.prepare('SELECT * FROM payment_requests WHERE id=?').bind(id).first())};
  }
  return null;
}
