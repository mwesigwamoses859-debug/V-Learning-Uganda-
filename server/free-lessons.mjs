export const FREE_LESSON_LIMIT=5;
export const freeLessonSchema=[
  "CREATE TABLE IF NOT EXISTS learner_free_lessons (learner_id TEXT NOT NULL,content_id TEXT NOT NULL,claimed_at TEXT NOT NULL,PRIMARY KEY(learner_id,content_id))",
];
export function normaliseClass(value){
  let key=String(value??'').trim().toUpperCase().replace(/[\s._-]/g,'').replace(/^PRIMARY/,'P').replace(/^(SENIOR|SECONDARY)/,'S');
  const words=['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN'];
  for(let i=0;i<words.length;i++)if(key==='P'+words[i]||key==='S'+words[i])key=key[0]+(i+1);
  return /^(P[1-7]|S[1-6])$/.test(key)?key:'';
}
export async function freeLessonStatus(db,learnerId){
  if(!learnerId)return {limit:FREE_LESSON_LIMIT,used:0,remaining:0,lessonIds:[]};
  const rows=await db.prepare('SELECT content_id FROM learner_free_lessons WHERE learner_id=? ORDER BY claimed_at,content_id').bind(learnerId).all();
  return {limit:FREE_LESSON_LIMIT,used:rows.results.length,remaining:Math.max(0,FREE_LESSON_LIMIT-rows.results.length),lessonIds:rows.results.map(r=>r.content_id)};
}
export async function claimFreeLesson(db,learnerId,contentId,need){
  // The quota check and insert run in one statement. Concurrent requests cannot claim a sixth lesson.
  await db.prepare("INSERT INTO learner_free_lessons(learner_id,content_id,claimed_at) SELECT ?,?,? WHERE (SELECT COUNT(*) FROM learner_free_lessons WHERE learner_id=?)<? ON CONFLICT(learner_id,content_id) DO NOTHING").bind(learnerId,contentId,new Date().toISOString(),learnerId,FREE_LESSON_LIMIT).run();
  const claimed=await db.prepare('SELECT 1 FROM learner_free_lessons WHERE learner_id=? AND content_id=?').bind(learnerId,contentId).first();
  need(claimed,403,'You have used your five free video lessons. Choose a subscription to open another lesson.');
  return freeLessonStatus(db,learnerId);
}
export async function hasFreeLesson(db,learnerId,contentId){
  return !!await db.prepare('SELECT 1 FROM learner_free_lessons WHERE learner_id=? AND content_id=?').bind(learnerId,contentId).first();
}
