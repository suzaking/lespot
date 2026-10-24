import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('map-first verified places and navigation', async ({ page, context }) => {
  await page.route('https://cyberjapandata.gsi.go.jp/**', (r) => r.abort());
  const data = JSON.parse(readFileSync('data/bootstrap-spots.json', 'utf8'));
  await page.route('**/api/spots', (r) => r.fulfill({ json: data }));
  await page.goto('/');
  await expect(page.locator('[aria-label="休憩スポットの地図"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'スポット一覧を開く' })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(0);
  await page.getByRole('button', { name: 'スポット一覧を開く' }).click();
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.getByLabel('スポット名・場所').fill('ノリタケ');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: '地図で見る' }).click();
  await expect(page.getByRole('heading', { name: 'ノリタケの森' })).toBeVisible();
  await expect(page.getByRole('link', { name: /徒歩ルート/ })).toHaveAttribute(
    'href', /destination=35\.17989%2C136\.881573&travelmode=walking/,
  );
  await context.route('https://www.google.com/maps/dir/**', (r) =>
    r.fulfill({ contentType: 'text/html', body: '<html><body>external test</body></html>' }),
  );
  const popupEvent = page.waitForEvent('popup');
  await page.getByRole('link', { name: /徒歩ルート/ }).click();
  const popup = await popupEvent;
  expect(new URL(popup.url()).searchParams.has('origin')).toBe(false);
  await popup.close();
  await page.getByRole('button', { name: '詳細を見る', exact: true }).click();
  await page.getByText('出典・確認日', { exact: true }).click();
  await expect(page.getByRole('article')).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('map-first.png') });
});
