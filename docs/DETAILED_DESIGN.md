# 詳細設計 v1.0

この文書は計算・状態・モジュール境界の正本。列・型は `DATA_MODEL.md`、HTTPは `API.md`、画面表現は `UI_UX.md`。

## 1. 実装予定のモジュール

以下のパスは将来の設計であり、現在存在する実装ではない。

| パス | 責務 |
| --- | --- |
| src/lib/domain/types.ts | 公開DTOと検索入力の型 |
| src/lib/domain/freshness.ts | Check→fresh/stale/unverified/disputed |
| src/lib/domain/distance.ts | Haversineと安定ソート |
| src/lib/domain/opening-hours.ts | 暦日営業時間・祝日・日またぎ・滞在判定 |
| src/lib/domain/search.ts | 条件一致、部分結果、件数 |
| src/lib/domain/pricing.ts | 有効な最低利用料金候補と表示用注意 |
| src/lib/client/datasets.ts | manifest、地域取得、ETag、版整合、abort |
| src/lib/client/location.ts | 明示的GPS取得と位置状態 |
| src/lib/client/search-state.ts | 検索中心・フィルター・選択のメモリ状態 |
| src/lib/map/leaflet-adapter.ts | 地図・ピン・タイル切替・ライフサイクル |
| src/lib/server/bindings.server.ts | Cloudflare binding取得の版差を隔離 |
| src/lib/server/public-store.server.ts | active releaseとpayload・写真metadataのread |
| tools/data/* | authoring検証、公開、差分、復旧CLI |

UI・サーバー・CLIは同じenum・検証スキーマを共有する。public-storeに書き込みメソッドを作らない。

## 2. 入力と状態

### SearchInput

- origin：`{kind:'geolocation'|'preset'|'map', lat, lon, accuracy_m?:number}`。座標はメモリのみ。
- radius_m：300/500/1000/2000/3000、初期1000。
- category_codes：カテゴリ配列、初期空。
- environments：indoor/outdoor/mixedの配列、初期空。
- cost_type：any/free/paid、初期any。
- max_entry_jpy：NULLまたは整数0..100000、初期NULL。UIプリセットは500/1000/2000/指定なし、入力欄も用意する。
- seat_types：chair/bench/sofa配列。1つ以上指定時、座席内はOR。
- facility_codes：座席を除く設備コード配列。設備間はAND。
- include_conditional：boolean、初期false。
- open_now：boolean、初期false。
- min_stay_minutes：NULL/15/30/60/120、初期NULL。
- night_mode：any/late_night/today_24h、初期any。
- quiet_only、with_photo：boolean、初期false。
- now：テストで注入できるUTC時刻。実利用は端末時計を使用し、信頼できるHTTP Dateとの差が5分以上なら時間条件をunknownへ落として端末時計確認を表示する。

HTTP Dateはサーバー経由で得られる現在時刻の参考値であり、API応答にはcache Ageが付く場合がある。Date+Ageと往復時間を考慮する。5分未満の差まで完全な時計同期を保証しない。

### 位置状態

idle → requesting → available / denied / timeout / unavailable / unsupported。

`getCurrentPosition` をユーザー操作で1回実行し、timeout=10000ms、maximumAge=60000ms、enableHighAccuracy=falseを基本とする。粗い結果からの再取得は本人が「精度を上げて再取得」を選んだ時だけenableHighAccuracy=trueで1回。watchPositionは使用しない。

accuracy_m>200では精度注意、>1000ではその位置を自動採用せず、地図上で中心を選ぶか「この位置で探す」を本人に選ばせる。位置取得拒否後に毎画面で再要求しない。fallbackは選択済みpreset、未選択なら栄preset。

## 3. データ取得と整合性

1. manifestを取得し、公開地域・プリセット・schema_version・revisionを検証する。
2. originとradiusから検索円のbboxを求め、交差するenabled地域を選ぶ。初期国内範囲では緯度差 `radius/111320`、経度差 `radius/(111320*cos(radians(lat)))` に5%の安全余裕を加えたbboxで候補選択し、最終距離はHaversineで判定する。latは度、三角関数への入力はラジアンとする。
3. 8地域を超える場合は取得せず範囲縮小を案内する。国内以外・緯度絶対値85以上の処理は地域未対応扱い。世界対応を装わない。
4. expected revisionを付けて地域payloadを並列取得する。通信同時実行は最大3、タイムアウト8秒、再試行は利用者操作または一度の版再取得のみ。
5. 異なるrelease/revisionは結合しない。409または不一致があればmanifestから1回やり直し、再失敗は更新中表示。旧結果を新データとして表示しない。
6. 一部地域失敗なら取得できた地域だけで表示できるが、「一部の地域を取得できません」と件数不完全を明示。失敗地域の空配列を正常な0件へ変換しない。
7. 同じ版のスポットをidで重複排除する。同IDの内容が相違すればデータ不整合として当該版をエラー扱いにする。
8. 同じ地域・版はメモリキャッシュ。新条件入力時は取得をabortし世代番号で古い応答を無視する。localStorage/IndexedDB/Service Workerには保存しない。

フォアグラウンド中は60秒ごと、再表示時も最終検証から60秒以上なら再検証。HTTPキャッシュが304/新200で確認できた時刻を保持する。ネットワーク不通で15分以上再検証できなければ「最新情報未確認」とし、open_now/min_stay/night_modeの厳密検索は停止する。詳細を新たに開く時は常に現在の公開状態を検証する。

## 4. 距離計算・結果順

地球半径R=6,371,008.8mの球近似を本製品の仕様として採用する。

```text
phi1 = radians(origin.lat); phi2 = radians(spot.lat)
dphi = phi2 - phi1; dlambda = radians(spot.lon - origin.lon)
a = sin(dphi/2)^2 + cos(phi1)*cos(phi2)*sin(dlambda/2)^2
a = clamp(a, 0, 1)
distance_m = 2*R*atan2(sqrt(a), sqrt(1-a))
```

距離境界は `distance_m <= radius_m`。フィルターは未丸め値、ソートは距離昇順→IDのASCII昇順。距離表示は1000m未満で10m単位四捨五入、10m未満は「10m未満」、1000m以上はkm小数1桁。1000m未満の四捨五入で1000mになった場合は「約1.0km」。すべて「直線距離」で、地下街・道路・高低差は考慮しない。

同一座標で0m、経緯度逆転、球面のa範囲、境界±0.01m、同距離ID順を試験する。測地線・徒歩距離の精度を表明しない。

## 5. 事実の有効性

`effectiveCheck(check, now)` は missing/unverified→unverified、disputed→disputed、confirmedかつnow>=valid_until→stale、それ以外→fresh。未来のverified_atは入力不正として公開しない。

stored値は詳細で「前回確認時の情報」として表示可能。hard filterはfreshであることを要求する。unknownはfalseではなく判定不能。施設名・位置等に古い情報があるだけで全詳細を隠さず警告するが、公開器の初回必須確認は満たす必要がある。

設備値yesはfreshなら一致、no/unknownは不一致。conditionalはfreshかつinclude_conditional=trueの場合のみ候補に含め、条件文字列を必ず表示する。この一致は条件成立の保証ではない。異なる区画の条件を合成しない。

## 6. フィルターの評価順と定義

基本候補はpublication_state=publishedかつoperation_state=operating。臨時休業・不明状態は一覧候補から除外する。詳細の状態表示はAPIに従う。

評価順は距離→カテゴリ→屋内外→料金→座席・設備→営業時間・滞在→夜間→静かさ→写真。順序によって最終集合が変わらないよう全条件を純粋predicateにする。

| 条件 | 一致規則 |
| --- | --- |
| カテゴリ | 指定なしは全件、指定ありはOR |
| 屋内外 | 指定コードとの完全一致。mixedをindoorへ自動一致させない。environment check fresh必須 |
| 無料/有料 | entry_cost_type一致、priceとaccess check fresh必須。NULL最低料金を0円としない |
| 最大最低利用料金 | price/access fresh、適格プランが存在し、生成した最低料金<=指定値。価格不明・変動・会員限定のみは除外 |
| 座席 | 選んだ座席タイプのいずれかが設備一致 |
| 設備 | 選んだ各設備がすべて一致 |
| 現在利用可能 | 現在の暦日営業時間がopen。表現は「営業時間上は利用可能」 |
| 今からN分休憩 | 滞在制限がfreshでunlimitedまたはmax>=N、かつ営業時間が今からN分連続でカバー。制限不明・営業時間不明は除外 |
| 深夜 | 05:00より前なら当日、05:00以降なら翌日の00:00〜05:00に30分以上の連続営業時間がある。対象日を明示 |
| 本日24時間 | 当日の[00:00,24:00)全体が確認済み営業時間で覆われる。通常24hでも当日例外があれば不一致 |
| 静か | quietness=quiet、check fresh、観察日時・note必須。現在の静かさは保証しない |
| 写真あり | 現在公開できるapproved写真が1件以上。画像読込成功までは条件にしない |

open_nowと深夜を同時指定した場合は両方必要。0件でも勝手に片方を外さない。条件解除案は「無料を外す」等の操作で提示し、不明をありに変える回復策にしない。

## 7. 営業時間アルゴリズム

### 7.1 評価対象

施設タイムゾーンで日付と分を得る。区間は開始を含み終了を含まない `[start,end)`。MVPはAsia/Tokyoの地域を対象とし、他タイムゾーン拡張時はDST境界の試験を追加する。OSローカルタイムへ依存しない。

通常時間は「建物が開いている時間」ではなく、その休憩区画を一般利用できる時間。最終入場・清掃閉鎖で一般利用時間が異なる時は短い方へ正規化するか、計算できなければirregularにする。

### 7.2 暦日の生成

1. 必要な各暦日と前日のweekly periodを実日時区間へ展開する。alwaysは毎日24時間。hours checkがfreshでなければ基礎状態はunknown。
2. 日またぎ期間を各暦日の00:00/24:00で切り、その日に含まれる部分を集める。
3. 祝日ならholiday_policyで当日の区間を置換する。sameは通常区間、specialはholiday_periods（0件ならclosed）、unknownはunknown。ただしholiday_periodsもhours checkの対象であり、hours checkがfreshでなければspecialでもunknownのままとする。祝日マスタ範囲外でholiday_policy!=sameの場合もunknown。
4. date overrideがあれば、freshなhours_exception checkの下で当日の全区間を置換する。closedは空、openはoverride_periods、unknownまたは期限切れ例外はunknown。古い例外がある日に通常営業へ黙って戻さない。freshな暦日例外は、その日全体の独立した確認として基礎時間がunknownでも適用できる。
5. 区間をソートし、重複・接続を結合する。nowが含まれればopen、既知の空または範囲外はclosed、情報不足はunknown。

例外は暦日ルール。火曜終日休業なら月22〜火02の火00〜02も消える。月曜の営業日全体を休む意図なら火曜の持越し区間にも必要な例外を登録する。これは入力支援・公開プレビューで注意表示する。

TS-12には、hours check期限切れ+holiday_policy=specialではunknown、同じ日にfreshなopen/closed例外があればその例外を適用するケースを必ず含める。

### 7.3 滞在・夜間

N分滞在は `[now,now+N)` が連続して既知のopen区間に包含されること。閉店時刻と完全一致する退出は許容するが「閉店に余裕なし」を表示する。途中のunknown、昼休み、清掃休止で不一致。仮眠・横臥は営業時間とは別に許可のチェックが必要。

例：09:00〜18:00なら18:00はclosed、17:30から30分は時間条件一致、17:31から30分は不一致。月22:00〜火02:00なら火01:00は通常open。祝日・当日例外があればそれを優先する。

## 8. 料金の扱い

最低利用料金は滞在時間に対する見積もりではない。一般成人・予約なし・税込・必須初期費用込みの適格プランから選ぶ。時間単価への換算、平均化、最低注文を0円化する処理はしない。

以下は架空の試験例。

| 入力 | 表示・検索 |
| --- | --- |
| 無料ベンチ、確認済み | 無料、0円。価格0と不明の区別を試験 |
| 飲み物の最低注文450円、必須費用なし | 最低利用料金450円、飲食注文が必要。1時間450円とは表現しない |
| 入場600円+登録200円が全員必須 | 最低利用料金800円。600円の上限には不一致 |
| 会員限定500円、一般利用額不明 | 料金条件を表示し、厳密予算検索から除外 |
| ホテル「3,000円〜」、日付で変動 | price_note表示、最低料金の比較値はNULL |

price valid_from/toとcheck期限を評価する。前回保存した最小値だけを根拠に、失効プランを予算条件へ一致させない。必要ならprice_plansの適格性から再計算する。

## 9. 一覧・地図の同期

結果はIDの同一集合から生成。最初に一覧20件、明示的「さらに表示」で20件ずつ追加。総件数は取得成功範囲についてのみ表示する。DOM仮想化はMVPで必須にせず、キーボードと読上げを優先する。

地図上は同じ結果のうちviewport内を描画し、一覧が地図範囲内だけではないことを明示する。重なりは固定グリッド集約（64CSS px）を基本とし、グループ選択で拡大、最大zoomで同位置候補の一覧を開く。外部のクラスターパッケージは互換性・a11yを試験して採用するか、自作小規模グリッドで代替する。

選択IDはひとつ。カード選択はピンへfocus/pan（reduced-motionなら即時）、ピン選択は対応カードへスクロールして選択状態を知らせる。条件変更で選択が消えれば解除し、消えた詳細を自動で別スポットに差し替えない。

## 10. URLと復元

共有可能なのはpreset、radius、各filter、spot ID。緯度経度はURL・history.stateへ書かない。任意地図中心・GPSはroot layoutのメモリ状態に保持し、アプリ内で戻る時だけ復元する。再読込時は共有可能なpresetへ戻ることを説明する。

フィルターmodalはdraftとappliedを分ける。適用で更新、キャンセルで破棄。Escape/ブラウザ戻るでも同じ。URLの未知値は無効として既定値に正規化し「無効な条件を解除しました」を表示する。サーバーAPIの未知パラメーター処理とは別。

## 11. 外部経路

Google Maps URLの `api=1`、destination=`lat,lon`、travelmode=walking を利用。originを省略し、出発地は外部サービスに委ねる。URLは固定ドメインとURLSearchParamsで生成し、登録された任意リダイレクト先を使わない。[SRC-05]

通常のリンクとして同じタブから遷移でき、端末設定によりアプリまたはWebが開く。アプリ起動成功を保証しない。新規タブを選ぶ場合はnoopener/noreferrer。遷移前に「外部地図で経路を確認」を表示し、位置座標・条件ログを送らない。

## 12. 失敗と復旧の原則

タイルエラーは地図だけ、画像エラーは画像だけを縮退。データ0件・未対応・取得不能・schema非互換を区別する。JSONの構造不正は部分的に安全なふりで取り込まずエラーにする。経路遷移失敗時は住所・座標のテキスト表示で利用を継続できる。

詳細URLが非公開化された場合は内容を消し、一覧へ戻る導線を出す。メモリ上の古い選択を保持して再表示しない。ネットワーク不通のブラウザや利用者が保存した画像まで遠隔削除できるとは表明しない。
