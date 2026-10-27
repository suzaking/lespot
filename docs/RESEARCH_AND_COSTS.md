# 選定・無料条件（2026-10-28更新）

| 候補                     | 機能・無料/保守条件                                                       | 依存/導入負担と判断                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Google Maps URLs         | APIキー不要の地図/経路/パノラマ起動。公式文書あり                         | 採用。URL関数のみ、口コミ・写真を保持しない                                                                          |
| MapLibre GL JS 6.16.0    | BSD-3-Clause、Vite worker URL対応                                         | 採用。道路だけのベクタースタイルが必要。地図を明示操作後に遅延読込                                                   |
| OpenFreeMap public tiles | OSMベース、APIキー/アカウント不要。公式公開情報で無料・リクエスト上限なし | 採用。道路レイヤーのみ描画し、OSM/タイル帰属を表示。SLA保証なし                                                      |
| 地理院標準/淡色タイル    | APIキー不要、標準的な地名・地物表現                                       | 不採用。記号/地名が要望に合わず、表示スタイルの細かい制御もできない                                                  |
| CARTO basemaps           | APIキー要件を変更。無料条件・利用量制限があり                             | 不採用。現行要件に対して接続/キー管理が増える                                                                        |
| Stadia Maps Toner Lines  | 道路線のみのラスターあり。無料は開発/評価/非商用、上限後は停止            | 不採用。公開本番のドメイン認証を別途設定する必要がある                                                               |
| Leaflet / React Leaflet  | BSD-2-Clause / React adapter                                              | 不採用。道路のみベクタースタイルを描けず、Leaflet本体を依存から削除                                                  |
| MapLibre/OpenLayers      | 多機能な無料OSS                                                           | MapLibre採用。OpenLayersは既存React/Vite構成で移行コストが上がるため不採用                                           |
| Google Maps JS/Places    | 詳細施設API                                                               | 不採用。課金・キー管理・転用規約の負担                                                                               |
| React + Vite + TS        | MIT/Apache-2.0のOSS、公式リリース/registry確認                            | 採用。CSR静的検索、SSR/ルーター不要。バージョンはpackage.jsonにexact固定                                             |
| Zod                      | MIT、入力スキーマ＋TS型推論                                               | 採用。ブラウザ/CLI同一スキーマ。独自validatorの重複回避                                                              |
| csv-parse                | MIT、CSV引用符/改行/BOM等                                                 | 管理CLIだけ採用。split(',')の不具合を回避                                                                            |
| native HTML controls     | ブラウザ標準の入力/キーボード対応                                         | 採用。Radix/shadcn等はdialog等の要件がなく不採用                                                                     |
| Web Parts Library        | 同一所有者。copy=trueのartifactだけMIT-0。本体は権利留保                  | README/package/LICENSEを確認。Astro/Recipe移植より小規模React部品が簡単なためコピーなし                              |
| Vitest + Testing Library | MIT、純粋関数/React操作                                                   | 採用。Playwright＋axeでブラウザ補完                                                                                  |
| ESLint 10 + TS/Hooks     | 現行互換版                                                                | 採用。jsx-a11yはESLint10のpeer未対応のため追加せずaxeで検査                                                          |
| 非公開Google Sheets→CSV  | 既存の表編集機能、公開/認証API不要                                        | 採用。CSV検証を自動化。Sheets直接接続は未設定                                                                        |
| GitHub Actions           | private repoではプラン別無料枠と超過設定に注意                            | 手動dispatchテンプレートのみ。無料残量未確認のため有効化なし                                                         |
| Cloudflare Pages Free    | 当初の候補。静的配信の無料枠あり                                          | 2026-10-24のユーザー指定でVercelへ変更。実接続なし                                                                   |
| Vercel Hobby             | 無料。個人・非商用のみ、追加使用量購入不可。上限時は停止/待機の可能性     | ユーザー指定で採用。Vite静的配信、vercel.app、Functions/Storage不要。個人・非商用Hobbyに限定。既存本番接続を確認済み |
| 自前サーバー/DB          | 更新管理を柔軟にできる                                                    | 不採用。50人規模の読取専用静的情報には不要                                                                           |

GitHub検索：Shota-Zaki所有のuseGeolocation/distanceMetersは一致なし（コード索引範囲の制約あり、全repoに存在しないとの断定ではない）。Web Parts LibraryのREADME/package.json/LICENSE.mdを追加確認し、コピーせず採用判断へ使用。LeSpot既存の距離仕様・URL方針は継承。

## 公式出典

Vercel条件は2026-10-24確認：

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/limits/fair-use-guidelines
- https://vercel.com/pricing
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/project-configuration/vercel-json

- https://developers.google.com/maps/documentation/urls/get-started
- https://maps.gsi.go.jp/development/ichiran.html
- https://maps.gsi.go.jp/development/sample.html
- https://leafletjs.com/download.html
- https://leafletjs.com/examples/quick-start/
- https://openfreemap.org/quick_start/
- https://openfreemap.org/
- https://openfreemap.org/quick_start/
- https://maplibre.org/maplibre-gl-js/docs/
- https://docs.stadiamaps.com/authentication/
- https://docs.stadiamaps.com/limits/
- https://developers.cloudflare.com/pages/functions/pricing/
- https://developers.cloudflare.com/pages/platform/limits/
- https://github.com/Shota-Zaki/Web-Parts-Library/blob/main/LICENSE.md
- npm registryの各packageメタデータ・導入済みLICENSE（固定版はTHIRD_PARTY_NOTICES）

上記のサービス無料条件と、運営者の現地確認・電気・通信・既存契約の費用は別。将来の規約/上限変更はあり得る。人数だけで無制限保証はしない。無料枠を超えて自動課金する有料契約は有効化しない。
