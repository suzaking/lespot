# 検証記録

最終実施：2026-10-22。Node24.19.0、固定依存。本番公開前のローカル検証。

## 2026-11-14 最新mainのブラウザ検証

- 基点：GitHub `main`の`1a7b055b000fcf35c05ddf1eb488914df5e3b53e`。Node.js 24.18.1、`npm ci`でlockfileから264 packagesを導入。npmは9件のmoderate advisoryを報告したが、このWork Unitでは依存を変更していない。
- `npm run check`成功：TypeScript、ESLint、Prettier、Vitest45/45、bootstrap JSON検証7件、Vite production build。MapView遅延チャンク1,072.93 kB（gzip 292.10 kB）とworker 518.98 kBの既存500 kB警告あり。
- `E2E_CHROMIUM_PATH`に端末のGoogle Chromeを指定し`npm run test:e2e`を実行。Playwright 9/9成功：desktop、390px mobile、320px narrow。検索/絞込、一覧/地点詳細、徒歩リンク、GPS拒否、API失敗と再試行を確認。テスト対象状態でaxe violations 0、水平overflowなし。desktopとnarrowのスクリーンショットを確認。
- E2EはVite previewを使い、`/api/spots`はfixtureに置換、OpenFreeMap tile requestは遮断。実タイルの描画、production API、iOS/Android実機、実GPS、スクリーンリーダーは検証していない。
- 検出して修正：live 7件に対する古い2件固定アサーション、overlayによる操作ブロック、検索入力のcombobox role、選択filterのコントラスト4.42:1、visible labelとaria-label不一致。PrettierのCRLF環境差は`endOfLine: auto`で解消。
- production deployment・Redisの内容変更は行っていない。

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

## 2026-10-24 Redis DB移行と地図初期表示

- 本番デプロイ `dpl_D9u6fBqCS9wBAN7iyTFu4Y45k9L3` はREADY。
- Vercelの型・Lint・整形・Vitest39件、初期移行スナップショット2件、Viteビルドが成功。
- 本番 `https://lespot-lac.vercel.app/api/spots` はHTTP 200で2件を返した。DB初期化のSET NX後も検証済み。
- `/admin.html`はHTTP 200、`/spots.json`は404（廃止）。管理APIのBearer認証・revision更新はVitestで検証。実運営者の本番ログイン・編集保存は未実施。
- 初回サーバーimportの不整合でHTTP 500を確認し、Node ESM参照を修正。現在の本番で公開API HTTP 200を確認した。
- 新レイアウトのPC/スマホPlaywright、iPhone/Android実機、現地GPS・タイル・外部地図・読み上げの確認は未実施。

## 2026-10-24 全画面地図UIへの刷新

- 実装Commit `0ee4bf916251252c867b70182e0e3221ad11fc43`、Vercel production deployment `dpl_ESPq55ySbNAuPVAmco32LfHp6CWX` READY。
- 型・Lint・Prettier・Vitest全40件（6ファイル）・Vite本番ビルド成功。エラー再試行時に結果パネルが閉じる問題を修正し再実行済み。
- 実本番 `/`、`/api/spots`、`/admin.html`、アプリJS/CSSをHTTP 200で取得。`/api/spots`は鶴舞公園・ノリタケの森の2件。静的旧`/spots.json`は廃止。
- 新版のPlaywright E2E、画面キャプチャによる比較、iPhone/Android実機、地図タイル実描画・実GPS・スクリーンリーダー確認はNOT_RUN。ユニットテスト成功と区別する。

## 2026-10-24 地図操作改善（Map gestures / DB suggestions）

- フル画面地図を維持したまま、パン・ホイールズーム・ズームボタン操作後に「このエリアを検索」を表示。クリック後は画面表示範囲内に存在するRedis管理スポットを検索。絞り込みだけで地図カメラがリセットされないよう調整。
- 検索欄でDB内スポット名・住所を最大5件候補表示。キーボードのArrowDown/Enter/Escapeと候補選択→地図移動/詳細表示に対応。外部ジオコーディングやGoogle Places APIは使用していない。
- モバイルの検索結果シートはpeek/half/fullの3状態を持ち、ドラッグハンドル操作に対応。選択スポットの詳細はスワイプ上で展開、下で縮小/閉じる。ハンドルはキーボード操作可能。
- ソースCommit `17b60e617b89dee8d6e57b68ec444b6d5f493bed` / Vercel Production `dpl_4kMs1bMfCLxroXRW5RrVdmrEG2Gn` READY。型/Lint/Prettier、Vitest44件（8ファイル）、Viteビルド成功。HTML、`GET /api/spots`、管理画面HTTP 200、公開DBの実スポット2件取得を確認。
- 現行UIのPlaywright E2E、実ブラウザ画面比較、iOS/Android実機、地図範囲検索の実ジェスチャーQAはNOT_RUN。単体テスト成功と混同しない。認証なし管理APIは認証拒否の対象（HTTP 401）。

## 2026-10-27 地図種類切替の実装

- MapViewの初期タイルをGSI標準地図に変更し、GSI淡色地図と切り替えるボタンを追加。両方ともGSI公式の標準/淡色タイルURLと出典リンクを使用。
- `tests/map.test.tsx`に標準/淡色切替の操作テストを追加。初回はPrettier不通過と旧2件期待値のテスト失敗を検出し、公開データ7件と検索距離順を反映するよう修正した。

## 2026-10-27 GSI地図種類切替ビルド

- 本番デプロイ `dpl_E1kXWngKCmduvUgbNH89DuxAVpGt` はCommit `26faaad` から開始したが、`prettier --check .` が対象9ファイルを報告してbuildがERROR。アプリは公開されていない。
- Prettier 3.9.10で対象9ファイルをローカル整形し、再確認では9ファイルすべて通過。変更をCommit後、Vercelの本番buildと公開URLを再検証する。
- Repositoryチェックアウトがないためこの作業環境ではnpmを直接実行できない。Vercel buildの`npm run check`結果をリリース検証に使用。

## 2026-10-27 最終確認：地図種類切替とGemini共同作業

- Commit `1c9a34736dd0ea46121c8393a27a9c574fe9d4c6`をVercel production Deployment `dpl_56pr9uXam7Z6nxBscXgaX32U8TA9`として配信。状態READY、`https://lespot-lac.vercel.app/`を本番Aliasとして確認。
- Vercelの`npm run check`が成功：TypeScript、ESLint、Prettier、Vitest45件、データ検証（bootstrap 7件）、Vite production build。
- 公開HTMLと遅延地図JavaScriptをHTTP取得し、GSI標準`/xyz/std`・淡色`/xyz/pale`タイルURLを確認。地図種類切替テストを含む単体テストはCIで成功。
- Gemini向け`GEMINI.md`、文書索引`docs/README.md`、共通ルール`AGENTS.md`をGitHub mainへ反映。
- Playwright E2Eと実端末での視覚/操作、実GPS、スクリーンリーダー、現地照合は今回未実施。実地理院タイルへの実ブラウザ通信も確認範囲外。
- このデプロイ作業ではUpstash RedisおよびVercel Blobのデータを変更していない。

## 2026-10-27 道路のみの地図プロバイダー変更

- MapLibre GL JS 6.16.0とOpenFreeMapの公開ベクタータイルへ変更。ベーススタイルを変換し、背景と道路線だけを残して地名ラベル・POI記号・建物等を除去。LeSpotのスポットピンは維持。
- Leafletおよび型定義を依存から削除し、地図コンポーネントは遅延ロード。Vercel CSPをOpenFreeMapホストに限定して更新し、地図タイル遮断E2Eのホスト参照も更新。
- `npm run check`成功：TypeScript、ESLint、Prettier、Vitest 45/45、データ検証7件、Vite production build。
- `npm run test:e2e`は9件すべてがPlaywright Chromium未インストールで起動できず。E2E成功とは扱わない。ブラウザ配布物のインストール後に再実行する。
- Vite buildは遅延ロードMapView JS 1,072.92 kB（gzip 292.10 kB）、MapLibre worker 518.98 kBを出力し、500 kB超過警告あり。地図を開くまでロードしないが、初回地図表示時の転送量は増えている。実ブラウザでのタイル描画・CSP・モバイル実機は未確認。

- GitHub `main` Commit `8030ee5918f64fa95b1ff433ac43021a7b81110d`、Vercel production Deployment `dpl_EtxpyYbKXjVSGHb81zrj5FhSbjeq` READY。公開Alias `https://lespot-lac.vercel.app/`をHTTP 200で確認し、CSPと遅延地図JSにOpenFreeMap URL・道路レイヤー処理が含まれ、GSI/Leafletの参照がないことを確認。

