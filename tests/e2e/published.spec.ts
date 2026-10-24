import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('verified bootstrap spots render through the DB API contract', async ({
  page,
  context,
  isMobile,
}) => {
  await page.route('https://cyberjapandata.gsi.go.jp/**', (route) =>
    route.abort(),
  );
  const bootstrap = JSON.parse(
    readFileSync('data/bootstrap-spots.json', 'utf8'),
  );
  await page.route('**/api/spots', (route) =>
    route.fulfill({ json: bootstrap }),
  );
  await page.goto('/');
  await expect(page.getByRole('article')).toHaveCount(2);
  await page.getByLabel('スポット名・場所').fill('ノリタケ');
  await expect(page.getByRole('article')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /徒歩ルート/ })).toHaveAttribute(
    'href',
    /destination=35\.17989%2C136\.881573&travelmode=walking/,
  );
  await page
    .getByRole('button', {
      name: isMobile ? '地図' : '地図を読み込む',
      exact: true,
    })
    .click();
  await page
    .getByRole('button', { name: '1 ノリタケの森を選択', exact: true })
    .click();
  if (isMobile) {
    await expect(
      page.getByRole('button', { name: '一覧で詳細を見る' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '一覧で詳細を見る' }).click();
  }
  await expect(
    page.getByRole('button', { name: 'ノリタケの森', exact: true }),
  ).toBeFocused();
  await expect(page.getByRole('article')).toBeVisible();
  // Exercise new-tab navigation without contacting or scraping Google.
  await context.route('https://www.google.com/maps/dir/**', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="ja"><title>外部リンク検証</title><body>外部リンク検証</body></html>',
    }),
  );
  const popupOpened = page.waitForEvent('popup');
  await page.getByRole('link', { name: /徒歩ルート/ }).click();
  const popup = await popupOpened;
  await expect(popup).toHaveURL(/google\.com\/maps\/dir\/\?api=1&destination=/);
  expect(new URL(popup.url()).searchParams.has('origin')).toBe(false);
  await popup.close();
  await page.getByText('出典・確認日', { exact: true }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: test.info().outputPath('published.png'),
    fullPage: true,
  });
});
