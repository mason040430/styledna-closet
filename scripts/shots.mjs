import { chromium } from '@playwright/test';
const base = 'http://localhost:4173/';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const errors = [];
async function run(vp, prefix, routes) {
  const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(prefix + ' ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errors.push(prefix + ' console: ' + m.text()); });
  await p.goto(base); await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/${prefix}-landing.png` });
  await p.getByRole('button', { name: 'Explore the demo closet' }).click();
  await p.waitForTimeout(1200);
  for (const r of routes) { await p.goto(base + '#/' + r); await p.waitForTimeout(700); await p.screenshot({ path: `/tmp/${prefix}-${r.replace(/\W/g,'_') || 'home'}.png`, fullPage: false }); }
  await ctx.close();
}
await run({ width: 1440, height: 900 }, 'd', ['', 'closet', 'stylist', 'studio', 'looks', 'calendar', 'insights', 'profile', 'add', 'item/demo-boots']);
await run({ width: 390, height: 844 }, 'm', ['', 'closet', 'stylist']);
console.log('ERRORS', JSON.stringify(errors));
await b.close();
