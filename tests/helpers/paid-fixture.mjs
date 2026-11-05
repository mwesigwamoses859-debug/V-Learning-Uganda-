import {randomUUID} from 'node:crypto';
// Existing content/account tests use a paid fixture; billing tests exercise real approval.
export async function grantTestSubscription(mf,username) {
 const db=await mf.getD1Database('DB'),row=await db.prepare('SELECT id FROM learners WHERE username=?').bind(username).first();
 if(!row)throw new Error('Missing isolated test learner: '+username);
 const id=randomUUID(),now=Date.now();
 await db.batch([
  db.prepare("INSERT INTO payment_requests(id,learner_id,plan,amount_ugx,seat_count,school_name,payer_name,payer_phone,transaction_ref,reference_key,status,created_at,reviewed_at) VALUES(?,?,'monthly',30000,1,'','Isolated test fixture','0700000000',?,?,'approved',?,?)").bind(id,row.id,id,id,new Date(now).toISOString(),new Date(now).toISOString()),
  db.prepare('INSERT INTO payment_beneficiaries(payment_id,learner_id) VALUES(?,?)').bind(id,row.id),
  db.prepare("INSERT INTO subscription_grants(payment_id,learner_id,plan,starts_at,expires_at) VALUES(?,?,'monthly',?,?)").bind(id,row.id,now,now+30*86400000),
 ]);
}
