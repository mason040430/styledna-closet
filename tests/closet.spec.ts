import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
const fx = (f: string) => path.resolve('tests/fixtures', f);

function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

async function upload(page: Page, files: string[]) {
  await page.goto('/#/add');
  await page.getByTestId('file-input').setInputFiles(files.map(fx));
}

test('full owner journey in "my closet": upload → edit → search → outfit → suggestion → calendar → reload', async ({ page }) => {
  const errors = watchErrors(page);
  // 1–2: new user opens site and starts their own closet
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your wardrobe/ })).toBeVisible();
  await page.getByRole('button', { name: 'Start my closet' }).click();
  await expect(page.getByText('Your closet is empty')).toBeVisible();

  // 3: upload three photos at once; on-device suggestions fill the form
  await upload(page, ['black-leather-boots.png', 'navy-striped-tee.jpg', 'IMG_2041.jpg']);
  await expect(page.getByText(/3 to review/)).toBeVisible({ timeout: 20_000 });
  const boots = page.getByRole('article', { name: 'Photo black-leather-boots.png' });
  await expect(boots.getByRole('textbox').first()).toHaveValue('Black boots');
  await expect(boots.getByRole('button', { name: 'Footwear', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(boots.getByText('Clean background')).toBeVisible();
  const tee = page.getByRole('article', { name: 'Photo navy-striped-tee.jpg' });
  await expect(tee.getByText(/Pattern: Striped/)).toBeVisible();
  // the unnamed photo needs a manual category: make it Bottoms / Jeans
  const third = page.getByRole('article', { name: 'Photo IMG_2041.jpg' });
  await third.getByRole('button', { name: 'Bottoms', exact: true }).click();
  await third.locator('select').first().selectOption('Jeans');
  await third.getByRole('textbox').first().fill('Blue jeans');
  await page.getByRole('button', { name: 'Save all 3' }).click();
  await expect(page.getByText(/0 to review · 3 saved/)).toBeVisible();

  // 4: items appear in the wardrobe
  await page.goto('/#/closet');
  await expect(page.getByRole('heading', { name: /3 pieces/ })).toBeVisible();
  for (const n of ['Black boots', 'Blue jeans']) await expect(page.getByText(n, { exact: true })).toBeVisible();

  // 5: edit metadata
  await page.getByRole('button', { name: 'Blue jeans', exact: true }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('textbox').first().fill('Straight blue jeans');
  await page.getByRole('button', { name: 'Class', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: 'Straight blue jeans' })).toBeVisible();
  await expect(page.getByText('Everyday, Class')).toBeVisible();

  // 6: search and filter
  await page.goto('/#/closet');
  await page.getByRole('searchbox', { name: 'Search your closet' }).fill('striped');
  await expect(page.getByText('1 of 3 pieces')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search your closet' }).fill('');
  await page.getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('group', { name: 'Color filter' }).getByRole('button', { name: 'Black' }).click();
  await expect(page.getByText('1 of 3 pieces')).toBeVisible();
  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByRole('group', { name: 'Categories' }).getByRole('button', { name: /^Footwear/ }).click();
  await expect(page.getByText('1 of 3 pieces')).toBeVisible();

  // 7–8: create and save an outfit in the studio
  await page.goto('/#/studio');
  await page.getByRole('button', { name: /Navy|White|Cream|striped/i }).first().click();
  await page.getByRole('group', { name: 'Categories' }).getByRole('button', { name: /^Bottoms/ }).click();
  await page.getByRole('button', { name: 'Straight blue jeans', exact: true }).click();
  await page.getByRole('group', { name: 'Categories' }).getByRole('button', { name: /^Footwear/ }).click();
  await page.getByRole('button', { name: 'Black boots', exact: true }).click();
  await expect(page.getByText('✓ Complete look')).toBeVisible();
  await page.getByPlaceholder(/Name this look/).fill('Test look');
  await page.getByRole('button', { name: 'Save look' }).click();
  await expect(page.getByText('Look saved.')).toBeVisible();

  // 9: reopen the saved outfit
  await page.goto('/#/looks');
  await expect(page.getByRole('heading', { name: 'Test look' })).toBeVisible();
  await page.getByRole('button', { name: 'Open Test look' }).click();
  await expect(page.getByPlaceholder(/Name this look/)).toHaveValue('Test look');

  // 10: receive a suggestion with reasons, and give feedback
  await page.goto('/#/stylist');
  await page.getByRole('button', { name: 'Any', exact: true }).click();
  await page.getByRole('textbox', { name: 'Describe what you need' }).fill('What can I wear with my boots?');
  await page.getByRole('button', { name: 'Style me' }).click();
  await expect(page.getByText(/I read:.*using your black boots/i)).toBeVisible();
  await expect(page.getByText('Why this works').first()).toBeVisible();
  await page.getByRole('button', { name: 'Useful — more like this' }).first().click();
  await expect(page.getByText('Noted — more like this.')).toBeVisible();

  // 11: plan the outfit on a date
  await page.goto('/#/looks');
  await page.getByRole('button', { name: 'Plan' }).first().click();
  await page.locator('dialog input[type=date]').fill('2026-12-01');
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  await expect(page.getByText('Added to your calendar.')).toBeVisible();

  // 12–13: refresh and confirm persistence
  await page.reload();
  await page.goto('/#/looks');
  await expect(page.getByRole('heading', { name: 'Test look' })).toBeVisible();
  await expect(page.getByText(/planned Dec 1/)).toBeVisible();
  await page.goto('/#/closet');
  await expect(page.getByRole('heading', { name: /3 pieces/ })).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('privacy: another browser profile and the demo cannot see my closet', async ({ browser }) => {
  const a = await browser.newContext(); const pa = await a.newPage();
  await pa.goto('/'); await pa.getByRole('button', { name: 'Start my closet' }).click();
  await upload(pa, ['black-leather-boots.png']);
  await pa.getByRole('button', { name: 'Save piece' }).click();
  await expect(pa.getByText('Added to your closet.')).toBeVisible();
  // demo workspace is separate
  await pa.goto('/#/settings'); await pa.getByRole('main').getByRole('button', { name: 'Switch to demo closet' }).click();
  await pa.goto('/#/closet');
  await expect(pa.getByRole('heading', { name: /21 pieces/ })).toBeVisible();
  await expect(pa.getByText('Black boots', { exact: true })).toHaveCount(0);
  // different user/profile sees nothing
  const b = await browser.newContext(); const pb = await b.newPage();
  await pb.goto('/'); await pb.getByRole('button', { name: 'Start my closet' }).click();
  await expect(pb.getByText('Your closet is empty')).toBeVisible();
  await a.close(); await b.close();
});

test('invalid and broken uploads are handled without crashing', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/'); await page.getByRole('button', { name: 'Start my closet' }).click();
  await upload(page, ['notes.txt', 'broken.png']);
  await expect(page.getByText('“notes.txt” is not an image.')).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: /could not be opened|format/i })).toBeVisible({ timeout: 15_000 });
  await page.goto('/#/closet');
  await expect(page.getByText('Your closet is empty')).toBeVisible().catch(async () => expect(page.getByText('Nothing here yet')).toBeVisible());
  expect(errors.filter((e) => !/decode|image|Failed to load/i.test(e))).toEqual([]);
});

test('demo mode: suggestions, calendar wear logging, insights, quiz import', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/'); await page.getByRole('button', { name: 'Explore the demo closet' }).click();
  await expect(page.getByText(/fictional sample items/).first()).toBeVisible();
  await page.goto('/#/stylist');
  await page.getByRole('button', { name: 'Three different looks with my jacket' }).click();
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.goto('/#/profile');
  await page.getByPlaceholder(/style-dna-zeta/).fill('https://style-dna-zeta.vercel.app/result?type=visionary&e=75&x=83&i=75&d=83&s=75');
  await page.getByRole('button', { name: 'Import result' }).click();
  await expect(page.getByText('The Visionary')).toBeVisible();
  await expect(page.getByRole('group', { name: 'Exploration' }).getByRole('button', { name: 'Stretch me' })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Remove quiz result' }).click();
  await expect(page.getByText('Already took the StyleDNA test?')).toBeVisible();
  // plan a look for today, mark it worn from the Today screen, and check wear counts move
  await page.goto('/#/item/demo-tee-white');
  const before = Number(await page.locator('p.font-serif.text-3xl').first().innerText());
  await page.goto('/#/looks');
  const card = page.getByRole('article').filter({ hasText: 'Monday class uniform' });
  await card.getByRole('button', { name: 'Plan' }).click();
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  await page.goto('/#/');
  await page.getByRole('button', { name: 'I wore this' }).click();
  await expect(page.getByRole('button', { name: '✓ Worn today' })).toBeVisible();
  await page.goto('/#/item/demo-tee-white');
  await expect(page.locator('p.font-serif.text-3xl').first()).toHaveText(String(before + 1));
  await page.goto('/#/insights');
  await expect(page.getByRole('heading', { name: 'By category' })).toBeVisible();
  await expect(page.getByText('Looks marked worn')).toBeVisible();
  expect(errors).toEqual([]);
});

test('navigation has no broken links (desktop and mobile)', async ({ page }) => {
  await page.goto('/'); await page.getByRole('button', { name: 'Explore the demo closet' }).click();
  await expect(page.locator('main h1').first()).toBeVisible();
  const hrefs = await page.locator('aside nav a[href^="#"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThanOrEqual(10);
  for (const h of hrefs) { await page.goto('/' + h); await expect(page.getByText('Page not found')).toHaveCount(0); await expect(page.locator('main h1').first()).toBeVisible(); }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const r of ['', 'closet', 'add', 'stylist', 'studio', 'looks', 'calendar', 'insights', 'profile', 'settings', 'item/demo-boots']) {
    await page.goto('/#/' + r);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow on /${r}`).toBeLessThanOrEqual(1);
  }
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible();
});

test('mobile: upload and save from a phone-sized screen', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto('/'); await page.getByRole('button', { name: 'Start my closet' }).click();
  await page.getByRole('link', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Take a photo' })).toBeVisible();
  await page.getByTestId('file-input').setInputFiles(fx('black-leather-boots.png'));
  await page.getByRole('button', { name: 'Save piece' }).click();
  await expect(page.getByText('Added to your closet.')).toBeVisible();
  await page.getByRole('link', { name: 'Closet', exact: true }).click();
  await expect(page.getByText('Black boots', { exact: true })).toBeVisible();
  await ctx.close();
});
