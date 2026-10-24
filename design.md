# LeSpot UI Design — Google Maps-style map experience

Updated 2026-10-24. This document is the UI source of truth.

## Goal

Prioritize the **interaction model of Google Maps**: a full-bleed interactive map, persistent compact floating search, contextual results, a small place preview and optional expanded details. Do not imitate Google's logo, brand identity, proprietary tiles, imagery, reviews or protected content. LeSpot remains a distinct product.

Feature parity with all of Google Maps (global POI index, turn-by-turn navigation, 3D, live traffic, Street View, reviews and offline maps) is outside the current free project. Use established navigation and layout patterns instead.

## Initial viewport

- Map takes 100% of viewport width and height, edge-to-edge, no header, footer, left dock, or permanent white sidebar.
- The only always-present controls are a compact search field at top left, information + opt-in geolocation at top right, native map zoom controls and GSI attribution.
- An unobtrusive "スポットを見る · N件" action appears near the bottom only when no other panel is open.
- The map is interactive immediately and requests GSI pale map tiles. User location permission is requested **only** on an explicit control click, never automatically.
- White background overlays are not framed in permanent surrounding containers; all surfaces float above the same map. Use subtle depth only for legibility.

## Search experience

- The main search input is visible at all times. Focusing it or typing a query opens a contextual results panel.
- "検索条件を開く" toggles the filter drawer beneath the search capsule, and closes without navigation.
- Filters are real functional settings: area, user location, category, cost and straight-line distance. Changing a filter updates map pins and opens relevant results.
- Close the results panel without clearing filters. A separate reset action clears filters.
- Desktop results: temporary scrollable panel below search on the left, width <=412px, map remains visible around it.
- Mobile results: temporary bottom sheet with rounded top corners, safe-area padding, independent scrolling and a handle. The map stays visible behind it. No full-screen white page.

## Place experience

- Clicking any map marker opens a peek-size place sheet; it does not navigate to another page or hide the map.
- Peek shows name, category, straight-line distance, a safe walking-directions external link, and "詳細を見る" to reveal evidence/conditions. Closing returns to unobstructed map.
- Place details expand within the same floating sheet. A deliberate "一覧で詳細を見る" returns to the matching result and focuses its title.
- The source, verification date, usage conditions and externally opened map links remain available. Do not invent photos, star ratings, live availability, opening status or walking times.
- Desktop place detail appears at the lower left. Mobile place sheet rests at the bottom above the map, respecting safe-area insets.

## Design tokens and motion

- Functional teal #08796f; white overlay surfaces; dark #20282b text; subdued #667278 metadata; warm-neutral GSI map base.
- System Japanese typography, 14-16px UI and 16-18px titles. Controls >=44px touch targets.
- Floating search: corner radius ~13px, 54px height. Sheets: 12px desktop, 18px upper mobile corners. Tiny soft shadows only for map readability.
- No marketing hero, no badges for decorative emphasis, no fake cartographic background, no bento layout, no large ornamental text, no fixed white frame.
- Support keyboard focus, aria labels, reduced motion, 320px mobile width, 390px phones, 800-1024px tablets and 1280px desktops.

## Technology and privacy

- Keep existing React + Vite, Leaflet, GSI tiles and Upstash Redis backend through validated server-only Vercel Functions. No Google Maps JS API bills or photo API are introduced.
- DB is the only live facility source via GET /api/spots. Admin writes use authenticated server endpoints; public browsing never receives DB credentials.
- GPS coordinates are volatile state only. Do not transmit them to Redis, analytics or external directions URL as the start location.
- In the information panel, explain GSI requests, data accuracy limits, privacy and administrative access.

## Verification

- Run TypeScript, ESLint, Prettier, Vitest, Vite build and published API smoke test.
- Run Playwright at desktop and mobile sizes before claiming screenshot/interaction validation. Test initial map-only state; search/filter panel toggles; marker -> peek -> expanded details; closing and returning to results; denied GPS; keyboard; missing map tiles; no horizontal overflow; and axe.
- Do not confuse mock-based tests with full production browser verification. Real iOS Safari and Android Chrome remain separate QA tasks.
