# データ取得・登録・更新・公開運用

状態：暫定推奨。実施設データ・写真・CLIは今回未作成。ここに記載するコマンド・パスは後続実装の契約であり、現在実行できることを意味しない。

## 1. 運営者と掲載責任

オーナーは公開範囲、料金契約、連絡先、権利・重大訂正を判断する。編集者は根拠を収集し構造化する。レビュー担当は差分・条件・写真権利・公開プレビューを確認する。初期に1人で兼務する場合も入力直後の自動検証と別工程の自己レビューを分ける。実在しない二人目の承認を記録しない。

一般利用者は読み取りのみ。将来の修正依頼フォームとは別に、MVPでもaboutの運営連絡先から訂正・取り下げを受け付ける。実際の連絡先は未定（O-03）。仮のメールアドレスで公開しない。

## 2. 収集の優先順位

1. 施設運営者の公式ページ・案内・問い合わせで、利用区画、料金、時間、許可事項を確認する。
2. 自治体のライセンス付きオープンデータを候補一覧として利用する。名古屋市公園一覧は名称・所在地等に使い、設備・座席・無料利用を自動補完しない。[SRC-15]
3. 運営者が現地で区画・入口・座席・掲示を確認する。電源の使用許可、仮眠許可、飲食持込のような規則は見た目だけでは確定しない。
4. 情報が矛盾する時はdisputed、足りない時はunknownのまま扱う。生成AIによる推測で埋めない。

Google Maps、他サイトの写真・口コミ・施設データを無断で転載しない。公式サイトでもページ全体・写真・文章の自由転載を前提にしない。確認した事実を独自の短い文で構造化し、根拠と利用条件を保存する。自動スクレイピング・大量取得はMVPの収集手段に含めない。[SRC-02〜04]

## 3. 初期60件の収集計画

まず3プリセットと運営上のcoverage bboxを現地・公式地図で確認する。範囲は設定ファイルに記録し、駅入口として扱う点か単なる検索基準点かをラベルで区別する。

候補を無料公共系、有料飲食系、長時間休憩系に分け、1施設ではなく休憩区画単位で重複を整理する。掲載対象カテゴリがあることと、その地域に確認済み対象があることを混同しない。カテゴリ別の件数を無理に満たさない。

公開目標は `REQUIREMENTS.md` の件数・無料・屋内・写真・地域内距離・鮮度基準をそのまま使う。目標を満たせない場合は、未確認データで水増しせず、件数・範囲・写真目標の変更案をO-04としてオーナーに提示する。

各候補の確認票には、名称・座標・階・入口、休憩利用条件、無料/有料と必須初期費用、営業時間・祝日・最終入場、滞在制限、13設備、静かさの観察条件、写真権利、出典、確認日時を記入する。確認できなかった項目も未確認理由を残す。

## 4. 編集正本のファイル構成

```text
data/
  regions.json                 # 地域配列。DATA_MODEL regionsの業務列
  presets.json                 # 検索基準点配列
  calendars/jp.json            # coverage/sourceと祝日配列
  evidence/{evidence_id}.json  # 根拠1件。機密原文は入れない
  spots/{spot_id}.json         # 下記SpotAuthoring
  takedowns.json               # 取り下げ・再公開許可の最新台帳
```

各JSONは `{schema_version:1,...}` を持ち、不明キーは検証エラー。ID・型・enum・文字数は `DATA_MODEL.md` を正本とする。

`SpotAuthoring` は `spot`（spotsの業務列。release_id、entry_min_jpy等の派生値を除外）、`region_ids`、`facilities`、`checks`（evidence_ids配列付き）、`weekly_periods`、`holiday_periods`、`date_overrides`（periodsを内包）、`price_plans`、`photos` の集合。すべての子要素のspot_idは親から生成し、異なる親を指定できないようにする。NULLと配列の省略の扱いは共有schemaで固定する。

写真metadataはSpotAuthoringのphotosが正本。オリジナル画像・許可証拠は暗号化またはアクセス制限された別保管先に置き、Gitにはハッシュと非機密参照IDのみ。公開DTOやCSVに内部参照IDを出さない。データリリースの正規化・payloadは公開器の生成物で、手編集しない。

## 5. 写真処理

撮影前に施設・公園等のルールを確認する。名古屋市の公園では業としての撮影等に許可が必要な場合があるため、LeSpotでの用途を説明して確認する。本人撮影であることだけを許可の根拠にしない。[SRC-16]

自分が権利を持つ写真、明示的な掲載許可、CC BY 4.0、CC0を初期対象とする。CC BYなら撮影者・ライセンスURL・変更内容をクレジットに反映。その他のライセンスは勝手に同等扱いせず個別審査する。人物・車両番号・個人情報の写り込みは削除・ぼかし等を行い、必要な同意が不明なものは公開しない。

公開パイプラインはmagic bytes検査、入力上限20MiB・40メガピクセル、画像デコーダーによる再読込、EXIF/GPS除去、WebP再エンコード、サイズ・寸法・ハッシュ検証を行う。SVG、破損、拡張子偽装、巨大展開画像は拒否する。元画像を直接公開しない。

派生画像サイズは `DATA_MODEL.md` に従う。R2キーは `photos/{photo_id}/{sha256}-{variant}.webp` とし、内容が変わるとキーも変える。public domainを有効化せず、Workerの許可確認を通して配信する。原本と派生画像のバックアップを確認してから公開する。

## 6. 運営CLI契約

すべて将来実装。既定はlocal、remote/prodは必須の明示引数がある場合だけ。認証トークンをコマンド引数や出力へ含めない。

| コマンド名 | 入力・出力 | 成功条件 |
| --- | --- | --- |
| pnpm data:validate | data/と画像metadata → schema・根拠・矛盾・byte長レポート | hard error0。warningはレビュー対象として残す |
| pnpm data:plan -- --env staging | Git SHAと対象DBのrevision →追加/変更/非公開/容量/概算書込行の差分 | 書込なし。元SHA・expected_revisionを記録 |
| pnpm data:photos -- --env staging | 審査済み元画像とmetadata → 派生画像・hash・upload report | 許可・再エンコード・backup・upload検証済み |
| pnpm data:publish -- --env staging --expected-revision N | clean Git SHA・検証済み入力 → release_id、新revision、検証結果 | 下記公開手順とread-back完了 |
| pnpm data:verify -- --env staging | 公開HTTP・DB版を照合 → 型/件数/hash/秘匿/画像の報告 | active版、HTTP版、期待値が一致 |
| pnpm data:rollback -- --env staging --release ID --expected-revision N | 保持版と最新取り下げ台帳 →復旧案・復旧結果 | 権利・schema再検証後のみ切替。不適格版は拒否 |
| pnpm data:audit-stale | 指定nowとdata/ →期限切れ/7日内期限/異議あり一覧 | 事実の日時を自動更新しない |

productionも同じ契約だが `--env production --approved-plan <plan-file>` が必要。planには対象account/database/bucket、source Git SHA、expected_revision、検証結果を含め、現在入力と相違すれば停止する。文字列だけでユーザー承認を捏造しない。最終公開はO-02/O-03を満たす必要がある。

終了コードは0成功、2入力/権利/検証エラー、3revision・source競合、4provider/ネットワークエラー。部分成功を0にしない。通信再試行は指数バックオフ付き最大3回、永続的400/403を反復しない。権限不足では必要なscopeと対象IDを報告する。

## 7. 公開トランザクション

1. cleanな編集CommitのSHAを固定。validate、最新取り下げ台帳、写真backupを確認する。fixtureはproductionで拒否。
2. 対象環境のpublicationとexpected_revisionを読み、planと比較する。同時更新があれば再planする。
3. R2画像を先にuploadし、HEAD/GETでサイズ・ハッシュを検証する。元画像・審査中画像は対象外。
4. staging releaseを作り、同じrelease_idで正規化行・地域payload・詳細payloadを登録する。D1 RESTのbound paramsを使い、1SQL100 params・SQL100,000 bytes等の制約内で分割する。大きなJSONをSQL文字列へ埋め込まない。[SRC-08,20]
5. 全件のFK、checksum、payload型・大きさ、画像存在、公開件数、非公開情報除外をread-back検証。ローカルとリモートの生成物ハッシュを照合する。
6. readyに変更し、publicationを `revision=expected` かつ対象releaseがreadyの場合だけUPDATEする。変更行1件を成功条件とする。全データ取込を単一の巨大トランザクションにする必要はないが、公開ポインターの切替は原子的に行う。
7. active_release_id、新revision、公開API・SSR・画像を再取得する。旧キャッシュはAPI契約の最大60秒を考慮し、新版が返ることを確認する。公開器が利用者のTTL制限を無断で長くしない。
8. 成功ログにsource SHA、release、revision、検証結果、実行者を残す。古い版・未参照画像のGCは別操作とし、切替の成功と同時に削除をしない。

同じsource SHA+content hashを再実行した場合、既にactiveならno-op検証、readyなら再検証後切替、stagingなら進捗と一致を確認して不足分だけ登録。不一致なら別releaseを作る。リクエストタイムアウト時も、公開が失敗したと決めつけて二重切替せず現在revisionを確認する。

## 8. 取り下げ・ロールバック

`takedowns.json` はschema_version、entries配列。各entryはid、target_type spot/photo、target_id、state blocked/cleared、reason_code privacy/rights/incorrect/closed/other、recorded_at、authority_ref（非機密）、note。個人の申立て本文は含めない。latest stateを優先し、clearedも明示的な権利者確認等の根拠が必要。

通常の公開はblockedスポットをsuspended、blocked写真をrevokedとして扱い、入力がpublished/approvedでも公開しない。台帳はGit正本なのでD1の独立編集リストにはしない。

rollback対象も**最新**台帳で再評価する。現在blockedなIDが含まれる保持版はそのまま切替禁止。取り下げを除いた新しい安全な版を生成し、そこへ切り替える。旧リリースを破壊的に書き換えない。写真が台帳上撤回されているのに過去版へ戻して再公開する復旧を禁止する。

緊急時は修正Commit・公開を優先し、公開処理が故障している時はMAINTENANCE_MODEでAPI・SSR・写真を停止する。認知後ただちに取り下げ対応に着手するが、24時間有人監視は約束しない。通常の訂正は1営業日以内に一次確認、3営業日以内に調査・回答を初期運用目標とする。根拠未解決ならdisputedまたは非公開を継続する。

## 9. 更新サイクルと信頼性

毎週audit-staleを実施し、期限まで7日以内・価格や営業時間・利用許可の変更から優先する。TTLは `DATA_MODEL.md` が正本。expiredを自動的にconfirmedへ戻す処理は作らない。記事の公開日、DB更新日時、サイトを開いた時刻を現地確認日と混同しない。

現地静かさは曜日・時刻・イベント等をnoteに残し、現在の騒音・混雑として表示しない。空席は収集も判定もしない。施設運営者からの変更通知、公式改定、利用者の指摘があればTTL途中でも再確認する。

月次はcoverage、写真権利、古い出典リンク、現地誤り、作業時間を点検。祝日マスタは公開前および年次の新年分整備時に公式CSVを確認し、coverage外はunknownにする。確認範囲を無条件に未来へ延ばさない。

## 10. バックアップと管理の境界

公開メタデータはGit Commitから再生成できることを公開前に確認。画像はprivate R2と別のアクセス制限された保管先へ複製し、必要な暗号鍵・権限・復元手順を運営者が管理する。権利撤回後の原本保持は必要性を確認し、原則30日以内の削除を推奨する。法的保存義務・係争がある場合はオーナー判断を記録する。

この文書は法的助言の代替ではない。著作権・個人情報・撮影許可に疑義があるデータは公開を止め、必要に応じて権利者・施設管理者・専門家に確認する。未確定事項があっても架空fixtureによるアプリ実装や他施設の確認は進められる。
