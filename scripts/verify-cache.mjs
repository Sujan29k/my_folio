// Run after `npm run build`. Uses an isolated, in-memory backend, never Supabase.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes, createHmac } from 'node:crypto';
import { once } from 'node:events';
import { readdir, readFile } from 'node:fs/promises';

const require = createRequire(import.meta.url);
const requireAdminWrite = require('../backend/src/admin-auth.js');
const secret = randomBytes(32).toString('hex');
const password = randomBytes(24).toString('hex');
const apiToken = randomBytes(32).toString('hex');
process.env.ADMIN_API_TOKEN = apiToken;
const state = {
  hero: { id: 1, name: 'Cache Test Hero', subtitle: 'Server rendered introduction', image_url: '/sujan_nobg.png', github_url: '' },
  projects: [{ id: 1, title: 'Cache Test Project', description: 'Project description', tech_stack: ['TypeScript'], live_url: '', github_url: '', image_url: '/sujan_nobg.png', display_order: 0 }],
  experience: [{ id: 1, company: 'Cache Test Company', role: 'Developer', description: 'Work description', start_date: '2024-01-01', end_date: null, logo_url: '', display_order: 0 }],
  'about/skills': [{ id: 1, category: 'Cache Test Skills', items: ['React'] }],
  'about/resume': { resume_url: 'https://example.com/test-resume.pdf' },
};
const reads = Object.fromEntries(Object.keys(state).map(key => [key, 0]));
let failReads = new Set(['hero']);
let malformedReads = new Set(['about/resume']);
let failWrites = false;
let writes = 0;
const backend = createServer(async (req, res) => {
  req.get = name => req.headers[name.toLowerCase()];
  res.set = (name, value) => { res.setHeader(name, value); return res; };
  res.status = status => { res.statusCode = status; return res; };
  res.json = data => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };
  let allowed = false;
  requireAdminWrite(req, res, () => { allowed = true; });
  if (!allowed) return;
  const path = req.url.replace(/^\/api\//, '');
  const key = path.replace(/\/\d+$/, '');
  if (req.method === 'GET') {
    if (!(key in state)) return res.status(404).json({ error: 'Missing' });
    reads[key]++;
    if (failReads.has(key)) return res.status(500).json({ error: 'Test database unavailable' });
    if (malformedReads.has(key)) return res.json({ error: 'Invalid success payload' });
    return res.json(state[key]);
  }
  writes++;
  if (failWrites) return res.status(500).json({ error: 'Test save failure' });
  if (key === 'upload') return res.json({ url: 'https://example.com/test-upload.png' });
  let body = '';
  for await (const chunk of req) body += chunk;
  const data = body ? JSON.parse(body) : {};
  if (Array.isArray(state[key])) {
    if (req.method === 'DELETE') state[key] = state[key].filter(row => row.id !== Number(path.split('/').at(-1)));
    else if (req.method === 'POST') state[key].push({ ...data, id: 2 });
    else state[key][0] = { ...state[key][0], ...data };
    return res.json(req.method === 'DELETE' ? { message: 'Deleted' } : state[key].at(-1));
  }
  state[key] = { ...state[key], ...data };
  res.json(state[key]);
});
backend.listen(0, '127.0.0.1');
await once(backend, 'listening');
const apiUrl = `http://127.0.0.1:${backend.address().port}`;
const reservation = createServer();
reservation.listen(0, '127.0.0.1');
await once(reservation, 'listening');
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const origin = `http://localhost:${port}`;
let output = '';
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], {
  env: { ...process.env, NODE_ENV: 'production', API_URL: apiUrl, ADMIN_PASSWORD: password, ADMIN_SESSION_SECRET: secret, ADMIN_API_TOKEN: apiToken },
  stdio: ['ignore', 'pipe', 'pipe'],
});
app.stdout.on('data', chunk => { output += chunk; });
app.stderr.on('data', chunk => { output += chunk; });
let cookie;
const request = (path, options = {}) => fetch(`${origin}${path}`, options);
const html = async (path = '/') => {
  const response = await request(path);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control'), /no-store/);
  // Check actual rendered HTML, not just serialized React props.
  return (await response.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
};
const admin = (path, method = 'GET', body, extraHeaders = {}) => request(`/api/admin/content/${path}`, {
  method, headers: { Cookie: cookie || '', Origin: origin, 'Content-Type': 'application/json', ...extraHeaders },
  ...(body !== undefined && { body: JSON.stringify(body) }),
});
try {
  for (let i = 0; i < 150; i++) {
    if (app.exitCode !== null) throw new Error(`Next exited: ${output}`);
    try { if ((await request('/admin/login')).ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
    if (i === 149) throw new Error('Next startup timeout');
  }
  assert.equal((await admin('hero', 'PUT', {})).status, 401);
  assert.equal(writes, 0);
  const dashboard = await request('/admin', { redirect: 'manual' });
  assert.equal(dashboard.status, 307);
  assert.match(dashboard.headers.get('location'), /\/admin\/login/);
  assert.equal((await fetch(`${apiUrl}/api/hero`, { method: 'PUT' })).status, 401);
  const login = (pw, requestOrigin = origin) => request('/api/admin/session', {
    method: 'POST', headers: { Origin: requestOrigin, 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pw }),
  });
  assert.equal((await login(password, 'https://evil.example')).status, 403);
  assert.equal((await login('wrong')).status, 401);
  const session = await login(password);
  assert.equal(session.status, 200);
  const setCookie = session.headers.get('set-cookie');
  for (const attribute of ['HttpOnly', 'Secure', 'SameSite=strict']) assert.ok(setCookie.toLowerCase().includes(attribute.toLowerCase()));
  cookie = setCookie.split(';')[0];
  assert.equal((await admin('hero', 'PUT', {}, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await admin('hero', 'PUT', {}, { Cookie: 'portfolio_admin=9999999999.forged' })).status, 401);
  const expired = String(Math.floor(Date.now() / 1000) - 1);
  const mac = createHmac('sha256', secret).update(`${expired}:${password}`).digest('base64url');
  assert.equal((await admin('hero', 'PUT', {}, { Cookie: `portfolio_admin=${expired}.${mac}` })).status, 401);
  assert.equal((await admin('unknown', 'PUT', {})).status, 404);
  assert.equal(writes, 0);
  console.log('PASS: login, cookie attributes, dashboard guard, forged/expired sessions, origin checks, backend write protection');

  const first = await html();
  assert.match(first, /Could not load hero data/);
  assert.match(first, /Could not load résumé link/);
  assert.match(first, /Cache Test Project/);
  failReads.clear(); malformedReads.clear();
  const recovered = await html();
  for (const text of ['Cache Test Hero', 'Server rendered introduction', 'Cache Test Project', 'Cache Test Company', 'React', 'https://example.com/test-resume.pdf']) assert.ok(recovered.includes(text), `Initial HTML missing ${text}`);
  assert.equal(reads.hero, 2); assert.equal(reads['about/resume'], 2);
  assert.equal(reads.projects, 1); assert.equal(reads.experience, 1); assert.equal(reads['about/skills'], 1);
  const beforeRepeat = { ...reads };
  await html(); await html('/projects');
  assert.deepEqual(reads, beforeRepeat);
  console.log('PASS: initial HTML contains public data; cache shared across requests/routes; failures and malformed 200 responses not cached');

  state.projects[0].title = 'Out of band edit';
  assert.match(await html('/projects'), /Cache Test Project/);
  for (let i = 0; i < 2; i++) {
    const response = await admin('projects');
    assert.match(response.headers.get('cache-control'), /private, no-store/);
    assert.equal((await response.json())[0].title, 'Out of band edit');
  }
  assert.equal(reads.projects, beforeRepeat.projects + 2);
  const updates = [
    ['hero', 'hero', { name: 'Saved Hero' }, 'Saved Hero'],
    ['projects/1', 'projects', { title: 'Saved Project' }, 'Saved Project'],
    ['experience/1', 'experience', { company: 'Saved Company' }, 'Saved Company'],
    ['about/skills/1', 'about/skills', { items: ['SavedSkill'] }, 'SavedSkill'],
    ['about/resume', 'about/resume', { resume_url: 'https://example.com/saved-resume.pdf' }, 'https://example.com/saved-resume.pdf'],
  ];
  for (const [path, key, body, marker] of updates) {
    const before = { ...reads };
    const response = await admin(path, 'PUT', body);
    assert.equal(response.status, 200, await response.text());
    assert.ok((await html()).includes(marker));
    for (const section of Object.keys(reads)) assert.equal(reads[section], before[section] + Number(section === key), `Incorrect invalidation for ${key}: ${section}`);
    if (key === 'projects') assert.ok((await html('/projects')).includes(marker));
  }
  console.log('PASS: admin reads bypass cache; each successful edit invalidates only its section, including both project pages');

  let before = { ...reads };
  failWrites = true;
  assert.equal((await admin('hero', 'PUT', { name: 'Rejected edit' })).status, 500);
  failWrites = false;
  assert.match(await html(), /Saved Hero/);
  assert.deepEqual(reads, before);
  assert.equal((await admin('upload', 'POST', {})).status, 200);
  await html(); assert.deepEqual(reads, before);
  assert.equal((await admin('projects', 'POST', { ...state.projects[0], title: 'Created Project' })).status, 200);
  assert.match(await html('/projects'), /Created Project/);
  assert.equal((await admin('projects/2', 'DELETE')).status, 200);
  assert.doesNotMatch(await html('/projects'), /Created Project/);
  assert.equal((await admin('about/resume', 'PUT', { resume_url: null })).status, 200);
  assert.doesNotMatch(await html(), /https:\/\/example.com\/saved-resume.pdf/);
  assert.equal((await admin('hero', 'PUT', { name: 'Recovered Hero' })).status, 200);
  failReads.add('hero');
  assert.match(await html(), /Could not load hero data/);
  before = { ...reads };
  failReads.clear();
  assert.match(await html(), /Recovered Hero/);
  assert.equal(reads.hero, before.hero + 1);
  console.log('PASS: failed saves/uploads do not invalidate content; create/delete/null resume; recovery after invalidation and API failure');

  // The documented TTLs should be written into Next's real production Data Cache.
  const entries = [];
  for (const name of await readdir('.next/cache/fetch-cache')) {
    try { entries.push(JSON.parse(await readFile(`.next/cache/fetch-cache/${name}`, 'utf8'))); } catch {}
  }
  assert.ok(entries.some(e => e.revalidate === 3600 && e.data?.body?.includes('Recovered Hero')));
  assert.ok(entries.some(e => e.revalidate === 900 && e.data?.body?.includes('Saved Project')));
  const chunks = async dir => {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const path = `${dir}/${item.name}`;
      if (item.isDirectory()) await chunks(path);
      else if (item.name.endsWith('.js')) {
        const source = await readFile(path, 'utf8');
        for (const value of [secret, password, apiToken, 'NEXT_PUBLIC_ADMIN_PASSWORD', 'admin_auth']) assert.ok(!source.includes(value), 'Admin credential or legacy authentication in client bundle');
      }
    }
  };
  await chunks('.next/static/chunks');
  const logout = await request('/api/admin/session', { method: 'DELETE', headers: { Origin: origin, Cookie: cookie } });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
  console.log('PASS: 3600/900 second Data Cache entries; no admin secrets/legacy auth in client chunks; logout clears session');
} catch (error) {
  console.error(output);
  throw error;
} finally {
  app.kill('SIGTERM');
  await once(app, 'exit');
  await new Promise(resolve => backend.close(resolve));
}
