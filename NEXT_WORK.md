# LeSpot — next work

Current production source: `suzaking/lespot`, branch `main`.
Live: https://lespot-lac.vercel.app/
Design authority: [design.md](design.md).

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
