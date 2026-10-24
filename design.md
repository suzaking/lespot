# LeSpot design.md — Map-first application design

Status: adopted for implementation on 2026-10-24. This is the **source of truth for the UI**, ahead of older `docs/UI_UX.md` descriptions. Changes must update this file alongside code.

## Product and tasks

LeSpot is a small, free web app to find verified rest spots around Nagoya. The main task is **find a place to pause**, not browse a marketing landing page.

1. Choose a location (Sakae / Hisaya-Odori / Yabacho or opt-in GPS).
2. Search by name/address and filter by category, cost and straight-line radius.
3. Scan the compact result list, compare verified conditions and distance.
4. Check the map and select a marker. On mobile the marker reveals a small location preview, then offers a deliberate transition to details.
5. Open walking directions, map services and source evidence.

No star ratings, photographs, fabricated opening status, popularity, walking times, or empty-seat claims.

## External patterns and boundaries

Reference **patterns, not brand assets**:

- [Mapbox Store Locator](https://www.mapbox.com/blog/best-practices-for-custom-store-locators): persistently visible search/list and map on desktop; quick list↔marker selection; filter proximity; responsive layouts.
- [Google Maps Places UI documentation](https://developers.google.com/codelabs/maps-platform/maps-platform-ui-kit-js?hl=ja): selecting a result and selecting a marker should address the same place; detail disclosure does not destroy map context.
- [Google Maps mobile sheet redesign](https://9to5google.com/2025/03/07/google-maps-iphone-sheet-redesign/): small map-overlaid location preview before opening complete details, avoiding unnecessary full-screen transitions.

Do not duplicate proprietary icons, content, colors or exact screens. Do not copy Google/Mapbox tile assets.

## Information architecture

```text
Desktop ≥ 800px
┌─────────────────────────────────────────────────────────────┐
│ LeSpot   名古屋の休憩スポット                     掲載情報   │  60px toolbar
├───────────────────────┬─────────────────────────────────────┤
│ Search / area / GPS   │                                     │
│ Filters (compact)     │              REAL MAP               │
│ 2 places · near first │   (map is visible on first load)  │
│ ───────────────────── │                                     │
│ Result row            │                                     │
│ Result row            │                                     │
│ independent scroll    │                                     │
└───────────────────────┴─────────────────────────────────────┘

Mobile < 800px · map canvas with top controls and bottom sheet
┌─────────────────────────┐
│ LeSpot             情報 │
│ search / area / filters │
│ 2件  [一覧] [地図]       │
│ List rows or map         │
│ If a marker is tapped:   │
│ ┌ place / distance ───┐  │
│ │ 詳細を見る          │  │
│ └─────────────────────┘  │
└─────────────────────────┘
```

## Visual system

UI is **content-first, compact, neutral**:

- Page and map background: `#f3f5f5`; panels white.
- Text `#20282b`; secondary `#667278`; lines `#e2e7e8`.
- A single functional teal `#08796f` for selection, focus cues and primary actions. Do not apply unrelated gradient palettes.
- 13–16px standard control/body text; place names 16–18px; application title 18px. System Japanese fonts only.
- Spacing grid 4 / 8 / 12 / 16 / 24px; flat list separators, 8–12px radii. Avoid hero art, taglines, English eyebrow headings, large number ornaments, bento cards, irrelevant badges and decorative shadows.
- All iconography has an accessible text label; favor native controls and plain words over arbitrary Unicode icons.

## Interaction contract

- **Desktop**: persistent 380–440px search/results sidebar, remaining width real map. Independent sidebar scroll; map not pushed beneath results.
- **Mobile**: one set of semantic filters, a visible list/map switch; no side-scrolling. Selected marker does not abruptly switch away from map. Its compact preview offers `一覧で詳細を見る`. The preview does not claim an actual photo or precise entrance.
- Map tiles from GSI are requested as the map becomes visible on initial load. Explain the third-party request in the privacy information. GPS coordinates remain opt-in and never saved.
- GPS requested only by explicit button. No geolocation is stored, logged or forwarded as an external route origin.
- Selected list row and map marker refer to the same spot ID. When deliberately moving from map preview to details, scroll/focus the matching list item. Marker numbering matches the list.
- Filter chips represent actual filters and reflect pressed states. An accessible reset button clears them.
- Network, empty state, invalid-data and denied-location states remain separate. Unknown/expired conditions are never presented as confirmed.
- Direct route links use only confirmed coordinates from validated dataset, open a separate tab with `noopener noreferrer`. Don't send the user's current position as departure.
- Source dates, limits of representative coordinates and attribution remain accessible without crowding primary results.

## Accessibility / QA

- Keyboard and visible focus for all primary interactions; proper labels for inputs; 44px touch targets.
- Skip link to search results, status updates with `aria-live`, explicit error alerts.
- Desktop ≥ 1280, intermediate 800–1024, mobile 390 and 320px; support reduced motion.
- Unit tests for filters and list↔map selections; Playwright on 1280, 390, 320 with tile failures, denied GPS, focus, axe and no horizontal overflow.
- `npm run check` is mandatory; `npm run release:check` and real-device results recorded separately, without conflating successful build with visual QA.

## Architecture and cost

Keep React / Vite / TypeScript strict, Leaflet + GSI tiles, Zod, CSS Modules, static verified JSON and existing CSV flow. No new JS UI libraries, analytics, user accounts, required DB, paid API, storage reads, or photo hosting for this redesign. Existing Blob and Upstash connections are not a justification to introduce costs into a static search view.

## 2026-10-24 map and DB update

The **map must be visible when the app opens**; do not show a large opt-in map placeholder. Map tiles are obtained from GSI during normal map use, and this third-party access is disclosed in the information screen. GPS remains opt-in. Desktop keeps a compact left search/results sidebar; mobile shows the map as a full background canvas with floating search controls at the top and a compact, expandable list sheet at the bottom. The place sheet and marker selection should preserve visible map context.

**DB is the authoritative source**: Upstash Redis over a Vercel server-only Function; never ship a Redis token in the browser. `GET /api/spots` serves validated public data, and authenticated `GET/PUT /api/admin/spots` supports editing. Optimistic revision checks protect edits. A nonpublic bootstrapping snapshot seeds only an absent key with `SET NX` and never overwrites modified records. Vercel Blob is for future binary files only, not for small structured text records.

- **DB-managed markers**: show markers returned from `GET /api/spots`, not from a built-in public JSON bundle. The operator edits validated place records at `/admin.html` without a spreadsheet.
