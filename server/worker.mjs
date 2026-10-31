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
  `CREATE TABLE IF NOT EXISTS learners (id TEXT PRIMARY KEY, username TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, class_level TEXT NOT NULL, password_hash TEXT NOT NULL, recovery_hash TEXT NOT NULL, credential_version INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS learner_sessions (token_hash TEXT PRIMARY KEY, learner_id TEXT NOT NULL, credential_version INTEGER NOT NULL, expires INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS learner_session_owner ON learner_sessions(learner_id)`,
  `CREATE INDEX IF NOT EXISTS learner_session_expiry ON learner_sessions(expires)`,
  `CREATE TABLE IF NOT EXISTS learner_attempts (id TEXT PRIMARY KEY, attempts INTEGER NOT NULL, expires INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS learner_attempt_expiry ON learner_attempts(expires)`,
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
function adminSetupIssue(env) {
  if (env.ADMIN_PASSWORD === undefined || env.ADMIN_PASSWORD === null) return 'missing';
  if (typeof env.ADMIN_PASSWORD !== 'string') return 'unavailable';
  if (env.ADMIN_PASSWORD.length < 16) return 'too_short';
  if (env.ADMIN_PASSWORD.length > 256) return 'too_long';
  return null;
}
function configured(env) { return adminSetupIssue(env) === null; }
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
  need(request.headers.get('Origin') === new URL(request.url).origin && request.headers.get('Sec-Fetch-Site') !== 'cross-site', 403, 'Open this website before submitting changes.');
}
async function session(request, env) {
  if (!configured(env)) return null;
  const token = request.headers.get('Cookie')?.match(/(?:^|;\s*)vl_admin=([a-f0-9]{64})(?:;|$)/)?.[1];
  if (!token) return null;
  const row = await env.DB.prepare('SELECT token_hash, credential_hash FROM sessions WHERE token_hash = ? AND expires > ?').bind(await digest(token), Date.now()).first();
  return row && same(row.credential_hash, await digest(env.ADMIN_PASSWORD)) ? row : null;
}
async function requireAdmin(request, env) { need(await session(request, env), 401, 'Please sign in to the administrator dashboard.'); }

// Learner accounts never share administrator credentials, cookies or permissions.
const LEARNER_TTL = 7 * 86400000;
const PASSWORD_ITERATIONS = 100000; // Cloudflare's production Web Crypto per-call ceiling.
const randomHex = size => Array.from(crypto.getRandomValues(new Uint8Array(size)), b => b.toString(16).padStart(2, '0')).join('');
const clearLearnerCookie = 'vl_learner=; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=0';
function learnerCookie(token) { return `vl_learner=${token}; Path=/api; HttpOnly; Secure; SameSite=Strict; Max-Age=${LEARNER_TTL / 1000}`; }
function learnerToken(request) { return request.headers.get('Cookie')?.match(/(?:^|;\s*)vl_learner=([a-f0-9]{64})(?:;|$)/)?.[1]; }
function username(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}
function validateUsername(value) {
  const name = username(value);
  need(/^[a-z0-9][a-z0-9._-]{2,29}$/.test(name), 400, 'Use 3–30 letters, numbers, dots, underscores or hyphens for your username.');
  need(!['admin', 'administrator', 'support', 'root', 'v-learning', 'v-learning-uganda'].includes(name), 400, 'Please choose a different learner username.');
  return name;
}
function validatePassword(value) {
  need(typeof value === 'string' && value.length >= 12 && value.length <= 128, 400, 'Choose a password with 12–128 characters. A few unrelated words work well.');
  const common = ['password1234', 'password12345', 'password123456', '123456789012', '1234567890123', '12345678901234', 'qwertyuiop12', 'qwertyuiop123', 'vlearninguganda', 'v-learninguganda'];
  need(!common.includes(value.toLowerCase()) && !/^(.)\1+$/.test(value), 400, 'Choose a less predictable password, such as a few unrelated words.');
  return value;
}
function learnerProfile(input) {
  need(typeof input.displayName === 'string' && input.displayName.trim().length >= 2 && input.displayName.trim().length <= 80 && !/[\x00-\x1f\x7f]/.test(input.displayName), 400, 'Enter a first name or nickname with 2–80 characters.');
  const classLevel = input.classLevel ?? '';
  need(typeof classLevel === 'string' && (classLevel === '' || /^(P[1-7]|S[1-6])$/.test(classLevel)), 400, 'Choose a Primary or Secondary class, or leave the class open.');
  return { displayName: input.displayName.trim(), classLevel };
}
function publicLearner(row) {
  return { id: row.id, username: row.username, displayName: row.display_name, classLevel: row.class_level, createdAt: row.created_at };
}
async function passwordKey(password, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bytes = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: Uint8Array.from(salt.match(/../g), byte => parseInt(byte, 16)), iterations }, key, 256));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}
async function hashPassword(password) {
  const salt = randomHex(16);
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${salt}$${await passwordKey(password, salt, PASSWORD_ITERATIONS)}`;
}
async function checkPassword(password, stored) {
  const match = /^pbkdf2-sha256\$(\d+)\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(stored || '');
  // A missing username still incurs the same KDF work as a real account.
  const salt = match?.[2] || '00000000000000000000000000000000';
  const iterations = match ? Number(match[1]) : PASSWORD_ITERATIONS;
  need(iterations >= 100000 && iterations <= PASSWORD_ITERATIONS, 503, 'Account sign-in is temporarily unavailable.');
  const candidate = await passwordKey(password, salt, iterations);
  return !!match && same(candidate, match[3]);
}
function newRecoveryCode() { return randomHex(16).toUpperCase().match(/.{4}/g).join('-'); }
async function recoveryDigest(code) { return digest('vl-learner-recovery:' + code.replace(/[-\s]/g, '').toUpperCase()); }
async function learnerSession(request, env) {
  const token = learnerToken(request);
  if (!token) return null;
  return env.DB.prepare('SELECT l.*, s.token_hash FROM learner_sessions s JOIN learners l ON l.id = s.learner_id AND l.credential_version = s.credential_version WHERE s.token_hash = ? AND s.expires > ?').bind(await digest(token), Date.now()).first();
}
async function issueLearnerSession(request, env, row) {
  const token = randomHex(32); const now = Date.now(); const previous = learnerToken(request);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM learner_sessions WHERE expires <= ?').bind(now),
    ...(previous ? [env.DB.prepare('DELETE FROM learner_sessions WHERE token_hash = ?').bind(await digest(previous))] : []),
    // Capture the verified credential version; a concurrent password reset invalidates this session too.
    env.DB.prepare('INSERT INTO learner_sessions(token_hash, learner_id, credential_version, expires) VALUES (?, ?, ?, ?)').bind(await digest(token), row.id, row.credential_version, now + LEARNER_TTL),
  ]);
  return learnerCookie(token);
}
async function learnerRateLimit(request, env, action, name = '', period = 900000, ipLimit = 30, accountLimit = 10) {
  const now = Date.now(); const end = (Math.floor(now / period) + 1) * period;
  const subjects = [[`ip:${request.headers.get('CF-Connecting-IP') || 'unknown'}`, ipLimit], ...(name ? [[`username:${name}`, accountLimit]] : [])];
  const keys = await Promise.all(subjects.map(async ([subject, limit]) => [await digest(`${action}:${subject}:${end}`), limit]));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM learner_attempts WHERE expires <= ?').bind(now),
    ...keys.map(([key]) => env.DB.prepare('INSERT INTO learner_attempts(id, attempts, expires) VALUES (?, 1, ?) ON CONFLICT(id) DO UPDATE SET attempts = attempts + 1').bind(key, end)),
  ]);
  for (const [key, limit] of keys) {
    const attempt = await env.DB.prepare('SELECT attempts FROM learner_attempts WHERE id = ?').bind(key).first();
    need(attempt.attempts <= limit, 429, action === 'signup' ? 'Too many account requests. Please try again in an hour.' : 'Too many attempts. Please wait 15 minutes and try again.');
  }
}
async function learnerAPI(request, env, path, method) {
  if (path === '/api/learner/session' && method === 'GET') {
    const row = await learnerSession(request, env);
    return json({ learner: row ? publicLearner(row) : null });
  }
  if (path === '/api/learner/logout' && method === 'POST') {
    const token = learnerToken(request);
    if (token) await env.DB.prepare('DELETE FROM learner_sessions WHERE token_hash = ?').bind(await digest(token)).run();
    return json({ learner: null }, 200, { 'Set-Cookie': clearLearnerCookie });
  }
  if (path === '/api/learner/signup' && method === 'POST') {
    await learnerRateLimit(request, env, 'signup', '', 3600000, 50);
    const input = await bodyJSON(request, 4096);
    need(input && typeof input === 'object' && !Array.isArray(input), 400, 'Enter your account details.');
    const name = validateUsername(input.username); const profile = learnerProfile(input); const password = validatePassword(input.password);
    const exists = await env.DB.prepare('SELECT id FROM learners WHERE username = ?').bind(name).first();
    need(!exists, 409, 'That username is already taken. Try a different username or log in.');
    const id = crypto.randomUUID(); const now = new Date().toISOString(); const recoveryCode = newRecoveryCode();
    const passwordHash = await hashPassword(password); const recoveryHash = await recoveryDigest(recoveryCode);
    const inserted = await env.DB.prepare('INSERT INTO learners(id, username, display_name, class_level, password_hash, recovery_hash, credential_version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?) ON CONFLICT(username) DO NOTHING').bind(id, name, profile.displayName, profile.classLevel, passwordHash, recoveryHash, now, now).run();
    need(inserted.meta.changes === 1, 409, 'That username is already taken. Try a different username or log in.');
    const row = await env.DB.prepare('SELECT * FROM learners WHERE id = ?').bind(id).first();
    return json({ learner: publicLearner(row), recoveryCode }, 201, { 'Set-Cookie': await issueLearnerSession(request, env, row) });
  }
  if (path === '/api/learner/login' && method === 'POST') {
    const input = await bodyJSON(request, 4096);
    need(input && typeof input === 'object' && !Array.isArray(input), 400, 'Enter your username and password.');
    const name = username(input.username).slice(0, 128);
    await learnerRateLimit(request, env, 'login', name || '(empty)');
    need(typeof input.password === 'string' && input.password.length > 0 && input.password.length <= 128, 401, 'The username or password is incorrect.');
    const row = await env.DB.prepare('SELECT * FROM learners WHERE username = ?').bind(name).first();
    need(await checkPassword(input.password, row?.password_hash), 401, 'The username or password is incorrect.');
    return json({ learner: publicLearner(row) }, 200, { 'Set-Cookie': await issueLearnerSession(request, env, row) });
  }
  if (path === '/api/learner/recover' && method === 'POST') {
    const input = await bodyJSON(request, 4096);
    need(input && typeof input === 'object' && !Array.isArray(input), 400, 'Enter your recovery details.');
    const name = username(input.username).slice(0, 128);
    await learnerRateLimit(request, env, 'recover', name || '(empty)', 900000, 15, 5);
    const rawCode = typeof input.recoveryCode === 'string' ? input.recoveryCode : '';
    const code = rawCode.replace(/[-\s]/g, '').toUpperCase();
    const row = await env.DB.prepare('SELECT * FROM learners WHERE username = ?').bind(name).first();
    const providedHash = await recoveryDigest(code);
    need(/^[A-F0-9]{32}$/.test(code) && row && same(providedHash, row.recovery_hash), 401, 'The username or recovery code is incorrect.');
    const passwordHash = await hashPassword(validatePassword(input.newPassword)); const recoveryCode = newRecoveryCode();
    const changed = await env.DB.prepare('UPDATE learners SET password_hash = ?, recovery_hash = ?, credential_version = credential_version + 1, updated_at = ? WHERE id = ? AND credential_version = ? AND recovery_hash = ?').bind(passwordHash, await recoveryDigest(recoveryCode), new Date().toISOString(), row.id, row.credential_version, providedHash).run();
    need(changed.meta.changes === 1, 401, 'This recovery code has already been used.');
    await env.DB.prepare('DELETE FROM learner_sessions WHERE learner_id = ?').bind(row.id).run();
    return json({ learner: null, recoveryCode }, 200, { 'Set-Cookie': clearLearnerCookie });
  }
  if (['/api/learner/profile', '/api/learner/password'].includes(path) && method === 'POST') {
    const row = await learnerSession(request, env);
    need(row, 401, 'Please log in to your learner account.');
    const input = await bodyJSON(request, 4096);
    need(input && typeof input === 'object' && !Array.isArray(input), 400, 'Enter your account details.');
    if (path.endsWith('/profile')) {
      const profile = learnerProfile(input);
      await env.DB.prepare('UPDATE learners SET display_name = ?, class_level = ?, updated_at = ? WHERE id = ?').bind(profile.displayName, profile.classLevel, new Date().toISOString(), row.id).run();
      return json({ learner: publicLearner({ ...row, display_name: profile.displayName, class_level: profile.classLevel }) });
    }
    await learnerRateLimit(request, env, 'password', row.username);
    need(typeof input.currentPassword === 'string' && input.currentPassword.length <= 128 && await checkPassword(input.currentPassword, row.password_hash), 401, 'Your current password is incorrect.');
    const passwordHash = await hashPassword(validatePassword(input.newPassword));
    const changed = await env.DB.prepare('UPDATE learners SET password_hash = ?, credential_version = credential_version + 1, updated_at = ? WHERE id = ? AND credential_version = ?').bind(passwordHash, new Date().toISOString(), row.id, row.credential_version).run();
    need(changed.meta.changes === 1, 401, 'Your account has changed. Please log in again.');
    await env.DB.prepare('DELETE FROM learner_sessions WHERE learner_id = ?').bind(row.id).run();
    return json({ learner: null }, 200, { 'Set-Cookie': clearLearnerCookie });
  }
  throw new HttpError(404, 'Account page not found.');
}
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
  if (path === '/api/status' && method === 'GET') return json({ database: !!env.DB, storage: !!env.MEDIA, adminConfigured: configured(env), adminSetupIssue: adminSetupIssue(env), access: 'free' });
  need(env.DB, 503, 'The content library is being connected. Please try again shortly.');
  await initialize(env.DB);
  if (!['GET', 'HEAD'].includes(method)) csrf(request);
  if (path.startsWith('/api/learner/')) return learnerAPI(request, env, path, method);
  if (path === '/api/session' && method === 'GET') return json({ authenticated: !!await session(request, env), configured: configured(env), setupIssue: adminSetupIssue(env) });
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
