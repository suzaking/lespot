> **2026-10-11の方針更新：** この文書には写真・D1・Worker APIを含む旧MVPの内容が残る。**現在のMVP0では写真運用、D1/R2、公開API、LeSpot内地図を必須にしない。** 現行の初期公開仕様は[FREE_MVP_STRATEGY.md](FREE_MVP_STRATEGY.md)、C4構成は[ARCHITECTURE.md](ARCHITECTURE.md)が優先。以下は拡張時の履歴資料であり、写真を後から実装する許可ではない。

# 公開HTTP API・DTO契約 v1.0

この文書がHTTP契約の正本。初期API prefixは `/api/v1`、schema_version=1。列挙値・原データ型は `DATA_MODEL.md`。すべて設計であり、エンドポイントはまだ実装されていない。

## 1. 共通規則

HTTPS、同一オリジン、認証なし、GET/HEADのみ。本文UTF-8 JSON。Content-Typeはapplication/json、エラーはapplication/problem+json。Cookie・GPS・個人識別子は受け付けない。公開CORSを付けず、CORSを認可機構とは考えない。

IDは定義されたUUID/slug形式で検証。未知のqueryパラメーター、重複したrevision、非整数、負のrevisionは400。URL最大2048 bytes。POST/PUT/PATCH/DELETEは405、Allow: GET, HEAD。OPTIONSが必要になる同一オリジン外の呼出機能はMVPに設けない。

公開データのJSON成功応答（regions、地域spots、spot詳細）に `schema_version`、`release_id`、`generated_at` を含める。generated_atは公開データ生成時刻で、施設情報確認時刻ではない。現在公開ポインターの `revision` は `X-Data-Revision` レスポンスヘッダーに整数文字列で返す。クライアントはrelease_idとrevisionの両方を照合する。healthはこの共通envelopeの例外で、第9節の最小形式のみとする。

## 2. エンドポイント

| Method / Path | 入力 | 正常応答 | 例外 |
| --- | --- | --- | --- |
| GET /api/v1/regions | queryなし | 200 RegionManifest | 未公開503 |
| GET /api/v1/regions/{region_id}/spots | revision任意（manifestから受けた値） | 200 RegionDataset | 400/404/409/503 |
| GET /api/v1/spots/{spot_id} | revision任意 | 200 SpotDetailEnvelope | 400/404/409/410/503 |
| GET /media/{photo_id}/{variant} | variant=thumb/detail、queryなし | 200 image/webp | 400/404/503 |
| GET /api/v1/health | queryなし | 200または503、最小状態JSON | 詳細内部情報は非公開 |

HEADはGETと同じヘッダー・状態でbodyなし。画像を含め最初に現在公開版を参照し、過去版を指定して取得するAPIは作らない。revisionは過去データ選択ではなく整合性確認用。

## 3. RegionManifest

```text
{
  schema_version: 1,
  release_id: UUID,
  generated_at: UTCDateTime,
  regions: Array<{
    id: RegionSlug, name: string, timezone: IANAName,
    bbox: [west:number, south:number, east:number, north:number],
    center: {lat:number, lon:number}
  }>,
  presets: Array<{id:PresetSlug,label:string,lat:number,lon:number,zoom:integer}>
}
```

enabled地域だけを返す。manifest内の名称・座標は公開用の基準地点で、利用者の現在地ではない。初期manifestは3プリセット、地域は1件を想定する。プリセットや地域が増えてもクライアントに固定個数を持たせない。

## 4. 地域一覧DTO

```text
{
  schema_version: 1, release_id: UUID, generated_at: UTCDateTime,
  region_id: RegionSlug,
  calendar: {
    country_code: "JP", coverage_start: LocalDate, coverage_end: LocalDate,
    source_url: HttpsURL, checked_at: UTCDateTime,
    holidays: Array<{date:LocalDate,name:string}>
  },
  spots: SpotSearchRecord[]
}
```

空の公開地域は200とspots=[]。存在しない・無効な地域は404。500件またはbyte上限を超える版は公開器で拒否し、APIで先頭500件に切り詰めない。ページングはしない。

### SpotSearchRecord

```text
{
  id: UUID, name: string, category_code: CategoryCode,
  home_region_id: RegionSlug, region_ids: RegionSlug[], timezone: IANAName,
  lat: number, lon: number, location_accuracy_m: integer|null,
  environment: EnvironmentCode,
  entry_cost_type: "free"|"paid"|"unknown",
  entry_min_jpy: integer|null, price_note: string,
  price_plans: PublicPricePlan[],
  stay_limit_kind: "limited"|"unlimited"|"unknown",
  max_stay_minutes: integer|null, stay_note: string,
  quietness: "quiet"|"normal"|"busy"|"unknown",
  quietness_note: string, quietness_observed_at: UTCDateTime|null,
  facilities: Record<FacilityCode,{value:"yes"|"no"|"conditional"|"unknown",note:string}>,
  hours: PublicHours,
  checks: Record<FieldKey,PublicCheck>,
  photo_count: integer,
  thumbnail: PublicPhoto|null
}
```

全13設備を返す。missing値の補完はunknown+対応check unverified。一覧はpublishedかつoperatingだけ。生のpublication_stateをクライアントのフィルターに任せない。checksにはそのDTOの判定に必要なものを含め、source_refsは詳細で展開する。

### 共通子DTO

```text
PublicCheck = {
  status:"confirmed"|"unverified"|"disputed",
  verified_at:UTCDateTime|null, valid_until:UTCDateTime|null,
  note:string, evidence_ids:UUID[]
}
PublicPricePlan = {
  id:UUID, label:string, entry_min_jpy:integer|null, tax_included:boolean,
  applicability:"all_hours_general"|"conditional"|"dynamic"|"unknown",
  details:string, valid_from:LocalDate|null, valid_to:LocalDate|null
}
PublicHours = {
  mode:"regular"|"always"|"irregular"|"unknown",
  holiday_policy:"same"|"special"|"unknown", note:string,
  weekly:Array<{iso_weekday:integer,seq:integer,start_min:integer,end_min:integer}>,
  holiday_periods:Array<{seq:integer,start_min:integer,end_min:integer}>,
  overrides:Array<{
    date:LocalDate,state:"open"|"closed"|"unknown",note:string,
    periods:Array<{seq:integer,start_min:integer,end_min:integer}>
  }>
}
PublicPhoto = {
  id:UUID, thumb_url:SameOriginPath, detail_url:SameOriginPath,
  thumb_width:integer,thumb_height:integer,detail_width:integer,detail_height:integer,
  alt:string,caption:string,credit:string,license_code:string,
  source_url:HttpsURL|null,license_url:HttpsURL|null,captured_at:UTCDateTime|null
}
```

picture URLはサーバーがphoto IDとvariantから生成し、外部URLやR2キーをそのまま公開しない。事実の鮮度と現在営業状態はnow依存なので、APIが「open=true」等を長期キャッシュしない。

## 5. 詳細DTO

```text
{
  schema_version:1, release_id:UUID, generated_at:UTCDateTime,
  calendar: 同じ地域DTOのcalendar型,
  spot: SpotSearchRecord & {
    address:string, floor:string|null, entrance_note:string|null,
    description:string, access_note:string,
    operation_state:"operating"|"temporarily_closed",
    closure_note:string,
    photos:PublicPhoto[],
    source_refs:Array<{
      id:UUID,kind:EvidenceKind,publisher:string,public_url:HttpsURL|null,
      retrieved_at:UTCDateTime,license_code:string,terms_url:HttpsURL|null,summary:string
    }>
  }
}
```

状態判定は、存在しないID・draft・suspendedの404を最優先にする。その後、retiredまたはpermanently_closedは410で最小の取り下げメッセージ、operation_state=unknownは404とする。いずれも設備本文・写真を返さない。publishedかつoperatingのみ通常詳細とする。

publishedかつtemporarily_closedは200でも休業を最優先表示し、通常の経路誘導CTAを無効化する。休業中は第8節の画像配信を停止するため、詳細DTOも `photos=[]`、`thumbnail=null`、`photo_count=0` とし、表示できない画像URLを含めない。

同じspot IDでも現在の公開版しか返さない。詳細を開く時に、メモリ内一覧だけを真実として描画し続けない。SSRもこの取得規則を使用する。

## 6. エラー契約

```json
{
  "type": "about:blank",
  "title": "データが更新されました",
  "status": 409,
  "code": "DATA_REVISION_CHANGED",
  "detail": "検索データを再取得してください。",
  "request_id": "非機微なランダムID"
}
```

| HTTP | code | クライアント |
| --- | --- | --- |
| 400 | INVALID_ARGUMENT | 入力・リンクを確認。本文へ入力値をそのまま反射しない |
| 404 | NOT_FOUND | 非公開または不存在。再試行ループをしない |
| 409 | DATA_REVISION_CHANGED | manifestから1回再取得 |
| 410 | SPOT_UNAVAILABLE | 詳細本文を破棄し、一覧へ戻す |
| 429 | RATE_LIMITED | Retry-After秒を守り、自動連打しない |
| 503 | DATA_UNAVAILABLE / MAINTENANCE | 再試行と一時障害表示。0件と区別 |
| 500 | INTERNAL_ERROR | 内部SQL・stack・binding名・秘密は返さない |

429はレート制御が有効な環境の契約。無料プランに未確認のレート制限機能を当然に備わっているとしない。設定・可用性は運用WUで検証する。

## 7. キャッシュと公開版整合

成功JSON・公開画像は `Cache-Control: public, max-age=60, s-maxage=60, must-revalidate`、weak ETagはschema/revision/payload hash（画像はvariant hash）から生成する。HTML詳細ページも最大60秒、個人状態を含めない。静的JS/CSSのhash付きファイルのみimmutable長期キャッシュ可。healthは監視用なので成功・失敗とも `Cache-Control: no-store` とし、304を返さない。

`If-None-Match` に一致し、現在の公開状態とrevisionが整合する時は304、本文なし、Date/ETag/Cache-Control/X-Data-Revisionを返す。指定revisionが現在と異なる時は304ではなく409。エラーは `Cache-Control: no-store`。

MVPでは独自Cache APIやService Workerによる追加キャッシュを実装しない。CDNに追加ルールを設定する場合も60秒を上回らせない。公開から非公開への切替後、オンラインでの新しい取得には最大60秒の残存を許容する。過去URL・R2のpublic domainから迂回取得させない。

## 8. 写真配信

公開版のapproved写真、publishedかつoperatingのスポットに属することを確認する。R2 getは決まった内部キーのみ。欠損は404として監視し、別URLを取りにいかない。SVG・原本・任意pathは配信しない。Content-Type image/webp、X-Content-Type-Options nosniff。画像変換は公開時で、リクエスト中に実行しない。

画像はスポットの休業・取り下げや権利失効時に停止できること。過去版に戻す前にも取り下げ台帳を再適用する。ブラウザに保存済みのファイルの回収は保証できない。

## 9. Healthと管理者操作

healthは `{"status":"ok"|"degraded","schema_version":1}` のみ。D1到達とactive版が読めるかを確認し、内部アカウントID・SQL・施設件数を晒さない。公開版未作成なら503。

管理者用登録・編集HTTP APIはMVPに存在しない。運営CLIはCloudflare管理APIへ認証して書き込み、アプリ利用者はアクセスできない。管理コマンドの入出力・公開手順は `DATA_OPERATIONS.md`。

## 10. 契約試験

最低限、全応答の型・必須項目・NULL・enum、ID/query拒否、HEAD、ETag/304、revision409、部分取得、未公開404、取り下げ410、秘密フィールド除外、R2不正path、500の秘匿を実行する。healthのenvelope/cache例外と、休業詳細の空の写真フィールドも検証する。設計上の型記法はそのまま実行コードではない。実装WUで共有schemaを作り、本書との対応を固定する。
