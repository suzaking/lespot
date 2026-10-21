# 選定・無料条件（2026-10-21確認）

| 候補                     | 機能・無料/保守条件                                      | 依存/導入負担と判断                                                                     |
| ------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Google Maps URLs         | APIキー不要の地図/経路/パノラマ起動。公式文書あり        | 採用。URL関数のみ、口コミ・写真を保持しない                                             |
| Leaflet 1.9.4            | BSD-2-Clause、公式stable。2.0はalpha                     | 採用。地図部品だけに隔離、約45KB gzipを遅延読込                                         |
| 地理院淡色タイル         | 出典リンクを明示してリアルタイム利用                     | 採用。APIキーなし。10–18 zoomで利用、停止時一覧を維持                                   |
| React Leaflet            | React統合の既存部品                                      | 不採用。今回の小規模mapには追加peer/version境界が不要                                   |
| MapLibre/OpenLayers      | 多機能な無料OSS                                          | 不採用。ベクトル/高度なGIS処理がなく導入範囲が広い                                      |
| Google Maps JS/Places    | 詳細施設API                                              | 不採用。課金・キー管理・転用規約の負担                                                  |
| React + Vite + TS        | MIT/Apache-2.0のOSS、公式リリース/registry確認           | 採用。CSR静的検索、SSR/ルーター不要。バージョンはpackage.jsonにexact固定                |
| Zod                      | MIT、入力スキーマ＋TS型推論                              | 採用。ブラウザ/CLI同一スキーマ。独自validatorの重複回避                                 |
| csv-parse                | MIT、CSV引用符/改行/BOM等                                | 管理CLIだけ採用。split(',')の不具合を回避                                               |
| native HTML controls     | ブラウザ標準の入力/キーボード対応                        | 採用。Radix/shadcn等はdialog等の要件がなく不採用                                        |
| Web Parts Library        | 同一所有者。copy=trueのartifactだけMIT-0。本体は権利留保 | README/package/LICENSEを確認。Astro/Recipe移植より小規模React部品が簡単なためコピーなし |
| Vitest + Testing Library | MIT、純粋関数/React操作                                  | 採用。Playwright＋axeでブラウザ補完                                                     |
| ESLint 10 + TS/Hooks     | 現行互換版                                               | 採用。jsx-a11yはESLint10のpeer未対応のため追加せずaxeで検査                             |
| 非公開Google Sheets→CSV  | 既存の表編集機能、公開/認証API不要                       | 採用。CSV検証を自動化。Sheets直接接続は未設定                                           |
| GitHub Actions           | private repoではプラン別無料枠と超過設定に注意           | 手動dispatchテンプレートのみ。無料残量未確認のため有効化なし                            |
| Cloudflare Pages Free    | 静的要求は無料・無制限。Freeは月500build、20,000files等  | 配信候補。Functions/DB/ストレージなし。実アカウント未確認/未接続                        |
| 自前サーバー/DB          | 更新管理を柔軟にできる                                   | 不採用。50人規模の読取専用静的情報には不要                                              |

GitHub検索：Shota-Zaki所有のuseGeolocation/distanceMetersは一致なし（コード索引範囲の制約あり、全repoに存在しないとの断定ではない）。Web Parts LibraryのREADME/package.json/LICENSE.mdを追加確認し、コピーせず採用判断へ使用。LeSpot既存の距離仕様・URL方針は継承。

## 公式出典

- https://developers.google.com/maps/documentation/urls/get-started
- https://maps.gsi.go.jp/development/ichiran.html
- https://maps.gsi.go.jp/development/sample.html
- https://leafletjs.com/download.html
- https://leafletjs.com/examples/quick-start/
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/pages/platform/limits/
- https://github.com/Shota-Zaki/Web-Parts-Library/blob/main/LICENSE.md
- npm registryの各packageメタデータ・導入済みLICENSE（固定版はTHIRD_PARTY_NOTICES）

上記のサービス無料条件と、運営者の現地確認・電気・通信・既存契約の費用は別。将来の規約/上限変更はあり得る。人数だけで無制限保証はしない。無料枠を超えて自動課金する有料契約は有効化しない。
