// Takes the dossier screenshots of the Leonida Trophy Guide with the Playwright Chromium on this
// machine, driven over CDP with Node's built-in WebSocket (no extra packages). Serves app/ with the
// repo's own serve.ts, seeds 13 earned trophies into localStorage before the app loads (the way the
// house guides' screenshots were seeded), opens each view, and saves a JPEG per shot.
// Usage: node tools/shots.mjs   (writes screenshots/1-checklist.jpg … 4-spoilers.jpg)
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
const PORT = 8080;
const CDP_PORT = 9333;
const here = fileURLToPath(new URL('..', import.meta.url));
const SEED = ['Just Like Paradise', 'Paradise Lost', 'Trust', 'Break the Bank', 'Master of None',
  'Stick Fiddler', 'Baited My Tackle', 'Earn Cash, Not Kudos', 'Whip It Good', 'Treat Yo Self',
  'On the Spot', 'Hot Together', 'Cunning Stunts'];

const SHOTS = [
  // Cover: checklist, spoiler off, a silver trophy's guide open beside the list, scrolled so the guide shows.
  { file: '1-checklist.jpg', hash: '#trophy-40', setup: `document.getElementById('spoiler').click(); window.scrollTo(0, 100)` },
  { file: '2-roadmap.jpg', hash: '#roadmap', setup: `window.scrollTo(0, 0)` },
  // Missables: leave the browser's anchor scroll to the section, so the full guide and its sources show.
  { file: '3-missables.jpg', hash: '#missables', setup: '' },
  // Spoiler setting at work: default on, story trophies masked until earned — scrolled so masked rows show.
  { file: '4-spoilers.jpg', hash: '#checklist', setup: `window.scrollTo(0, 420)` },
];

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function waitFor(url, tries = 50) {
  for (let i = 0; i < tries; i++) {
    try { const res = await fetch(url); if (res.ok) return; } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error(`never came up: ${url}`);
}

const server = spawn('node', ['serve.ts', '--port', String(PORT)], { cwd: here, stdio: 'ignore' });
const chrome = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
  `--remote-debugging-port=${CDP_PORT}`, '--window-size=1280,800', 'about:blank'],
  { stdio: 'ignore' });
try {
  await waitFor(`http://127.0.0.1:${PORT}/`);
  await waitFor(`http://127.0.0.1:${CDP_PORT}/json/version`);
  const targets = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
  const page = targets.find((t) => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const externalRequests = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Network.requestWillBeSent') {
      const url = msg.params.request.url;
      if (!url.startsWith(`http://localhost:${PORT}`) && !url.startsWith(`http://127.0.0.1:${PORT}`) && !url.startsWith('data:')) {
        externalRequests.push(url);
      }
    }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const mid = ++id;
    pending.set(mid, resolve);
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Page.addScriptToEvaluateOnNewDocument', { source:
    `localStorage.setItem('gta6-trophy-guide-progress-v1', ${JSON.stringify(JSON.stringify(SEED))});` });
  for (const shot of SHOTS) {
    // A fresh document per shot (the ?shot= query forces a reload): app state never leaks between shots.
    await send('Page.navigate', { url: `http://localhost:${PORT}/?shot=${shot.file}${shot.hash}` });
    await sleep(1200);
    if (shot.setup) {
      await send('Runtime.evaluate', { expression: shot.setup });
      await sleep(400);
    }
    const check = await send('Runtime.evaluate', { expression:
      `JSON.stringify({rows: document.querySelectorAll('.trophy').length, progress: document.getElementById('progress-count').textContent, title: document.title})`, returnByValue: true });
    console.log(shot.file, check.result?.result?.value);
    const snap = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
    const buf = Buffer.from(snap.result.data, 'base64');
    writeFileSync(join(here, 'screenshots', shot.file), buf);
    console.log(shot.file, buf.length, 'bytes');
  }
  console.log('external requests during shots:', JSON.stringify(externalRequests));
  ws.close();
} finally {
  chrome.kill();
  server.kill();
}
