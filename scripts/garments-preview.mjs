import { chromium } from '@playwright/test';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 900 } });
await p.goto('http://localhost:4173/'); await p.getByRole('button', { name: 'Explore the demo closet' }).click();
await p.waitForTimeout(800); await p.goto('http://localhost:4173/#closet'); await p.waitForTimeout(1200);
await p.setViewportSize({ width: 1440, height: 2400 });
await p.waitForTimeout(500); await p.screenshot({ path: '/tmp/closet-new.png', fullPage: true });
await b.close();
