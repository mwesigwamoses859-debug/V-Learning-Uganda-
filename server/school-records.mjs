// Shared contract: only backend code can write school records through its D1 binding.
const ready = new WeakMap();
export const schoolSchema = [
 `CREATE TABLE IF NOT EXISTS vlearning_students (learner_id TEXT PRIMARY KEY, student_id TEXT NOT NULL UNIQUE, username TEXT NOT NULL, display_name TEXT NOT NULL, class_level TEXT NOT NULL, school_name TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
 `CREATE INDEX IF NOT EXISTS vlearning_student_class ON vlearning_students(class_level, display_name)`,
 `CREATE TABLE IF NOT EXISTS vlearning_quiz_results (id TEXT PRIMARY KEY, learner_id TEXT NOT NULL, content_id TEXT NOT NULL, submission_id TEXT NOT NULL, title TEXT NOT NULL, subject TEXT NOT NULL, topic TEXT NOT NULL, class_level TEXT NOT NULL, correct INTEGER NOT NULL, total INTEGER NOT NULL CHECK(total>0), percentage REAL NOT NULL, created_at TEXT NOT NULL, UNIQUE(learner_id,submission_id))`,
 `CREATE INDEX IF NOT EXISTS vlearning_results_learner ON vlearning_quiz_results(learner_id,created_at)`,
 `CREATE TABLE IF NOT EXISTS school_staff_sessions (token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, expires INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS school_access_codes (code_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS school_connection (id INTEGER PRIMARY KEY CHECK(id=1), last_synced_at TEXT NOT NULL)`
];
export async function initializeSchool(db) {
 if (!ready.has(db)) ready.set(db,db.batch(schoolSchema.map(sql=>db.prepare(sql))).catch(error=>{ready.delete(db);throw error;}));
 await ready.get(db);
}
export async function storeSchoolEvent(db, event) {
 await initializeSchool(db);
 if(event.kind==='learner') {
  const l=event.learner, id='vl-'+l.id;
  const old=await db.prepare('SELECT payload FROM students WHERE id=?').bind(id).first();
  const previous=old?JSON.parse(old.payload):{};
  const parts=l.displayName.trim().split(/\s+/);
  const student={...previous,id,surname:parts[0],otherNames:parts.slice(1).join(' '),
   gender:previous.gender||'',dateOfBirth:previous.dateOfBirth||'',className:l.classLevel?l.classLevel[0]+'.'+l.classLevel.slice(1):'',
   yearOfEntry:Number(l.createdAt.slice(0,4)),photo:previous.photo||'',guardianName:previous.guardianName||'',guardianContact:previous.guardianContact||'',
   communityWorker:previous.communityWorker||'',workerContact:previous.workerContact||'',zoneInNansana:previous.zoneInNansana||'',hasScholarship:previous.hasScholarship||false,
   school:l.schoolName||'',email:l.email||'',phone:l.phone||'',vlearningId:l.id,vlearningUsername:l.username,source:'v-learning-uganda',sourceUpdatedAt:l.updatedAt};
  await db.batch([
   db.prepare(`INSERT INTO vlearning_students(learner_id,student_id,username,display_name,class_level,school_name,phone,email,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(learner_id) DO UPDATE SET username=excluded.username,display_name=excluded.display_name,class_level=excluded.class_level,school_name=excluded.school_name,phone=excluded.phone,email=excluded.email,updated_at=excluded.updated_at WHERE excluded.updated_at>=vlearning_students.updated_at`).bind(l.id,id,l.username,l.displayName,l.classLevel,l.schoolName||'',l.phone||'',l.email||'',l.createdAt,l.updatedAt),
   db.prepare(`INSERT INTO students(id,payload,created_at,updated_at) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at WHERE excluded.updated_at>=students.updated_at`).bind(id,JSON.stringify(student),Date.parse(l.createdAt),Date.parse(l.updatedAt))
  ]);
 } else if(event.kind==='quiz') {
  const r=event.result;
  if(!Number.isInteger(r.correct)||!Number.isInteger(r.total)||r.total<1||r.correct<0||r.correct>r.total)throw new Error('Invalid graded result');
  await db.prepare(`INSERT INTO vlearning_quiz_results(id,learner_id,content_id,submission_id,title,subject,topic,class_level,correct,total,percentage,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(learner_id,submission_id) DO NOTHING`).bind(r.id,r.learnerId,r.contentId,r.submissionId,r.title,r.subject,r.topic||'',r.classLevel||'',r.correct,r.total,100*r.correct/r.total,r.createdAt).run();
 } else throw new Error('Unknown school record type');
 await db.prepare(`INSERT INTO school_connection(id,last_synced_at) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET last_synced_at=excluded.last_synced_at`).bind(new Date().toISOString()).run();
}
