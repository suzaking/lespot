# LeSpot — next work

Current production source: `suzaking/lespot`, branch `main`.
Live: https://lespot-lac.vercel.app/
Design authority: [design.md](design.md).

## 現行スポット追加 — 2026-11-14

- ユーザーからスポット拡充を最優先する指示あり。名古屋市交通局の一次情報で設置を確認した駅の親子ベンチ（名城公園駅・新瑞橋駅・名古屋駅）3件を`data/bootstrap-spots.json`へ新規登録。既存7件と合わせ**10件**。いずれも**ベンチ実位置ではなく駅の概略座標**で、現況・空席・料金は不明、出典は`docs/DATA_EVIDENCE.md`を参照。
- 公開`https://lespot-lac.vercel.app/api/spots`は2026-11-14時点で既存の鶴舞公園とノリタケの森の**2件**。bootstrapの更新は初期化済みRedisに反映されない。運営者の認証付き管理画面からバックアップを取得した後、差分/重複/期限を確認して追加する（元データ全上書き厳禁）。
- 既存ベンチ5件は`validUntil`が11月9日/10日で期限切れ。期限を延長していないので再点検が必要。
- 街中の個別ベンチ10件追加目標 I-17 は**部分完了（3件）**。次Work Unitはread-only OSMデータソースから再調査し、確度を記録して地図上の実座標を持つベンチを追加。今回Overpass公開APIはタイムアウト/502、Chubu広域extractは取得・処理が短時間で完了せず、新たなOSM地点を検証できなかった。未検証ノードや推測座標は登録しない。
- このWork UnitはGitHub文書と初期データの更新のみ。デプロイ・Redis書込・課金追加なし。GitHub API操作のため全`npm run check`/E2EはNOT_RUN、JSONの静的検査のみ。

## 追加改善タスクの引継ぎ — 2026-11-14

- タスク正本`TASKS.md`にI-14〜I-23の10件（P0=2 / P1=6 / P2=2）を追加。既存I-11実機QA、I-12ベンチ5地点の本番反映は引き続き未完了。I-13の45件Vitest・9件E2E成功は既存のローカル検証記録であり、新改善タスクの実装・テスト完了ではない。
- 調査時点の`data/bootstrap-spots.json`は7件。ベンチ5件の`validUntil`が2026-11-09/10で期限切れ、元の2地点は2026-11-21が期限。現時点の本番Redis件数は改めて公開APIで確認する必要がある。
- **次のWork Unit 1（P0）：I-15**。出典・座標・rights・現況の確認可能な範囲を調査し、確認した事実だけで`docs/DATA_EVIDENCE.md`とデータを更新する。期限を自動延長しない。
- **Work Unit 2（P0）：I-14 → I-12**。公開APIとbootstrapの差分を読み取り専用で可視化し、管理者がバックアップ・revision検証・プレビュー後に本番反映する。認証情報がなくても報告側は進められる。本番Redisの変更は管理者の明示操作が前提。
- **並行検証：I-11**。iOS Safari/Android Chrome、実GPS許可/拒否、道路のみの実タイル・帰属、ピン・タッチ・読み上げを実機で確認。モックE2Eの成功をもって代替しない。
- **次段階：I-16/I-17** ベンチ絞り込みと実地点拡充。**品質・運用：I-18〜I-21** 障害耐性・速度・CI・稼働/コスト点検。**後続：I-22/I-23** 共有URL・文書整合。
- 本タスク登録で変更するのはタスク/引継ぎ文書のみ。アプリコード、Vercelデプロイ、Redis、依存、課金設定は未変更。GitHub APIからの文書更新のみなので`npm run check`・E2EはNOT_RUNと記録する。

## Current handoff — 2026-11-14

The latest main UI browser pass is complete. `npm run check` passed, followed by 9 Playwright tests on desktop, 390px mobile, and 320px narrow viewports. The tests verify map/list flows, search and filters, denied geolocation, retry, axe on sampled states, and horizontal overflow. Map tiles and the spots API were deliberately stubbed/blocked in these tests; they do not verify live tile rendering or production API behavior. Desktop and narrow screenshots were reviewed.

The run fixed stale two-spot expectations, blocked controls caused by overlay hit testing, the search input's combobox semantics, active filter contrast, and the browse button's accessible name. Prettier now uses `endOfLine: auto` so the check works with Windows CRLF checkouts.

Next work is manual device QA: iOS Safari and Android Chrome, allowed/denied real GPS, real OpenFreeMap roads-only rendering and attribution, touch/keyboard/screen-reader behavior. Do not report these as complete until tested. Keep production Redis unchanged; its staged bench records still need the separately documented administrator backup/import step.

## 2026-10-24 Google Maps-style map refinement

- Main screen is a full-viewport, edge-to-edge road-only OpenFreeMap/MapLibre map without any header or persistent results panel.
- Floating search top left, minimal information/geolocation controls top right.
- Search/filters open contextual results; clicking a pin or row opens a place peek with optional detailed sheet.
- Upstash Redis remains the only live data source; management remains `/admin.html`. Vercel Blob connected for future binary storage but unused. No additional paid map APIs.

## Next verification

1. Run `npm run check` and current Playwright E2E. Review desktop/mobile screen captures, keyboard and no-overflow behavior.
2. Test iOS Safari/Android Chrome, denied/accepted GPS, OpenFreeMap tile/network failures and selected marker navigation.
3. Confirm production `/`, `/api/spots`, `/admin.html`, request headers and no secret leakage.
4. Validate admin create/update/delete on production with authorized test record and safe cleanup only after confirming owner access; do not fabricate success.
5. Keep source/evidence freshness (the 2 current seed places need review by 2026-11-21).
6. Do not incur additional service costs or silently enable Google Maps Platform APIs.

## 最新公開確認 2026-10-24

- 実装Commit `0ee4bf916251252c867b70182e0e3221ad11fc43`、Vercel `dpl_ESPq55ySbNAuPVAmco32LfHp6CWX` READY。
- Vitest 40/40、型/Lint/Prettier/Viteビルド成功、本番HTML/JS/CSS/API HTTP200。
- 次の品質ゲート：最新版のPlaywright/実機ビジュアルQA、モバイルのボトムシート操作、オーバーレイと地図の重なり、結果/地点のフォーカス移動、外部地図、アクセシビリティ、画面スクロール。

## 2026-10-24 操作改善の次の検証

- リリースコード: `17b60e6`、Vercel `dpl_4kMs1bMfCLxroXRW5RrVdmrEG2Gn` READY。44件のVitestと本番ビルドは成功。
- Playwright E2Eで、実マウス・タッチのパン/ズーム→このエリアを検索、サジェストのキーボード操作、ボトムシートのスワイプ、ピンとの連動を検証。
- PCの各幅とiPhone Safari/Android Chromeで実際の地図表示・スクロール干渉・シート位置・タップ領域・MapLibre操作を視覚検証。未実施を成功として記録しない。
- 施設の追加は管理画面で実在・出典・休憩条件を確認して行う。Googleデータの無断取得や有料APIの導入は行わない。

## 2026-10-26 街なかベンチの追加

- 白川公園・科学館南側のベンチ1地点を、OpenStreetMap node 6344772944の座標と名古屋市公式案内で根拠付けし、`data/bootstrap-spots.json`へ追加。料金区分はunknown、現況・空席・個別利用条件は未確認としている。
- 証跡と限界は`docs/DATA_EVIDENCE.md`。Street Viewは2016年撮影のため現況保証に使わない。
- 本番の正本はUpstash Redis。bootstrap更新は既存DBを上書きしないため、公開APIは未更新。次は運営者が管理画面へ認証キーを入力し、バックアップ後にこの1件を追加してGET `/api/spots`で反映を確認する。キーはチャットやRepositoryに書かない。

## Current state — 2026-10-27

- `data/bootstrap-spots.json` now has 7 records: the original two parks, Shirakawa Park bench, three mapped points in Shimozono Park, and one mapped point in Nishi-Osu Park.
- This data is staged for an empty Redis database only. The production API uses Upstash Redis as its sole source; bootstrap commits do not update an initialized database.
- Four new points were checked against OSM amenity=bench nodes, park boundaries, and Nagoya City’s public park list. Each has OSM attribution and cost=unknown. Street View was contextual research only, not evidence of an individual bench’s current status.
- Before treating these points as live, back up Redis, add the four records through `/admin.html` using the authorized admin key, then verify `GET /api/spots`. Do not put the key in chat, URL, or repository.

## 2026-10-27 地図種類の変更

- 標準地図を初期表示にし、MapView右下に地理院標準地図／淡色地図の切替ボタンを追加。Leafletインスタンスは再生成しない。
- GSIの公式標準・淡色タイル一覧に沿い、既存の地理院タイル利用を維持。外部地図タイル提供者は追加していない。
- テストを追加したが、GitHub API経由の作業環境にRepository checkout/依存がないため実行はNOT_RUN。Vercel/GitHubのビルド結果は未確認。

## Gemini共同作業と公開反映 — 2026-10-27

- `GEMINI.md`を共同作業の入口にし、`docs/README.md`へ設計・データ・運用・検証文書を役割別に整理。AGENTS.mdとの優先順位とブランチ/PRの流れを明記。
- 地図切替の実装、Prettier整形、公開データ7件に合わせたテスト修正をCommit `1c9a34736dd0ea46121c8393a27a9c574fe9d4c6`まで反映。
- Vercel production `dpl_56pr9uXam7Z6nxBscXgaX32U8TA9` READY。公開URLは https://lespot-lac.vercel.app/ 。
- 次の品質作業は最新版Playwright E2E、実端末での地図タイル・ボタン・レスポンシブ/読み上げ確認。Redisの本番データを編集する場合は管理者のバックアップと安全なキー入力が必要。

## 次の作業 — 2026-10-27

1. 最新UIに対するPlaywright E2Eを実行し、PC/スマホの地図切替、外部リンク、検索操作を確認する。
2. 実iOS/Android、スクリーンリーダー、実GPS、OpenFreeMapタイルの読込と操作を確認する。未実施のまま完了扱いにしない。
3. ベンチデータを本番Redisへ追加するときは、運営者が管理画面で安全に認証し、先にバックアップ、反映後に公開APIを確認する。

## 2026-10-27 道路のみの地図

- OpenFreeMapのベクタータイルから背景と道路線だけを描画。地名ラベル、施設記号、建物等を除去。
- APIキーやアカウント不要の公開タイルを利用。地図表示時にのみ読み込み、失敗時も一覧/外部リンクを維持。
- GitHub main反映とVercel本番配信は完了。実端末で文字/記号がない道路表示、ピン操作、帰属の視認性を確認する。公開タイルにはSLA保証がなく、閲覧時にIPアドレスと地図範囲が提供元へ送信される。

## 現行公開状態 — 2026-10-27

- 道路だけのMapLibre/OpenFreeMap地図を本番公開済み。Commit `8030ee5918f64fa95b1ff433ac43021a7b81110d`、Deployment `dpl_EtxpyYbKXjVSGHb81zrj5FhSbjeq` READY。
- 公開HTMLはHTTP 200、CSPはOpenFreeMap hostを許可し、配信された遅延地図JSに新しい地図提供元・スタイル変換を確認。
- Playwrightは環境にChromiumがなく未検証。ブラウザ導入後、PC/モバイルで実タイル描画、文字/記号が出ないこと、ピン・検索・外部リンク、CSPを再検証する。
