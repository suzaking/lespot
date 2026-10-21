import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spots } from '../fixtures';
// E2E data validation is bypassed only by converting flags/names in the intercepted test response.
// No fixture is stored in public/ or bundled by Vite.
const data = {
  schemaVersion: 1,
  spots: spots.map((s, i) => ({
    ...s,
    id: `e2e-${i}`,
    name: `検証専用スポット${i + 1}`,
    fixture: false,
  })),
};
test.beforeEach(async ({ page }) => {
  await page.route('**/spots.json', (r) => r.fulfill({ json: data }));
  await page.route('https://cyberjapandata.gsi.go.jp/**', (r) => r.abort());
});
test('search, card selection, links, map fallback and accessibility', async ({
  page,
  isMobile,
}) => {
  await page.goto('/');
  await expect(page.getByRole('article')).toHaveCount(3);
  await page.getByLabel('料金', { exact: true }).selectOption('free');
  await expect(page.getByRole('article')).toHaveCount(1);
  await page
    .getByRole('button', { name: '検証専用スポット1', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: '検証専用スポット1', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: /徒歩ルート/ })).toHaveAttribute(
    'href',
    /travelmode=walking/,
  );
  const before = await new AxeBuilder({ page }).analyze();
  expect(before.violations).toEqual([]);
  await page
    .getByRole('button', {
      name: isMobile ? '地図' : '地図を読み込む',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('button', { name: '検証専用スポット1を選択' }),
  ).toBeVisible();
  await page.getByRole('button', { name: '検証専用スポット1を選択' }).click();
  await expect(page.getByRole('article')).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test('keyboard, denied location, empty and retry', async ({ page }) => {
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
    page.getByRole('link', { name: '検索結果へスキップ' }),
  ).toBeFocused();
  await page.getByRole('button', { name: /現在地から探す/ }).click();
  await expect(page.getByText(/位置情報が許可されていません/)).toBeVisible();
  await page.getByLabel('検索する地域').selectOption('yaba');
  await page.getByLabel('スポット名・場所').fill('存在しない');
  await expect(
    page.getByText('条件に合うスポットが見つかりません'),
  ).toBeVisible();
  await page.route('**/spots.json', (r) => r.fulfill({ status: 500 }));
  await page.reload();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.route('**/spots.json', (r) =>
    r.fulfill({ json: { schemaVersion: 1, spots: [] } }),
  );
  await page.getByRole('button', { name: '再試行' }).click();
  await expect(page.getByText('掲載スポットを確認中です')).toBeVisible();
});
