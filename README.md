# LeSpot

名古屋周辺の休憩スポットを、現在地または栄・久屋大通・矢場町から探す静的Webアプリ。

## 現在の状態

2026-10-22：検索・現在地・地図と一覧・外部地図リンク・CSV管理を実装。鶴舞公園とノリタケの森の2件を登録。35件のVitestとPC/390px/320pxの9件の本番ビルドE2Eが成功。本番未公開。出典・再利用条件は [確認根拠](docs/DATA_EVIDENCE.md)、実行環境と未検証事項は [検証記録](docs/VERIFICATION.md) を参照。ピンは施設代表位置であり、入口・個別席や空席を保証しません。

## 開発

Node.js 24（検証環境24.19.0）、npmを使用。依存はpackage-lock.jsonで固定。

```bash
npm ci
npm run dev
```

http://localhost:4173 を開く。位置情報はlocalhostまたはHTTPSが必要。

```bash
npm run check
npx playwright install chromium
npm run test:e2e
```

E2E前に `npm run build` が必要（checkにも含む）。E2Eは既定で本番ビルドのpreviewを起動する。既存検証サーバーを使う場合のみ `E2E_BASE_URL=http://127.0.0.1:4173 npm run test:e2e`。npm run checkはE2Eを含まない。

導入済みのChromiumを使う場合は `E2E_CHROMIUM_PATH=/absolute/path/to/chromium npm run release:check`。標準はPlaywright同梱ブラウザ。モバイル検証はChromiumの画面・タッチエミュレーションであり、実iOS Safariとは区別します。

## データ更新

1. 初回の編集シート作成時は `mkdir -p imports` → `npm run data:export -- imports/current.csv` で掲載内容を書き出し、非公開Google Sheetsへ取り込む。既存の編集シートがある場合はそのシートを編集する。空から作る場合は `data/template.csv` を使う。
2. Sheetsの「ファイル → ダウンロード → カンマ区切り形式」で対象タブをCSV保存。
3. Git管理外の `imports/spots.csv` に置く。
4. `npm run data:import -- imports/spots.csv` → `npm run check`。
5. `public/spots.json` の差分を確認・Commit。本番公開前は `npm run release:check`。

シートの一般公開やAPIキーは不要。取込失敗時は既存JSONを書き換えない。全件取り下げ時のみ `--allow-empty` を指定し、内容を確認して通常ビルド・配信する（release:checkは初回公開用の0件禁止ゲート）。詳しくは[データ運用](docs/DATA_OPERATIONS.md)。

## 構成とドキュメント

- React + Vite + TypeScript strict / CSS Modules・共通トークン
- Leaflet + 地理院淡色タイル（操作後の遅延読込）
- Zodによる静的JSON検証、csv-parseによるCSV入力
- 独自バックエンド、DB、写真保存、分析SDKなし
- 配信先はVercel Hobbyの静的配信（個人・非商用が条件）。接続・デプロイ待ち。[公開手順](docs/VERCEL_DEPLOYMENT.md)

[要件](docs/REQUIREMENTS.md) / [C4](docs/ARCHITECTURE.md) / [データ](docs/DATA_MODEL.md) / [UI](docs/UI_UX.md) / [詳細](docs/DETAILED_DESIGN.md) / [運用](docs/OPERATIONS.md) / [比較・費用](docs/RESEARCH_AND_COSTS.md) / [テスト](docs/TEST_PLAN.md) / [決定記録](docs/DECISIONS.md)

旧写真/R2/D1/Worker/API設計はGit履歴に保存。現行文書は2026-10-21の実装指示に合わせて置換済み。

再開：`/continue Shota-Zaki/lespot`。AGENTS → AI_WORK_STATE → NEXT_WORKを読む。
