# LeSpot UI/UX

The current specification is [design.md](../design.md).

2026-10-24: refactored the app as an edge-to-edge map canvas inspired by Google Maps interaction patterns, not its brand, API or map imagery. Removed the former header and permanent list panel. The floating search field stays available; list, detailed filters, selected places and information open only in context. Desktop uses left floating panels and mobile uses bottom sheets.

DB management and its authenticated console are unchanged. Updated visual and interaction QA remains separately tracked in [VERIFICATION.md](VERIFICATION.md).

2026-10-28: switched the basemap to OpenFreeMap + MapLibre GL JS. The rendered style keeps a quiet background and road lines only; place labels, POI symbols, buildings and other feature layers are removed. No account, API key or paid quota is used.
