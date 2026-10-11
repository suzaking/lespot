# LeSpot C4モデル — 写真なし・無料優先アーキテクチャ v1.2

2026-10-11、ユーザー指示による改訂。**MVP0の正本は[FREE_MVP_STRATEGY.md](FREE_MVP_STRATEGY.md)**。以前のD1・Worker API・R2画像ゲート構成は初期公開の推奨から除外。C4でいうContainerはDockerと同義ではない。

## C1 Context

```mermaid
flowchart LR
  U[利用者] -->|休憩場所を探す| L[LeSpot]
  O[運営者] -->|Gitで確認済み位置を管理| L
  L -->|施設を検索・ピン・徒歩経路・周辺Street View| G[Google Maps 外部]
  L -->|代替の位置・徒歩経路| A[Apple Maps 外部]
  L -->|配信| C[Cloudflare Pages Free]
  O -->|独立の情報源| D[自治体・施設公式・現地・ライセンス確認済みOSM]
```

LeSpotはGoogleのレビューや画像を保存・転載しない。Google側の施設検索結果が正しい対象となる保証はしない。

## C2 Containers

```mermaid
flowchart TD
  subgraph Browser[利用者ブラウザ]
    APP[React SPA / Vite+TypeScript]
    GEO[Geolocation: 明示操作]
    APP --> GEO
  end
  subgraph Pages[Cloudflare Pages Freeの静的資産]
    UI[dist: HTML/JS/CSS]
    DATA[spots.json: 確認済み名称・位置・出典]
  end
  subgraph Operator[運営側]
    GIT[private Git: 編集正本]
    VALID[ビルド時のschema/根拠検証]
    GIT --> VALID --> Pages
  end
  UI --> APP
  DATA --> APP
  APP --> Google[Google Maps URLs]
  APP --> Apple[Apple Map Links]
```

**この段階には存在しないコンテナ：** 公開read API、D1、R2、画像加工、ログイン、投稿基盤。静的サイトと公開データは同じ配信系。データ修正はGit変更→再ビルド→再配信が必要。

## C3 Components (Web SPAのみ)

```mermaid
flowchart LR
  UI[ListView / FilterBar] --> CT[Search Controller]
  CT --> GEO[Location Adapter]
  CT --> REPO[Static Spot Repository]
  CT --> CORE[Search Core: 距離・条件]
  UI --> MAP[External Map Link Builder]
  MAP --> GOOGLE[Google / Apple]
```

UIから外部アプリへ移動する前に位置/住所の妥当性を検証。GPSはアプリメモリに保持し、LeSpotや外部地図へ出発地点として送らない。ドメイン計算はReactから独立した純粋TypeScriptで実装する。

## C4 Code Contracts

```mermaid
classDiagram
  class SpotLite {
    +string id
    +string name
    +string category
    +number lat
    +number lon
    +string access_cost
    +string verified_at
    +Source source
  }
  class SearchCore {
    +distanceMeters(origin, spot)
    +searchSpots(origin, spots, filters)
  }
  class ExternalMaps {
    +googlePlaceSearch(spot)
    +googlePin(spot)
    +googleWalking(spot)
    +googlePano(spot)
    +appleMap(spot)
    +appleWalking(spot)
  }
  class Validation {
    +validateSpot(input)
    +validateCoordinates(lat, lon)
  }
  SearchCore --> SpotLite
  ExternalMaps --> SpotLite
  Validation --> SpotLite
```

テスト：正確な座標/緯度経度、距離の境界、同距離ID順、無料と不明、Googleの同名誤解決、Street Viewの最寄りパノラマ、URLエンコード、位置情報拒否。

## 拡張判断

| 順序 | 追加条件 | 技術 |
| --- | --- | --- |
| MVP0 | 一覧・位置・外部地図で検証できる | React/Vite + Pages Free + 静的JSON + Google/Apple URL |
| UX改善 | 一覧だけでは周辺を認識しにくい | Leaflet＋地理院タイル。施設の情報は独立データ |
| 情報拡張 | 電源等の厳密条件検索の需要と根拠が確保された | 施設フィールドの追加と確認期限管理 |
| 運用拡張 | 更新頻度・地域数が静的配信の限界に達した | D1 Free / Worker APIを費用再評価後に導入 |

写真の運用はどのフェーズでも既定復活しない。Cloudflareの無料枠、Google Maps URLsのAPIキー不要性、自治体・OSMの権利は[FREE_MVP_STRATEGY.md](FREE_MVP_STRATEGY.md)にまとめる。

**状態：設計のみ。** ブラウザ実装・実施設の確認・配信/監視は未実施。
