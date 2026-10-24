# 検証記録

最終実施：2026-10-22。Node24.19.0、固定依存。本番公開前のローカル検証。

## 合格

- npm ci：前Work Unitで246パッケージをロックから再導入しbuild成功。今回、新しいアプリ依存は追加していない。
- npm run check：TypeScript strict → ESLint → Prettier → Vitest35件（5ファイル）→ JSON検証2件 → 本番build、全工程成功。
- Vitest：距離/検索/料金/期限/入力境界/URL、React操作・GPS拒否・再試行、CSV取込失敗時の正常JSON保持、ピンclick/Space/選択、実データのCSV往復と数式セル出力拒否。
- E2E_CHROMIUM_PATH指定の npm run release:check：データ公開準備検査 → check → 本番distのE2E9件、全て成功。デプロイは行わない。
- Playwright：PC1280×720、モバイル390×664、狭幅320×740、各3ケース。実データ2件の取得/名称検索/外部URL/ピン選択→カードfocus/出典展開/横はみ出し、合成データの無料フィルター/カード選択/地図縮退、Tabスキップ/GPS拒否/地域変更/0件/500→再試行。
- axe：一覧操作後と実データの地図操作・出典展開後で指摘0件。全ページ・全状態のアクセシビリティ保証ではない。
- 徒歩リンクを実際にクリックし新しいタブのURL・origin省略を確認。Googleへの通信はテスト応答へ置換しており、Google側表示や地図アプリ起動の試験ではない。
- 実データCLI：data:export → data:import（Git管理外の別出力）→ JSON深い一致、成功。Sheets自体の接続・画面操作は未実施。
- 本番build：初回JS322.19KB（gzip99.76KB）、遅延地図JS151.22KB（gzip44.73KB）、CSS5.87KB/15.67KB。明示操作後のみ地図chunkを取得。
- 前Work UnitのクラウドChromeで実地理院タイルと地図/一覧連動を確認。今回の自動E2Eはタイル失敗を意図的に再現。

## 実行環境と修正経緯

標準の playwright install chromium と --only-shell は配布ZIPが不正で失敗。検証専用の @sparticuz/chromium@153.0.0 を別ディレクトリへ導入し、同梱BrotliからChromium153.0.8010.0を展開。アプリ/package-lock/配信物には含めない。Playwright1.64.1標準のChromium156との互換性検証は未実施。

導入済みブラウザを指定できるE2E_CHROMIUM_PATHを追加。独自のセキュリティ無効化引数は追加していない。previewはテスト時127.0.0.1だけへbindし、runnerが起動/終了を管理。

固定zoomで結果ピンが画面外になる不具合を起点＋結果boundsの余白付き表示で修正。ピンの可視番号が読み上げ名に含まれないaxe指摘も修正。料金selectはcomboboxロールでテスト指定。

ヘッドレス環境に日本語フォントがなく初回スクリーンショットは欠字となった。検証環境だけに公式Noto Sans CJK JPを導入して再検証。画面は端末のシステムフォントを使用し、外部フォント通信は増やしていない。

## 未検証・公開ゲート

- 実iOS Safari/Android端末、実GPS、スクリーンリーダー、外部地図アプリの実起動、現地照合。
- ピンは公式オープンデータの施設代表位置。個別席/入口/空席は保証しない。根拠はDATA_EVIDENCE。
- Vercel Hobbyのアカウント設定・ヘッダー適用・配信/復旧、公開URL、運営窓口。2026-10-24にVercel公開の意向は確認済みで、接続待ち。
- Actions無料残量/課金停止、Sheets直接接続。無料設定未確認の外部処理は有効化していない。

## 再現

通常：npm ci → npx playwright install chromium → npm run release:check。

導入済みChromium：E2E_CHROMIUM_PATH=/absolute/path/to/chromium npm run release:check。日本語フォントを備えた環境を使用。npm run check単独はE2Eを含まない。

fixture/一時QA/ブラウザ/フォント/画像は本番JSON・build・Commitに含めない。自動テストは施設情報の真偽を証明しない。

## 2026-10-24：Vercel向け準備

vercel.jsonにVite/install/build/outputとCSP/権限/キャッシュを設定し、Cloudflare用public/_headersを廃止。.vercelignoreでCSV原本・秘密ファイル・テスト成果物等をアップロード対象外にした。新しい依存やバックエンドは追加していない。

release:checkを再実行し、型/Lint/整形/Vitest35件/データ2件/build/E2E9件がすべて成功。Vercel buildCommandの前半データ検査とnpm run checkもこの中で実行済み。実Vercelのbuildとヘッダー適用は接続後の確認事項であり、Vite previewでのE2E成功と同一視しない。

## 2026-10-24 デザインv3の検証

- GitHub最新の新UIコードをVercel productionへデプロイ。対象Commit `7b789fce3075d78e96df2fea742fb6c51ebcd257`、Deployment `dpl_DLeiZiHAtTDyBBF3LB2eLKfCxDW6` READY。
- Vercelビルドログで `tsc --noEmit`、`eslint .`、`prettier --check .`、Vitest35件（5ファイル）、JSON検証2件、Vite buildを確認。生成CSS/JSはVercel配信。
- 実サイト https://lespot-lac.vercel.app/ にてトップHTML、CSS、JavaScript、`spots.json`のHTTP 200を確認し、公開データ2件とセキュリティヘッダーを照合。
- 新版UIのPlaywright E2E、画面キャプチャ比較、iOS Safari/Android実機、実GPS、スクリーンリーダー、地図外部アプリ実起動は未実施。旧2026-10-22版のE2E9件とは分けて扱う。

## 2026-10-24 地図検索UI改修（最新）

- `design.md`を新設し、検索・地図/一覧ワークスペースへ画面を作り直した。React/Leaflet/Zodの既存コア、静的JSON、地図の操作後読み込みを維持。
- 追加したUI単体テストには無料フィルターのトグル挙動を含む。改修版のVercelビルドでTypeScript、ESLint、Prettier、Vitest36件、JSON2件、Vite build成功。
- 最初の本番デプロイ`dpl_7bAeadhEGZJQqacNXokXfQymALuU`はREADY、`https://lespot-lac.vercel.app/`のHTML/CSS/JS/JSONはHTTP 200。最終の微調整（モバイル地図へのスクロール）は後続コミットに反映する。
- 更新した`tests/e2e/published.spec.ts`と`tests/e2e/search.spec.ts`はNOT_RUN。Playwright、画面の目視比較、実iOS/Android、実GPS、地図サービスの実動作・スクリーンリーダー試験は未実施。旧版のE2E成功を今回の証拠として扱わない。
