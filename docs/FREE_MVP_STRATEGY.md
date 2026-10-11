# 写真なし・無料優先MVPの仕様 v1.2

日付：2026-10-11。**この文書が現在のMVPスコープの正本**。以前の写真・R2・D1・Worker API前提の設計は初期公開には適用しない。C4モデルはARCHITECTURE.md参照。

## 目的と境界

LeSpotは「休憩できる場所を探す」ことに集中する。**写真の収集・アップロード・保存・表示・許可管理は行わない**。スポットの施設写真・口コミ・営業時間、近くの風景や徒歩経路は、ユーザーが明示的に外部Googleマップへ進んで確認する。Street Viewは周辺撮影地点であり、必ず施設内部やベンチを表示するわけではない。

最初は「休憩スポット一覧・現在地または地域基準の距離順・カテゴリと半径・場所確認・外部地図へのリンク」だけでよい。これが旧MVPより小さい**MVP0**。ログイン、独自写真、内蔵地図、サーバーAPI、D1、R2、動的空席情報は初期公開には必要ない。料金・設備・利用時間などは独立した確認済み情報がなければ表示せず、不明を無料・営業中・利用可へ変換しない。

## 採用構成

- React + Vite + TypeScript strict：利用者向け静的SPA。
- Cloudflare Pages Free：`dist/` に生成したHTML/JS/CSS/`spots.json`を静的配信。Pages静的アセット要求は無料・無制限、Freeのビルド上限は月500回等。新規課金契約や独自ドメインを必須としない。
- private Gitの構造化JSON：編集正本。施設公式、名古屋市のCC BY 4.0公園一覧、現地確認、ライセンス確認済みOSMから候補を収集する。
- Geolocation API：現在地は利用者の明示操作時だけ取得。GPSをURL・Cookie・ログ・永続ストレージに書かない。
- Google Maps URLs・Apple Map Links：ユーザーが選択時に外部へ遷移。GoogleのAPIキー・Places API・Street View Static APIは使わない。

## 最小スポットデータ

各スポットに独自ID、名称、主カテゴリ、正確に確認した緯度経度、住所（分かる場合）、料金区分（free/paid/unknown）、出典種別・出典URL（ある場合）・ライセンス・確認UTC日時を保持する。Google Place IDは適法に取得し当該施設と照合できた場合のみ任意で保持。施設内ベンチはGoogleの施設詳細が存在しない場合もあるので、座標のピンを基本リンクとする。

## 外部リンクの契約

公式Google Maps URLsの`api=1`を使い、全入力はURLSearchParamsでエンコード。名称・住所が確かな施設なら`https://www.google.com/maps/search/?api=1&query=<name,address>`で施設検索。対応するGoogle Place IDが確認済みなら`query_place_id`も付けてよい。Google検索結果が正しい施設を指すと保証しないのでラベルは「Googleマップで施設を検索」。

正確な位置には`https://www.google.com/maps/search/?api=1&query=<lat,lon>`、徒歩経路には`https://www.google.com/maps/dir/?api=1&destination=<lat,lon>&travelmode=walking`を利用。出発地点（origin）は省略する。

周辺Street Viewには`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=<lat,lon>`。ユーザー向け文言は「周辺をストリートビューで見る」。画像・パノラマの有無、撮影日、撮影位置や施設内部を保証しない。Apple Maps代替は`https://maps.apple.com/?ll=<lat,lon>`、徒歩経路は`https://maps.apple.com/?daddr=<lat,lon>&dirflg=w`。開く先が地図アプリかWebかは端末次第。

**重要：外部リンクがAPIキー不要であることと、Googleのレビュー・写真・営業時間をLeSpotのデータベースへ転用できることは別。** Maps/Placesのスクレイピングや無断転載をしない。Street View Static APIで画像をサイト内に埋め込む方式は課金設定を要するため採用しない。

## データ収集の組み合わせ

1. 名古屋市公園一覧：公園名・所在地の候補源。**ベンチ・電源・自由な休憩利用を証明しない**。出典・CC BY 4.0帰属を表示する。
2. 施設公式：休憩区画・利用ルール・料金区分が分かる時だけ掲載する。
3. 現地確認：座標・入口・座れる場所の可否を確認する。写真は撮影・保存しない。
4. OpenStreetMap：座席や公園などの候補にも使えるがODbLの帰属表示・派生DB提供条件を評価する。本番で無料公開Overpass APIへの常時依存を作らない。
5. Googleマップ：**利用者の外部確認先**であって、独自施設データを自動生成する無断取得元にしない。

まず10件の根拠ある候補でPC/iOS/AndroidのGoogleリンクと位置を確認し、必要に応じて60件へ拡張。運用費0円と現地確認の人件費0円は区別する。

## 受入基準

- 位置許可前にGPSを要求しない。拒否/timeout/未対応でも栄・久屋大通・矢場町から一覧を表示。
- 直線距離の未丸め値で並び、項目の0円とunknownを区別。出典・最終確認日を表示。
- 地図ピン/施設検索/徒歩経路/Street Viewのリンクを正しい座標で生成。施設検索は誤解決、Street Viewは撮影地点にズレがあり得ると明示。
- PC、320CSS px、キーボード、読み上げ、空一覧、地域未対応、JSON取得失敗、外部リンクの新しい画面への移動を確認。
- 実データの座標・休憩可否・ライセンス・出典を確認。架空fixtureやGoogle由来の無断データを本番公開しない。
- Cloudflare Pages Free利用状況・運営連絡先・利用条件・公開権限を確認してからデプロイ。静的更新は再ビルドが必要で、旧設計の60秒取り下げ保証はない。

## 段階的追加

- 一覧だけでは周辺把握しづらい→Leaflet＋地理院タイルの内蔵地図を追加（出典を表示）。まだDBは不要。
- 設備/営業時間をLeSpot内で検索したい需要が確認できた→手動根拠・期限を持つデータと判定を追加。
- 更新頻度や権限管理が複雑になった→D1 Free＋Worker APIを再評価。課金リスクや運用工数を再検証。
- 写真運用は上記のどの段階でも自動復帰しない。再度の明示要求を要する。

## 公式資料（2026-10-11確認、変更され得る）

- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)
- [Google Street View Static API 使用量・課金](https://developers.google.com/maps/documentation/streetview/usage-and-billing)
- [Cloudflare Pages Functions 料金](https://developers.cloudflare.com/pages/functions/pricing/)
- [Cloudflare Pages 上限](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Pages GitHub連携](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [名古屋市 都市公園一覧](https://www.city.nagoya.jp/kurashi/douro/1014853/1014871.html)
- [OpenStreetMap ライセンス](https://www.openstreetmap.org/copyright)
- [Apple Maps Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html)
- [Google Places API Policies](https://developers.google.com/maps/documentation/places/web-service/policies)

**状態：設計提案。** 実装・施設の現地確認・Googleリンクの個別実機確認・Cloudflare契約/デプロイは未実施。
