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
