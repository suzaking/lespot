# LeSpot 次のWork Unit — 2026-10-24

## 現在の稼働状況

- GitHub: `suzaking/lespot` / `main`（現在のVercel接続実体）。過去資料の `Shota-Zaki/lespot` は現行接続先と異なる。利用者の明示指示なしにRepository移転はしない。
- Production: https://lespot-lac.vercel.app/
- デザイン全面改修の公開Commit: `7b789fce3075d78e96df2fea742fb6c51ebcd257`
- Vercel deployment: `dpl_DLeiZiHAtTDyBBF3LB2eLKfCxDW6` / READY
- 静的な施設データ2件、React/Vite/Leaflet、写真なし。Vercelの型/Lint/整形・Vitest35件・JSON検証・ビルドが成功。実URLでHTML/CSS/JS/JSONのHTTP 200を確認。
- 新デザインのPlaywright E2Eおよび実機iOS/Androidの操作・GPS・地図・スクリーンリーダーはNOT_RUN。旧デザインで実施したE2E9件と区別する。

## 次に進める作業

1. Chromium等を備えた環境で新デザインの `npm run release:check` を実行。PC/390px/320pxで検索、チップ、表示切替、地図ピン、外部地図、フォーカス、横スクロール、axeを検証し、問題を修正。
2. 実iOS SafariとAndroid Chromeで現在地、地図タイル、外部アプリ起動、タッチ操作、320px〜768pxでのレイアウトを確認。
3. 実データを増やす場合は出典・権利・施設の休憩利用条件・位置・確認期限が確認できる施設だけを追加。架空施設や無断写真は公開しない。
4. 2026-11-21までに現在掲載中2件の公式情報を再確認し、公開JSONの期限を適切に更新。
5. Vercel Blobは作成・`BLOB_READ_WRITE_TOKEN`接続済みだが現行静的アプリ未使用。UpstashはMarketplace導入済みでRedis DB実体未接続。無料枠と明確な必要性を評価してからストレージ連携し、現行検索UXや個人情報方針を損なわない。
6. 公開運用のエラー監視、連絡先・更新手順、復旧/ロールバック手順を整える。

## 守ること

Hobbyの個人・非商用条件、追加課金なし、ユーザーGPSの非永続化、公式ソース/権利検証、GitHubからの読み戻し、型/Lint/Prettier/単体・ブラウザテスト。新サービスや有料プランへ無断変更しない。

再開はこのファイルと`AGENTS.md`、`AI_WORK_STATE.md`、`docs/UI_UX.md`を参照。
