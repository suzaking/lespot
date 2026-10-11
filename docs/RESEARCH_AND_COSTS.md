# 公式調査・選定根拠・運用費用

確認日：2026-10-11。価格はUSD、税・為替・個別契約・既存アカウント利用分を含まない。本書の価格は確認時点の公開情報であり、契約時に再確認する。LeSpotでの実動・負荷・現地調査は未実施。

## 1. 確認済み情報と推奨の区別

「確認済み」は以下の公式文書の記載を確認したという意味で、LeSpotの動作確認ではない。「推奨」「試算」は設計者の判断。「未確認」はアカウント設定、権利者への許可、現地状況など、まだ調べていない事項。無料枠があることを、全用途・無制限・無期限の無料保証と解釈しない。

## 2. 出典台帳

| ID | 公式資料・URL | 確認内容と設計への反映 |
| --- | --- | --- |
| SRC-01 | [国土地理院：地理院タイル一覧](https://maps.gsi.go.jp/development/ichiran.html) | Web等でリアルタイムに読み込んで表示する利用は、出典明示のみで利用できる旨を確認。pale/stdの定義と提供範囲・zoomを使用。印刷・収集・二次配布まで無条件としない |
| SRC-02 | [国土地理院：コンテンツ利用規約](https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html) | 2025-11-20改定。原則として公共データ利用規約PDL1.0を参照する現行内容。第三者権利・個別条件を別途確認 |
| SRC-03 | [OSMF：Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/) / [OSM著作権・ライセンス](https://www.openstreetmap.org/copyright) | 公共タイルサーバーは容量が限られ、出典・アクセス・キャッシュ・バルク取得のルールがある。データのODbLとタイルサービスの条件は別。公共サーバーを無制限の本番配信基盤と見なさない |
| SRC-04 | [Google：Places API Policies](https://developers.google.com/maps/documentation/places/web-service/policies) | 保存・キャッシュ・表示・帰属表示に制限があり、place ID等の例外も別規定。Google由来の施設本文・写真を独自DBへ自由に転載する設計にはしない |
| SRC-05 | [Google：Maps URLs](https://developers.google.com/maps/documentation/urls/get-started) | 共通URLによる検索・経路案内はAPIキー不要。MVPは外部リンクのみとし、PlacesやRoutesの有料呼出を行わない |
| SRC-06 | [Cloudflare：Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) / [Limits](https://developers.cloudflare.com/workers/platform/limits/) | Freeは100,000 requests/day、1実行CPU10ms。Paidは月額最低5ドル、10M requestsと30M CPU-msを含む。超過は0.30ドル/M requests、0.02ドル/M CPU-ms。Workers for Platformsの別料金と混同しない |
| SRC-07 | [Cloudflare：D1 Pricing](https://developers.cloudflare.com/d1/platform/pricing/) | Freeは日次5M行読取・100k行書込・合計5GB。行走査や索引更新も計測に影響するため、HTTP件数と同一視しない。無料枠超過による利用失敗を考慮 |
| SRC-08 | [Cloudflare：D1 Limits](https://developers.cloudflare.com/d1/platform/limits/) | Freeの単一DBは500MB、合計5GB。1行／文字列2,000,000 bytes、SQL100,000 bytes、bound parameters100。Time TravelはFree7日、Paid30日。payload上限をこれより小さく設定 |
| SRC-09 | [Cloudflare：R2 Pricing](https://developers.cloudflare.com/r2/pricing/) | Standardの無料枠は10GB-month、Class A 1M、Class B 10M/月。Standard単価は0.015ドル/GB-month、A4.50ドル/M、B0.36ドル/M、egress無料。Infrequent Accessに同じ無料枠を適用しない。課金単位の切り上げを考慮 |
| SRC-10 | [Cloudflare：Static Assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) | Workerを起動しない静的資産配信は無料・リクエスト無制限。SSR/APIやrun_worker_firstでWorkerを実行する経路は別。全リクエストが静的無料になるわけではない |
| SRC-11 | [SvelteKit：Cloudflare adapter](https://svelte.dev/docs/kit/adapter-cloudflare) / [Cloudflare：SvelteKit guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/sveltekit/) | Workers/Static Assets向け公式手順がある。依存関係・binding型生成・adapter APIは実装時の同じメジャー版で揃える |
| SRC-12 | [Leaflet API reference](https://leafletjs.com/reference) | タイル・マーカー・キーボード操作等を使う。ライブラリ採用だけでアクセシビリティが達成されるとは判断しない |
| SRC-13 | [W3C：Geolocation](https://www.w3.org/TR/geolocation/) | 権限、secure context、プライバシーへの配慮を確認。利用者操作で要求し、取得不能時の代替を設ける |
| SRC-14 | [W3C：WCAG 2.2](https://www.w3.org/TR/WCAG22/) | AAを設計目標にする。自動検査だけで適合を宣言せず、キーボード・拡大・読上げを確認 |
| SRC-15 | [名古屋市：公園一覧のオープンデータ](https://www.city.nagoya.jp/kurashi/douro/1014853/1014871.html) | 2026-09-11更新ページに、2026-04-01時点の公園一覧・CC BY 4.0を確認。名称・所在地等の候補源。ベンチ、電源、自由な休憩利用の証拠にはしない |
| SRC-16 | [名古屋市：公園での撮影](https://www.city.nagoya.jp/kurashi/douro/1014853/1014872/1014876.html) | 業としての撮影等には許可が必要な場合がある。自分で撮影した写真だから施設許可が不要、と決めつけない |
| SRC-17 | [内閣府：国民の祝日](https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html) | 公式の祝日一覧・CSVを祝日マスタの入力候補とする。取込時点の収録範囲を保存し、範囲外を非祝日と断定しない |
| SRC-18 | [MapTiler Cloud pricing](https://www.maptiler.com/cloud/pricing/) / [Terms](https://www.maptiler.com/terms/cloud/) | Flexは月30ドルを確認。Freeの用途制限、商用R&Dの扱い、第三者ライブラリ利用時のリクエスト課金単位を確認。商用本番が無条件無料とはしない |
| SRC-19 | [Supabase Pricing](https://supabase.com/pricing) | Free DB500MB、Pro月額25ドルから。DB以外の保管・通信・compute等も条件確認が必要。将来の広域検索・認証導入時の代替 |
| SRC-20 | [Cloudflare：D1 REST query](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/) | 管理者CLIからパラメーター付きqueryを送る設計。SQL本文に大きなpayloadを直接埋め込まず、制限・認証を検証する |
| SRC-21 | [DENGENCAFE公式](https://dengen-cafe.com/) | 公式タイトルで電源・充電コンセント・Wi-Fi、現在地・目的地近くのスポット検索を確認。全機能や最新掲載件数を調査したわけではない |

価格表・ライセンス文言の転載ではなく設計に必要な要点を記録した。正式な利用条件は原文を優先する。

## 3. 地図の比較と選択

| 案 | 長所 | リスク・負担 | 判断 |
| --- | --- | --- | --- |
| Leaflet + 地理院pale/std | 日本語の地名、APIキー不要、リアルタイム表示の明示条件 | 商業POI・見た目・施設内表現は別途補う必要。背景タイル停止時の保証を前提にできない | 暫定推奨。実地UX不合格なら変更 |
| Google Maps / Places | 地図・施設情報のエコシステム | 個別SKU課金、取得情報の保管・表示条件。独自DBとの混在設計を再検討する必要 | MVPでは取得APIを使わず外部経路URLのみ |
| MapLibre/Leaflet + MapTiler | ベクター等の表現、商用サービス | 月額・従量・用途条件。LeafletのタイルリクエストとMapTiler SDKのsession単位を混同できない | UX上の必要が確認された場合の代替 |
| OSM公共タイル | すぐ表示できる | 無制限の商用配信基盤ではなくポリシー順守と負荷配慮が必要 | 本番の既定・自動フォールバックにしない |

採用する地理院タイルのURLは公式の定義からallowlist化する。利用者ブラウザから通常のviewport表示分のみ読み込み、サーバーでの代理収集、オフライン事前取得、無断での再配布をしない。出典は見える位置にリンク付きで表示する。[SRC-01〜05,18]

## 4. 競合・代替手段との差別化仮説

Google Mapsの施設検索・経路、DENGENCAFEの電源/Wi-Fiを重視した検索、自治体の施設一覧を代替行動と考える。LeSpotでは「無料で座れる」「屋内で30分休みたい」「横になることが許可された場所」等を区画単位の根拠付き条件として一緒に比較する。[SRC-05,15,21]

これは設計上の仮説で、他サービスに同じ機能が絶対にないという調査結果ではない。既存サービスより検索時間・条件理解・候補の適合性が改善するかを、同一課題の小規模ユーザーテストで検証する。大量の施設数ではなく、狭い地域の確認品質を初期の軸とする。

## 5. 月次使用量モデル（仮定）

1訪問あたり、初期HTML・manifest・地域データ・詳細・写真・再検証を合わせて**20 Worker requests、60 D1 rows read、10 R2 Class B operations**と置く。キャッシュ効果を大きく見込まず、3〜5分利用を想定した概算。実測値ではない。1訪問が長い場合、再検証・地図パン・写真閲覧が多い場合は増える。

監視による追加取得を月1,500 Worker requests、4,500 D1読取行として別枠に見積もる。公開作業は月4回、1回5,000行書込相当を仮置きする。索引書込や取込再実行もあるため、実際のmeta.rows_writtenで補正する。日次上限は月間平均だけでは判定しない。[料金根拠：SRC-06〜10]

| 月訪問数（仮定） | Worker月requests | 30日均等時のrequests/日 | D1月読取行 | R2月Class B |
| --- | ---: | ---: | ---: | ---: |
| 1,000 | 21,500 | 約717 | 64,500 | 10,000 |
| 10,000 | 201,500 | 約6,717 | 604,500 | 100,000 |
| 100,000 | 2,001,500 | 約66,717 | 6,004,500 | 1,000,000 |

いずれも均等利用ならリクエスト数等は記載無料枠内に見えるが、10万訪問シナリオで日次平均の2倍のピークが出るとWorkers日次上限を超える。FreeのCPU10ms内でSSRが安定するかは未検証で、件数が少なくても有料化または構成調整が必要になり得る。

写真は60スポット×2枚×（thumb60KB+detail240KB）=約36MBの派生画像を想定。原本・バックアップ込みの合計は2GB以内を初期予算として仮置きする。R2の課金は容量だけでなく操作回数も対象で、配信をWorker経由にしてもWorker/D1負荷は別に発生する。[SRC-09]

## 6. 維持費の見方

| 項目 | 初期推奨での試算 | 注意 |
| --- | --- | --- |
| Workers / D1 / R2 | アカウント合算が各無料枠内なら0ドルの可能性 | CPU、ピーク、保存版、bot、ログ、他プロジェクト分で変化 |
| Workers Paidへ移行 | 月5ドルから＋超過分 | 自動で有料化しない。CPU上限設定は請求額の完全な上限ではない |
| MapTilerへ変更 | 地図だけでFlex月30ドルから＋従量分 | 採用前に表示回数・tile単位・商用条件を再計算 |
| Supabaseへ変更 | Proは月25ドルから、別途フロント等 | Cloudflare案との二重契約を漫然と続けない |
| ドメイン | 未定 | workers.dev利用・既存ドメイン・新規購入のどれかをO-03で判断 |
| GitHub Actions | 契約の残り枠に依存、未確定 | Linux 1分/回の監視を1時間ごとに実行すると31日で744分＋CI。実際の丸め・既存消費・単価を利用アカウントで確認 |
| 写真権利・交通・人件費 | 未見積の実支出があり得る | サーバー0ドルでも運営0円ではない |

初期収集工数の仮説：60件×机上確認20分=20時間、現地移動・確認12〜20時間、写真整理・権利処理8〜12時間、合計40〜52時間。維持は週3〜6時間を暫定枠に置く。営業条件の変更が多い施設では不足し得る。これは請求額や作業実績ではなく、データ目標の実現性を判断するための計画値。

## 7. コスト制御

毎週、Workersの日次requests/CPU、D1 rows_read/rows_written/容量、R2容量/A/B操作、GitHub Actions使用量を確認する。無料枠または承認済み予算の50%で傾向確認、70%で対策案、90%で公開継続・機能縮退・プラン変更をオーナー判断する。自動通知できる範囲は実アカウントで確認し、未設定を監視済みとしない。

公開器は容量・row countを先に推定し、リリース保持数超過や取込再実行で無料枠を消費しないようにする。料金抑制のために情報鮮度を隠す、出典を消す、タイル規約に反するキャッシュを導入することはしない。

## 8. 未確認事項

Cloudflare/R2の利用開始に必要なアカウント契約・支払設定、残り無料枠、GitHub Actions契約、正式ドメイン、地図の現地視認性、公開データCSVの実際の列と欠損、各施設の休憩許可・設備・料金・撮影許可は未確認。公式ページの存在だけで個別施設の条件を確認済みにしない。必要な確認は `TASKS.md` の担当タスクで実施する。
