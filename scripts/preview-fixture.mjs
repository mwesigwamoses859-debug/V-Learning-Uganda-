// Explicit local-only UI fixture. It is never imported by the production Worker.
import {readFile} from 'node:fs/promises';
import {paymentNoticeStatements,enqueueRenewals} from '../server/platform.mjs';
import {initialLessonChecks} from '../server/lesson-checks.mjs';
export async function seedPreview(mf,password){
  const origin='https://preview.test';let cookie='';
  async function post(path,body){const r=await mf.dispatchFetch(origin+path,{method:'POST',headers:{Origin:origin,Cookie:cookie,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.240'},body:JSON.stringify(body)});if(r.headers.has('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];if(!r.ok)throw new Error('Preview fixture: '+path+' '+await r.text());return r.json();}
  await post('/api/login',{password});const db=await mf.getD1Database('DB'),bucket=await mf.getR2Bucket('MEDIA');
  const people=[];for(const [username,displayName,classLevel,accountType]of [['preview.learner','Preview Learner','S1','student'],['preview.student','Preview Student','P6','student'],['preview.new','Preview New Learner','S1','student'],['preview.school','Preview Coordinator','','school']]){people.push((await post('/api/learner/signup',{username,displayName,classLevel,accountType,schoolName:'Preview Academy',password})).learner);}
  const now=Date.now(),createdAt=new Date(now).toISOString(),cover=crypto.randomUUID(),pdf=crypto.randomUUID();
  await bucket.put('fixture-cover',await readFile(new URL('../public/images/classroom-uganda.jpg',import.meta.url)),{httpMetadata:{contentType:'image/jpeg'}});await db.prepare("INSERT INTO assets VALUES(?,'fixture-cover','Preview classroom.jpg','image/jpeg',150717,'ready',NULL,?)").bind(cover,now).run();
  await bucket.put('fixture-notes',new TextEncoder().encode('%PDF-1.4 isolated preview notes'),{httpMetadata:{contentType:'application/pdf'}});await db.prepare("INSERT INTO assets VALUES(?,'fixture-notes','Preview notes.pdf','application/pdf',36,'ready',NULL,?)").bind(pdf,now).run();
  const lessons=[];
  for(const [i,check]of initialLessonChecks.entries()){
    const video=crypto.randomUUID(),id=crypto.randomUUID(),objectKey='fixture-video-'+i;await bucket.put(objectKey,new TextEncoder().encode('0000ftypisom local UI fixture'),{httpMetadata:{contentType:'video/mp4'}});await db.prepare("INSERT INTO assets VALUES(?,?,'Preview video.mp4','video/mp4',28,'ready',NULL,?)").bind(video,objectKey,now).run();
    const data={title:i===0?'Heat transfer: conduction, convection and radiation':'Blood circulation: the heart and blood vessels',description:'Isolated preview content for checking the new learning interface. No production lessons or student records are used.',level:i===0?'secondary':'primary',classLevel:check.classLevel,subject:i===0?'Physics':'Science',topic:i===0?'Heat Transfer':'Blood Circulation',teacherName:'Preview Teacher',videoAssetId:video,coverAssetId:cover,pdfAssetId:'',publicPreview:i===0,questions:check.questions,galleryAssetIds:[]};
    await db.prepare("INSERT INTO content VALUES(?,'lesson','published',?,?,?)").bind(id,JSON.stringify(data),createdAt,createdAt).run();await db.batch([video,cover].map(asset=>db.prepare('INSERT INTO content_assets VALUES(?,?)').bind(id,asset)));lessons.push(id);
  }
  const notes=crypto.randomUUID();await db.prepare("INSERT INTO content VALUES(?,'pdf','published',?,?,?)").bind(notes,JSON.stringify({title:'Heat transfer revision notes',description:'Isolated preview resource.',level:'secondary',classLevel:'S1',subject:'Physics',topic:'Heat Transfer',pdfAssetId:pdf,videoAssetId:'',galleryAssetIds:[]}),createdAt,createdAt).run();await db.prepare('INSERT INTO content_assets VALUES(?,?)').bind(notes,pdf).run();
  for(const [i,status]of ['approved','pending'].entries()){
    const id=crypto.randomUUID();await db.prepare(`INSERT INTO payment_requests(id,learner_id,plan,amount_ugx,seat_count,school_name,payer_name,payer_phone,transaction_ref,reference_key,status,created_at,reviewed_at) VALUES(?,?,'weekly',10000,1,'',?,'0700000000',?,?,?, ?,?)`).bind(id,people[i].id,people[i].displayName,'PREVIEW-NOT-A-REAL-PAYMENT-'+i,'PREVIEW'+i,status,createdAt,status==='approved'?createdAt:null).run();await db.prepare('INSERT INTO payment_beneficiaries VALUES(?,?)').bind(id,people[i].id).run();
    if(status==='approved')await db.prepare("INSERT INTO subscription_grants VALUES(?,?,'weekly',?,?)").bind(id,people[i].id,now-5*86400000,now+2*86400000).run();await db.batch(paymentNoticeStatements(db,id,status==='approved'?'approved':'submitted'));
  }
  await db.batch([0,1,2].map(i=>db.prepare('INSERT INTO school_memberships VALUES(?,?,?,?,?)').bind(people[3].id,people[i].id,i===2?'invited':'active',createdAt,createdAt)));await db.prepare('INSERT INTO learner_free_lessons VALUES(?,?,?)').bind(people[0].id,lessons[1],createdAt).run();await enqueueRenewals(db);
}
