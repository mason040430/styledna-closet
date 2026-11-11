import { chromium } from '@playwright/test';
import http from 'node:http'; import fs from 'node:fs';
const html = fs.readFileSync('dist-single/index.html');
const csp = "default-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src data: https://fonts.gstatic.com; img-src data: blob:; connect-src 'none'";
const srv = http.createServer((q, r) => {
  if (q.url === '/frame') { r.writeHead(200, { 'content-type': 'text/html', 'content-security-policy': csp }); r.end(html); }
  else { r.writeHead(200, { 'content-type': 'text/html' }); r.end('<iframe src="/frame" sandbox="allow-scripts allow-same-origin allow-forms" style="width:1280px;height:800px;border:0"></iframe>'); }
}).listen(4300);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1300, height: 820 } });
const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:4300/'); const f = p.frameLocator('iframe');
await f.getByRole('button', { name: 'Explore the demo closet' }).click();
await f.getByRole('link', { name: 'Stylist' }).first().click();
await f.getByRole('button', { name: 'Three different looks with my jacket' }).click();
await p.waitForTimeout(800);
console.log('articles', await f.getByRole('article').count());
const fonts = await p.frames()[1].evaluate(() => [...document.fonts].filter(x => x.status === 'loaded').map(x => x.family).join(','));
console.log('fonts', fonts, 'hash', await p.frames()[1].evaluate(() => location.hash));
await p.screenshot({ path: '/tmp/single.png' });
console.log('errors', JSON.stringify(errs));
await b.close(); srv.close();
