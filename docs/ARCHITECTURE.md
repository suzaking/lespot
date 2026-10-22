# C4アーキテクチャ v2

## C1: Context

```mermaid
flowchart TD
 U[利用者] --> L[LeSpot]
 O[運営者] --> S[非公開Google Sheets]
 S -->|CSV確認・公開| L
 L -->|任意で地図表示| G[国土地理院タイル]
 L -->|外部リンク| M[Google・Apple Maps]
```

外部サービスには写真・口コミを取りに行かない。タイル表示時にIPと表示範囲が伝わる。

## C2: Containers

```mermaid
flowchart TD
 S[SheetsのCSV] --> V[ローカル検証CLI]
 J --> E[CSV書出しCLI]
 E --> S
 V --> J[public/spots.json]
 J --> B[Vite build]
 C[Reactソース] --> B
 B --> D[dist 静的資産]
 D -->|承認後| P[Cloudflare Pages Free]
 P --> R[利用者ブラウザ]
 R --> T[地理院タイル]
```

Sheetsとの認証接続は未実施。ブラウザはSheetsを直接参照しない。DB/バックエンドは存在しない。Pagesは候補であり未接続。

import/exportは同じ列定義・検証スキーマを使用する。公開JSONの初期2件はDATA_EVIDENCEに根拠を記録。

## C3: SPA components

```mermaid
flowchart TD
 App[App] --> Controls[SearchControls]
 App --> Repo[useSpots / spotRepository]
 App --> Core[searchSpots / validation]
 App --> List[SpotList / SpotCard]
 App --> Map[MapView 遅延読込]
 Controls --> Geo[useGeolocation]
 List --> Links[SpotActions / mapLinks]
```

選択ID・基準座標・フィルターはApp内。ドメイン処理はReactに依存しない。MapViewだけがLeafletに依存し、検索条件変更では地図インスタンスを再生成しない。

## C4: Code

```mermaid
classDiagram
 class Spot {
  id: string
  lat: number
  lon: number
  cost: free paid unknown
  verifiedAt: date
  validUntil: date
 }
 class SearchResult {
  spot: Spot
  distance: number
 }
 class Validation {
  parseDataset(unknown): Dataset
 }
 class Search {
  distanceMeters(a,b): number
  searchSpots(spots,origin,filters,today): SearchResult[]
 }
 SearchResult --> Spot
 Search --> SearchResult
 Validation --> Spot
```

本番配信の条件はOPERATIONS、費用比較はRESEARCH_AND_COSTS。旧Worker/D1/R2/一覧だけのMVPは置換済み。
