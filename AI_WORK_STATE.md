# 作業状態 — 2026-10-24

対象：Shota-Zaki/lespot / main。2026-10-24ユーザーがVercel公開を指定。Vercel Hobbyの静的公開を進める。公開の意向は確認済み。有料変更は未承認。

## 完了

React/Vite/TS strict・CSS Modules・トークン、地図/一覧連動、現在地と地域代替、距離順・名称/カテゴリ/料金/距離絞込、Google詳細/徒歩/Street View/Appleリンク。GPSは許可時メモリのみ、外部origin送信なし。

Leaflet遅延読込、地図縮退、JSON境界検証・再試行。非公開Sheets→CSV→検証済みJSON手順、失敗時の正常版保持、CSV書出しによる編集開始を実装。

公式案内と愛知県の再利用可能な座標を照合し実施設2件を登録。施設代表位置と個別席の違いを画面・データ・DATA_EVIDENCEに明記。写真・口コミは取得保存していない。

35件Vitest、型/Lint/整形/build、3幅×3件の本番E2E9件、release:check成功。E2Eで発見した範囲外ピンと読み上げ名を修正。標準ブラウザ配布ZIP失敗を検証専用Chromium153で解決。環境・制約はVERIFICATION参照。

## 残作業

ローカルWebアプリの実装・自動検証は完了。本番公開は未実施。Vercelアプリは未インストール/未接続。インストール提案済みで、接続待ち。vercel.json、.vercelignore、公開手順を追加、Cloudflare用_headersを削除。Hobbyアカウント/個人非商用条件/公開URL/運営窓口は接続後に確認。SheetsはCSV代替運用可能。Actionsは無料条件未確認のためopsテンプレートのみ。

実iOS/Android端末・実GPS・外部アプリ起動・読み上げ・現地確認は未実施。必要なアカウント・端末がない状態を成功にしない。

## GitHub・再開

基点：6a738eaf4ba37cf0a792b0367cca9e12a2ccc88f。main直接Commit方針。今回のSHAは本ファイルを含む履歴で確認し、反映後にGitHubから再取得検証する。

次：NEXT_WORKの公開ゲート確認。/continue Shota-Zaki/lespot で復元する。承認済みの技術選定・CSV代替を再質問しない。

## Vercel接続の実測 — 2026-10-24

- Vercel MCPのアクセス承認が完了し、Hobbyチーム `zaki-7fc3`（`team_K1fjrwwsYAQ5kec8YTaBWngb`）を確認。
- 既存Vercel Project `lespot`（`prj_x8SleXqg0siwHMQwPPkHfiKBaOtT`）はVite / Node.js 24.x、Deployment 0件、live=false。
- VercelのGit連携先は **`suzaking/lespot`**。対象の正本 **`Shota-Zaki/lespot`** / mainとは異なる。Git namespaceに`Shota-Zaki`は表示されず、VercelのGit接続から非公開正本へアクセスできない。
- 対象正本をgitSourceに指定したstagingデプロイ試行はHTTP 400 `incorrect_git_source_info`（GitHub repository can't be found）。成功・公開した扱いにしない。Production URLなし。
- 次の承認ゲート：GitHub `Shota-Zaki`アカウント側でVercel GitHub Appへ **`lespot`のみ** のアクセスを許可する。既存`suzaking/lespot`の誤デプロイを避ける。Hobbyプランではprivate repoのコミット作者とチームオーナーの一致条件にも注意。追加課金禁止。
- Gitの正しい接続後、`docs/VERCEL_DEPLOYMENT.md`に従い検証してプレビュー、本番公開、URL/レスポンスヘッダー確認。作業時点でCLIのユーザーPCインストールと直接`get-started.md`取得は未実施（公式Getting Started docs・Vercel MCP使用）。

## 2026-10-24 公開結果（実測更新）

- GitHubの書き込み権限が復旧し、`suzaking/lespot` の `main` に2件Commit。`7f33c90`（vercel.jsonのJSON整形）と `1cc5f7e`（vercel.jsonのみPrettier整形チェック除外）。各変更後にGitHubから再取得し反映確認。
- Vercel本番 `dpl_9Sr1p4Z7nm76auqECaPtHnaBU5ZQ` がREADY。URL https://lespot-lac.vercel.app/ 、コミット `1cc5f7e`。Vercel buildで型/Lint/Prettier・Vitest35/35・実JSON2件・Vite build成功。
- 実サイト `/` と `/spots.json` がHTTP 200。CSP、Permissions-Policy、Referrer-Policy、X-Content-Type-Options、Cache-ControlをHTTPで確認。Vercel SSOは本番ドメイン以外の個別URL/Previewを保護する設定。
- Blob Store `lespot-content` (東京hnd1) 作成済み、`BLOB_READ_WRITE_TOKEN` は production/preview/developmentに接続。Blob上にデータは保存しておらず、アプリコードにも未統合。Upstash Marketplaceはインストール済みだがRedis環境変数は確認できず、Redis作成・利用は未完了。
- 実iOS/Androidや本番ブラウザ操作E2Eは未実施。Repository AGENTSの `Shota-Zaki/lespot` 記述は現行実体 `suzaking/lespot` と異なる。無断移転しない。

## 2026-10-24 デザインv3公開（最新の実測）

- 稼働Repository: `suzaking/lespot` / `main`。UI全面刷新を実装・Commit。最新のアプリ公開Commitは `7b789fce3075d78e96df2fea742fb6c51ebcd257`。公開デプロイ `dpl_DLeiZiHAtTDyBBF3LB2eLKfCxDW6` はREADY。
- URL: https://lespot-lac.vercel.app/ 。トップHTML、CSS、JavaScript、`spots.json`がHTTP 200。JSONは確認済み2件。CSP、Permissions-Policy、キャッシュ設定を確認。
- ヒーロー、ブランド、検索パネル、フィルターチップ、カード、レスポンシブ地図/一覧切替、地図読み込み前の案内、出典detailsを新設・再設計。新しい画像・外部API・アプリ依存は増やしていない。
- VercelビルドのTypeScript、ESLint、Prettier、Vitest35件、データ検証、Vite本番ビルドが成功。新UIのPlaywright E2E・実iOS/Android・スクリーンリーダーはNOT_RUN。旧版のE2E9件成功は最新版の試験実績ではない。
- Blob/Upstashは前節記載の通り未使用であり、新デザインのリリースは静的配信のみ。本文中の古い未公開・未接続・誤Repository記述は履歴情報であり、この節とNEXT_WORKの最新実測を優先。
