const CHUNK = 8 * 1024 * 1024;
const encoder = new TextEncoder();
const schemaReady = new WeakMap();
const schema = [
  `CREATE TABLE IF NOT EXISTS content (id TEXT PRIMARY KEY, kind TEXT NOT NULL, status TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, object_key TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, state TEXT NOT NULL, upload_id TEXT, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS content_assets (content_id TEXT NOT NULL, asset_id TEXT NOT NULL, PRIMARY KEY(content_id, asset_id))`,
  `CREATE INDEX IF NOT EXISTS content_published ON content(status, kind)`,
  `CREATE INDEX IF NOT EXISTS asset_references ON content_assets(asset_id)`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, credential_hash TEXT NOT NULL, expires INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS login_attempts (id TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL)`,
];
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
function need(condition, status, message) { if (!condition) throw new HttpError(status, message); }
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
}
async function digest(value) {
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
function same(a, b) { let difference = a.length ^ b.length; for (let i = 0; i < Math.max(a.length, b.length); i++) difference |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0); return difference === 0; }
function configured(env) { return typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 16 && env.ADMIN_PASSWORD.length <= 256; }
async function initialize(db) {
  if (!schemaReady.has(db)) {
    const operation = db.batch(schema.map(sql => db.prepare(sql))).catch(error => { schemaReady.delete(db); throw error; });
    schemaReady.set(db, operation);
  }
  await schemaReady.get(db);
}
async function limitedBody(request, limit) {
  const declared = request.headers.get('Content-Length');
  need(!declared || Number(declared) <= limit, 413, 'This file or request is too large.');
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.length;
    if (size > limit) { await reader.cancel(); throw new HttpError(413, 'This file or request is too large.'); }
    chunks.push(value);
  }
  const result = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}
async function bodyJSON(request, limit = 512 * 1024) {
  try { return JSON.parse(new TextDecoder().decode(await limitedBody(request, limit))); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'The submitted information is not valid.'); }
}
function csrf(request) {
  need(request.headers.get('Origin') === new URL(request.url).origin && request.headers.get('Sec-Fetch-Site') !== 'cross-site', 403, 'Open the dashboard on this website before making changes.');
}
async function session(request, env) {
  if (!configured(env)) return null;
  const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)vl_admin=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) return null;
  const row = await env.DB.prepare('SELECT token_hash, credential_hash FROM sessions WHERE token_hash = ? AND expires > ?').bind(await digest(token), Date.now()).first();
  return row && same(row.credential_hash, await digest(env.ADMIN_PASSWORD)) ? row : null;
}
async function requireAdmin(request, env) { need(await session(request, env), 401, 'Please sign in to the administrator dashboard.'); }
const text = (value, max = 200) => String(value ?? '').trim().slice(0, max);
function sanitize(entry, isAdmin = false) {
  const data = JSON.parse(entry.data);
  if (!isAdmin && data.questions) data.questions = data.questions.map(({ question, options }) => ({ question, options }));
  return { ...data, id: entry.id, kind: entry.kind, status: entry.status, access: 'free', priceUGX: 0, createdAt: entry.created_at, updatedAt: entry.updated_at };
}
function validateContent(input) {
  const kind = input.kind; const status = input.status === 'published' ? 'published' : 'draft';
  need(['lesson', 'pdf', 'event', 'quiz'].includes(kind), 400, 'Choose a valid content type.');
  const title = text(input.title, 180); need(title.length >= 3, 400, 'Enter a title with at least three characters.');
  const level = input.level;
  need(['primary', 'secondary'].includes(level) || (kind === 'event' && level === 'all'), 400, 'Select Primary or Secondary.');
  const classLevel = kind === 'event' ? text(input.classLevel, 5) : text(input.classLevel, 2);
  if (kind !== 'event') need((level === 'primary' ? /^P[1-7]$/ : /^S[1-6]$/).test(classLevel), 400, 'Choose a class in the selected school level.');
  const subject = text(input.subject, 100); if (kind !== 'event') need(subject.length > 0, 400, 'Enter the subject.');
  const data = { title, description: text(input.description, 10000), level, classLevel, subject, topic: text(input.topic, 150), teacherName: text(input.teacherName, 100) || 'Tr Ojok Mtn', access: 'free', priceUGX: 0,
    videoAssetId: text(input.videoAssetId, 36), pdfAssetId: text(input.pdfAssetId, 36), coverAssetId: text(input.coverAssetId, 36), galleryAssetIds: Array.isArray(input.galleryAssetIds) ? [...new Set(input.galleryAssetIds.map(x => text(x, 36)))].slice(0, 24) : [],
    eventType: ['Quiz', 'Seminar', 'Workshop', 'Other'].includes(input.eventType) ? input.eventType : 'Seminar', date: text(input.date, 10), time: text(input.time, 5), venue: text(input.venue, 200) };
  if (kind === 'event') {
    need(!data.date || /^\d{4}-\d{2}-\d{2}$/.test(data.date), 400, 'Enter a valid event date.');
    need(!data.time || /^\d{2}:\d{2}$/.test(data.time), 400, 'Enter a valid event time.');
  }
  if (kind === 'quiz') {
    need(Array.isArray(input.questions) && input.questions.length <= 100, 400, 'A quiz may contain up to 100 questions.');
    data.questions = input.questions.map(q => {
      const question = text(q.question, 3000); const options = Array.isArray(q.options) ? q.options.map(x => text(x, 1000)) : [];
      need(question && options.length === 4 && options.every(Boolean) && Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3, 400, 'Each question needs four choices and a correct answer.');
      return { question, options, answer: q.answer, explanation: text(q.explanation, 3000) };
    });
  }
  if (status === 'published') {
    if (kind === 'lesson') need(data.videoAssetId, 400, 'Upload the actual lesson video before publishing.');
    if (kind === 'pdf') need(data.pdfAssetId, 400, 'Upload a PDF before publishing.');
    if (kind === 'quiz') need(data.questions.length, 400, 'Add at least one question before publishing.');
  }
  const references = [[data.videoAssetId, 'video/'], [data.pdfAssetId, 'application/pdf'], [data.coverAssetId, 'image/'], ...data.galleryAssetIds.map(id => [id, 'image/'])].filter(([id]) => id);
  return { kind, status, data, references };
}
function filePolicy(mime) {
  if (['video/mp4', 'video/webm', 'video/quicktime'].includes(mime)) return 1024 * 1024 * 1024;
  if (mime === 'application/pdf') return 25 * 1024 * 1024;
  if (['image/jpeg', 'image/png', 'image/webp'].includes(mime)) return 10 * 1024 * 1024;
  return 0;
}
function verifyMagic(bytes, mime) {
  const ascii = (a, b) => new TextDecoder().decode(bytes.slice(a, b));
  if (mime === 'application/pdf') return ascii(0, 5) === '%PDF-';
  if (mime === 'image/png') return bytes[0] === 137 && ascii(1, 4) === 'PNG';
  if (mime === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (mime === 'image/webp') return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  if (mime === 'video/webm') return bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163;
  return ['ftyp', 'moov', 'wide'].includes(ascii(4, 8));
}
async function media(request, env, id) {
  const asset = await env.DB.prepare("SELECT * FROM assets WHERE id = ? AND state = 'ready'").bind(id).first();
  need(asset, 404, 'File not found.');
  const published = await env.DB.prepare("SELECT 1 FROM content_assets ca JOIN content c ON c.id=ca.content_id WHERE ca.asset_id = ? AND c.status='published' LIMIT 1").bind(id).first();
  need(published || await session(request, env), 404, 'File not found.');
  need(env.MEDIA, 503, 'File storage is not connected yet.');
  const meta = await env.MEDIA.head(asset.object_key); need(meta, 404, 'File not found.');
  const headers = new Headers({ 'Content-Type': asset.mime, 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', 'Content-Length': String(meta.size), 'ETag': meta.httpEtag });
  const disposition = new URL(request.url).searchParams.get('download') === '1' ? 'attachment' : 'inline';
  headers.set('Content-Disposition', `${disposition}; filename*=UTF-8''${encodeURIComponent(asset.name)}`);
  let range; const raw = request.headers.get('Range');
  if (raw) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(raw);
    let start, end;
    if (match && (match[1] || match[2])) {
      if (!match[1]) { start = Math.max(0, meta.size - Number(match[2])); end = meta.size - 1; }
      else { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), meta.size - 1) : meta.size - 1; }
    }
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= meta.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${meta.size}` } });
    range = { offset: start, length: end - start + 1 };
    headers.set('Content-Range', `bytes ${start}-${end}/${meta.size}`); headers.set('Content-Length', String(range.length));
  }
  if (request.method === 'HEAD') return new Response(null, { status: range ? 206 : 200, headers });
  const object = await env.MEDIA.get(asset.object_key, range ? { range } : undefined);
  need(object, 404, 'File not found.');
  return new Response(object.body, { status: range ? 206 : 200, headers });
}
async function api(request, env) {
  const url = new URL(request.url); const path = url.pathname.replace(/\/$/, ''); const method = request.method;
  if (path === '/api/status' && method === 'GET') return json({ database: !!env.DB, storage: !!env.MEDIA, adminConfigured: configured(env), access: 'free' });
  need(env.DB, 503, 'The content library is being connected. Please try again shortly.');
  await initialize(env.DB);
  if (!['GET', 'HEAD'].includes(method)) csrf(request);
  if (path === '/api/session' && method === 'GET') return json({ authenticated: !!await session(request, env), configured: configured(env) });
  if (path === '/api/login' && method === 'POST') {
    need(configured(env), 503, 'The owner needs to activate administrator sign-in first.');
    const input = await bodyJSON(request, 4096);
    const now = Date.now(); const windowEnd = (Math.floor(now / 900000) + 1) * 900000;
    const key = await digest((request.headers.get('CF-Connecting-IP') || 'unknown') + ':' + windowEnd);
    await env.DB.prepare('INSERT INTO login_attempts(id, attempts, expires) VALUES (?, 1, ?) ON CONFLICT(id) DO UPDATE SET attempts = attempts + 1').bind(key, windowEnd).run();
    const attempt = await env.DB.prepare('SELECT attempts FROM login_attempts WHERE id = ?').bind(key).first();
    need(attempt.attempts <= 10, 429, 'Too many sign-in attempts. Please wait 15 minutes and try again.');
    need(typeof input.password === 'string' && input.password.length <= 256 && same(await digest(input.password), await digest(env.ADMIN_PASSWORD)), 401, 'The administrator password is incorrect.');
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    await env.DB.batch([
      env.DB.prepare('DELETE FROM sessions WHERE expires < ?').bind(now),
      env.DB.prepare('DELETE FROM login_attempts WHERE expires < ?').bind(now),
      env.DB.prepare('INSERT INTO sessions(token_hash, credential_hash, expires) VALUES (?, ?, ?)').bind(await digest(token), await digest(env.ADMIN_PASSWORD), now + 8 * 3600000),
    ]);
    return json({ authenticated: true }, 200, { 'Set-Cookie': `vl_admin=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=28800` });
  }
  if (path === '/api/logout' && method === 'POST') {
    const current = await session(request, env);
    if (current) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(current.token_hash).run();
    return json({ authenticated: false }, 200, { 'Set-Cookie': 'vl_admin=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
  }
  if (path === '/api/content' && method === 'GET') {
    const rows = await env.DB.prepare("SELECT * FROM content WHERE status='published' ORDER BY created_at DESC LIMIT 500").all();
    return json({ items: rows.results.map(row => sanitize(row)), access: 'free' });
  }
  const mediaMatch = /^\/api\/media\/([a-f0-9-]{36})$/.exec(path);
  if (mediaMatch && ['GET', 'HEAD'].includes(method)) return media(request, env, mediaMatch[1]);
  const gradeMatch = /^\/api\/quiz\/([a-f0-9-]{36})\/grade$/.exec(path);
  if (gradeMatch && method === 'POST') {
    const row = await env.DB.prepare("SELECT * FROM content WHERE id=? AND kind='quiz' AND status='published'").bind(gradeMatch[1]).first();
    need(row, 404, 'Quiz not found.'); const data = JSON.parse(row.data); const { answers } = await bodyJSON(request, 4096);
    need(Array.isArray(answers) && answers.length === data.questions.length && answers.every(x => Number.isInteger(x) && x >= -1 && x <= 3), 400, 'Choose an answer for each question, then submit.');
    const review = data.questions.map((q, i) => ({ correct: answers[i] === q.answer, answer: q.answer, explanation: q.explanation }));
    return json({ correct: review.filter(q => q.correct).length, total: review.length, review });
  }
  await requireAdmin(request, env);
  if (path === '/api/admin/content' && method === 'GET') {
    const rows = await env.DB.prepare('SELECT * FROM content ORDER BY updated_at DESC LIMIT 500').all(); return json({ items: rows.results.map(row => sanitize(row, true)) });
  }
  if (path === '/api/admin/content' && method === 'POST') {
    const input = await bodyJSON(request); const valid = validateContent(input);
    const id = input.id || crypto.randomUUID(); need(/^[a-f0-9-]{36}$/.test(id), 400, 'Invalid content reference.');
    for (const [assetId, prefix] of valid.references) {
      const asset = await env.DB.prepare("SELECT mime FROM assets WHERE id=? AND state='ready'").bind(assetId).first();
      need(asset && asset.mime.startsWith(prefix), 400, 'One of the attached files is missing or has the wrong file type.');
    }
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO content(id,kind,status,data,created_at,updated_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,status=excluded.status,data=excluded.data,updated_at=excluded.updated_at').bind(id, valid.kind, valid.status, JSON.stringify(valid.data), now, now),
      env.DB.prepare('DELETE FROM content_assets WHERE content_id=?').bind(id),
      ...[...new Set(valid.references.map(([assetId]) => assetId))].map(assetId => env.DB.prepare('INSERT INTO content_assets(content_id,asset_id) VALUES(?,?)').bind(id, assetId)),
    ]);
    return json({ item: sanitize(await env.DB.prepare('SELECT * FROM content WHERE id=?').bind(id).first(), true) });
  }
  if (path === '/api/uploads' && method === 'POST') {
    need(env.MEDIA, 503, 'File storage is not connected yet.');
    const input = await bodyJSON(request, 4096); const mime = text(input.mime, 100); const limit = filePolicy(mime);
    need(limit > 0, 400, 'Use MP4, WebM, MOV, PDF, JPG, PNG or WebP files.');
    need(Number.isSafeInteger(input.size) && input.size > 0 && input.size <= limit, 400, 'The selected file exceeds the upload limit.');
    const id = crypto.randomUUID(); const key = `uploads/${id}`; const name = text(input.name, 180).replace(/[\x00-\x1f\x7f]/g, '') || 'learning-material';
    const upload = input.size > CHUNK ? await env.MEDIA.createMultipartUpload(key, { httpMetadata: { contentType: mime } }) : null;
    await env.DB.prepare('INSERT INTO assets(id,object_key,name,mime,size,state,upload_id,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(id, key, name, mime, input.size, 'pending', upload?.uploadId || null, Date.now()).run();
    return json({ id, name, mime, size: input.size, multipart: !!upload, chunkSize: CHUNK }, 201);
  }
  const uploadMatch = /^\/api\/uploads\/([a-f0-9-]{36})(?:\/(part|complete)(?:\/(\d+))?)?$/.exec(path);
  if (uploadMatch) {
    need(env.MEDIA, 503, 'File storage is not connected yet.');
    const asset = await env.DB.prepare("SELECT * FROM assets WHERE id=? AND state='pending' AND created_at > ?").bind(uploadMatch[1], Date.now() - 86400000).first(); need(asset, 404, 'This upload has expired. Please select the file again.');
    if (method === 'PUT' && !uploadMatch[2] && !asset.upload_id) {
      const bytes = await limitedBody(request, CHUNK); need(bytes.length === asset.size, 400, 'The upload is incomplete. Please try again.');
      need(verifyMagic(bytes, asset.mime), 400, 'The file contents do not match the selected file type.');
      await env.MEDIA.put(asset.object_key, bytes, { httpMetadata: { contentType: asset.mime } });
      await env.DB.prepare("UPDATE assets SET state='ready' WHERE id=?").bind(asset.id).run(); return json({ id: asset.id });
    }
    if (method === 'PUT' && uploadMatch[2] === 'part' && asset.upload_id) {
      const number = Number(uploadMatch[3]); const count = Math.ceil(asset.size / CHUNK);
      need(number >= 1 && number <= count, 400, 'Invalid upload part.');
      const expected = number === count ? asset.size - CHUNK * (count - 1) : CHUNK;
      const bytes = await limitedBody(request, CHUNK); need(bytes.length === expected, 400, 'The upload part is incomplete. Please retry.');
      if (number === 1) need(verifyMagic(bytes, asset.mime), 400, 'The file contents do not match the selected file type.');
      const result = await env.MEDIA.resumeMultipartUpload(asset.object_key, asset.upload_id).uploadPart(number, bytes); return json(result);
    }
    if (method === 'POST' && uploadMatch[2] === 'complete' && asset.upload_id) {
      const { parts } = await bodyJSON(request, 65536); const count = Math.ceil(asset.size / CHUNK);
      need(Array.isArray(parts) && parts.length === count && parts.every((p, i) => p.partNumber === i + 1 && typeof p.etag === 'string' && p.etag.length < 200), 400, 'Some parts of this upload are missing.');
      const result = await env.MEDIA.resumeMultipartUpload(asset.object_key, asset.upload_id).complete(parts);
      need(result.size === asset.size, 400, 'The completed file size did not match.');
      await env.DB.prepare("UPDATE assets SET state='ready', upload_id=NULL WHERE id=?").bind(asset.id).run(); return json({ id: asset.id });
    }
  }
  throw new HttpError(404, 'This action was not found.');
}
export default {
  async fetch(request, env) {
    if (!new URL(request.url).pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try { return await api(request, env); }
    catch (error) { if (error instanceof HttpError) return json({ error: error.message }, error.status); console.error('V-Learning API request failed:', error.name); return json({ error: 'We could not complete that action. Please try again.' }, 500); }
  },
};
