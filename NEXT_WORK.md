# 次のWork Unit

対象：Shota-Zaki/lespot / main。再開：`/continue Shota-Zaki/lespot`。

## I-09：本番ビルドのE2E

AGENTS → AI_WORK_STATE → docs/VERIFICATION → tests/e2e/search.spec.tsを読む。

1. 最新コードを取得し `npm ci && npm run check`。
2. ブラウザ導入可能な環境で `npx playwright install chromium` → `npm run test:e2e`。desktop/mobileの2×2ケース。
3. 失敗した操作だけ修正し結果をVERIFICATIONへ記録。無料残量未確認のActionsを無断実行しない。
4. I-08：DATA_CANDIDATESの休憩区画/入口座標・利用条件・出典利用条件を確認してCSV登録する。

本番公開・新規接続は未承認。Pages Freeの設定/残量、公開URL、運営窓口を確認してから公開する。写真・DB・APIは追加しない。Sheets未接続でもCSV管理は利用できる。
