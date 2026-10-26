# LeSpot — next work

Current production source: `suzaking/lespot`, branch `main`.
Live: https://lespot-lac.vercel.app/
Design authority: [design.md](design.md).

## 2026-10-24 Google Maps-style map refinement

- Main screen is a full-viewport, edge-to-edge GSI/Leaflet map without any header or persistent results panel.
- Floating search top left, minimal information/geolocation controls top right.
- Search/filters open contextual results; clicking a pin or row opens a place peek with optional detailed sheet.
- Upstash Redis remains the only live data source; management remains `/admin.html`. Vercel Blob connected for future binary storage but unused. No additional paid map APIs.

## Next verification

1. Run `npm run check` and current Playwright E2E. Review desktop/mobile screen captures, keyboard and no-overflow behavior.
2. Test iOS Safari/Android Chrome, denied/accepted GPS, GSI tile/network failures and selected marker navigation.
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
- PCの各幅とiPhone Safari/Android Chromeで実際の地図表示・スクロール干渉・シート位置・タップ領域・Leaflet操作を視覚検証。未実施を成功として記録しない。
- 施設の追加は管理画面で実在・出典・休憩条件を確認して行う。Googleデータの無断取得や有料APIの導入は行わない。


## 2026-10-26 街なかベンチの追加

- 白川公園・科学館南側のベンチ1地点を、OpenStreetMap node 6344772944の座標と名古屋市公式案内で根拠付けし、`data/bootstrap-spots.json`へ追加。料金区分はunknown、現況・空席・個別利用条件は未確認としている。
- 証跡と限界は`docs/DATA_EVIDENCE.md`。Street Viewは2016年撮影のため現況保証に使わない。
- 本番の正本はUpstash Redis。bootstrap更新は既存DBを上書きしないため、公開APIは未更新。次は運営者が管理画面へ認証キーを入力し、バックアップ後にこの1件を追加してGET `/api/spots`で反映を確認する。キーはチャットやRepositoryに書かない。
