import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spots } from '../fixtures';

const data = {
  schemaVersion: 1,
  spots: spots.map((spot, i) => ({
    ...spot,
    id: `e2e-${i}`,
    name: `検証専用スポット${i + 1}`,
    fixture: false,
  })),
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/spots', (r) => r.fulfill({ json: data }));
  await page.route('https://tiles.openfreemap.org/**', (r) => r.abort());
});

test('filters, spot selection, map and accessibility', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '検索条件を開く' }).click();
  await page
    .getByRole('combobox', { name: '料金', exact: true })
    .selectOption('free');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page.getByRole('button', { name: '地図で見る' }).click();
  await expect(
    page.getByRole('heading', { name: '検証専用スポット1' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '一覧で詳細を見る' }).click();
  await expect(
    page.getByRole('button', { name: '検証専用スポット1', exact: true }),
  ).toBeFocused();
  await page.getByRole('button', { name: '結果一覧を閉じる' }).click();
  await expect(page.getByRole('article')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('keyboard, location denial, empty and retry', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: (_s: unknown, e: (v: { code: number }) => void) =>
          e({ code: 1 }),
      },
    });
  });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: '地図へスキップ' }),
  ).toBeFocused();
  await page.getByRole('button', { name: '現在地から探す' }).click();
  await expect(page.getByText(/位置情報が許可されていません/)).toBeVisible();
  await page.getByRole('button', { name: '検索条件を開く' }).click();
  await page.getByLabel('検索する地域').selectOption('yaba');
  await page.getByLabel('スポット名・場所').fill('存在しない');
  await expect(
    page.getByText('条件に合うスポットが見つかりません'),
  ).toBeVisible();
  await page.route('**/api/spots', (r) => r.fulfill({ status: 500 }));
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.route('**/api/spots', (r) =>
    r.fulfill({ json: { schemaVersion: 1, spots: [] } }),
  );
  await page.getByRole('button', { name: '再試行' }).click();
  await expect(page.getByText('掲載スポットを確認中です')).toBeVisible();
});
