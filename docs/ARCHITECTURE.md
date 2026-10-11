# LeSpot 基本設計 v1.1 — C4モデル

更新日：2026-10-11。今回の追加指示は「React＋Vite案で進め、ソフトウェアアーキテクチャをC4モデルでHTML出力」。アプリ本体・依存関係・クラウド資源は未実装・未作成。

React＋Viteで進める方針と、費用が発生しないことを優先する条件はユーザー指示。D1 Free・静的画像ゲート等の実現方式はPROPOSED_DEFAULT。クラウド契約、課金、公開の承認ではない。承認状態はDECISIONS.md。

## 1. 変更の要点と選定根拠

| 領域 | v1.1の基準 | 理由・制約 |
| --- | --- | --- |
| Web UI | React＋Vite＋TypeScript strict | 地図・条件変更・一覧同期をブラウザ内で行う。直近の利用履歴を選定理由にしない |
| ルーティング | React Routerの宣言的ルーティングを暫定推奨 | SvelteKit固有のファイルルーターを前提にしない。版の互換性はT-001で確認 |
| API | 独立したCloudflare Worker / TypeScript | 公開read APIと画像ゲート。Reactとは型・ドメイン契約を共有し、実行環境を分離 |
| 地図 | Leaflet＋地理院pale/std | 独自施設データと背景地図を分離。出典明示、通常viewportでの利用、実地UX試験を維持 |
| 公開DB | D1 / Workers Freeの枠内 | 公開版の切替・取り下げを画像配備から独立して行う。無料枠超過では停止し、有料化しない |
| Web・画像配信 | Workers Static Assets＋Worker画像ゲート | R2契約をMVP必須から除外。写真追加には静的資産の再配備が必要 |
| 編集正本 | private Gitの構造化JSON＋運営CLI | 既存の根拠・確認期限・権利審査・版管理を維持 |
| 初期URL | workers.devを推奨 | 新規ドメイン購入を必須にしない。実際の公開URLは未作成 |

React公式は一般にはフレームワーク利用を推奨しており、Vite構成が常に優れるわけではない。本MVPではSSR/RSCを主目的とせず、ルーティング、取得状態、エラー境界、コード分割を明示的に設計する負担を受け入れる。フレームワーク名を置換するだけで移行完了としない。[S-03,04]

純静的JSON＋画像のみも比較した。最小構成にはできるが、公開ポインター切替と画像取り下げを配信デプロイから分離できないため、今回はD1 Freeを維持する。R2は画像更新を独立させやすい一方、無料枠付きの従量契約であり、追加契約なしの構成を優先して外す。[S-09,11]

## 2. C4モデルの読み方

C1はSoftware System全体、C2は実行・保管単位、C3は単一Containerの内部責務、C4は重要なコード契約を示す。C4のContainerはDocker限定ではない。全レベルが必須ではなく、今回のC4は検索ドメインに限定する。[S-01,02]

本書が構成・境界・変更適用の正本。HTMLは図と解説をまとめた説明用スナップショット。図は実装・デプロイ済み構成を検出した結果ではない。

## 3. C1 — システムコンテキスト

| ID | 種別 | 内容 |
| --- | --- | --- |
| P1 | Person | PC・スマートフォンから休憩場所を探す利用者 |
| P2 | Person | 公式情報・現地確認・写真権利を審査する運営者 |
| S1 | Software System | LeSpot。休憩候補検索、詳細、外部経路導線 |
| E1 | External System | 国土地理院タイル。背景地図のみ |
| E2 | External System | Google Maps。明示操作で外部経路を開く |
| E3 | External System | GitHub private repository。設計・編集正本・変更履歴 |

P1→S1：検索・詳細閲覧（HTTPS）。P2→S1：管理CLIで登録・公開・訂正。S1のブラウザ→E1：タイル取得（HTTPS）。S1のブラウザ→E2：目的地のみを経路URLに渡す（HTTPS）。S1の運営ツール→E3：編集正本の取得・Commit（Git/HTTPS、運営時のみ）。施設公式サイト等は運営者が根拠を確認する対象であり、公開APIがリクエストごとに取得する依存先ではない。

## 4. C2 — コンテナ

| ID | Container / Data store | 技術・実行場所 | 主な関係 |
| --- | --- | --- | --- |
| WEB | Webアプリ | React＋Vite＋TypeScript / 利用者ブラウザ | APIから公開JSONと写真、E1からタイル、E2へ外部リンク |
| API | 公開API・画像ゲート | TypeScript / Cloudflare Workers Free | DBをprepared statementsで読む。ASSETはASSETS binding経由 |
| DB | 公開データDB | Cloudflare D1 Free | 正規化データ、公開ポインター、検索・詳細JSON、写真権利 |
| ASSET | 配信アセット | Workers Static Assets | HTML・JS・CSSと審査済みWebP。原本や秘密は入れない |
| CLI | データ公開ツール | Node.js / TypeScript / 運営者PC | Git正本を検証し、資産を配備後、DBを検証・公開切替 |

WEBとAPIは同一オリジンで通信する。ASSETは同じWorkerの静的資産bindingであり、写真用に別の有料ホストを要求しない。Viteはビルドツールで、本番で常駐するサーバーではない。Cloudflareは配置先であり、別の業務コンテナとして重複して描かない。

## 5. C3-A — WEB内部

| ID | Component | 責務 |
| --- | --- | --- |
| W1 | 画面・ルーター | 地図・一覧・詳細、遷移、フォーカス |
| W2 | 検索コントローラー | 条件draft/applied、検索中心、選択ID、結果統合 |
| W3 | 位置取得アダプター | 明示操作のGeolocation、精度・拒否・timeout、代替中心 |
| W4 | データクライアント | Fetch、ETag、revision、AbortController、部分失敗、メモリcache |
| W5 | 検索ドメイン | 距離、料金、時間、設備、鮮度の純粋関数 |
| W6 | 地図アダプター | Leaflet、タイル、ピン、クラスタ、中心、出典 |

W1→W2、W2→W3/W4/W5/W6が主要依存。W4の同一版データをW2がW5へ渡し、W5の結果をW1/W6へ反映する。W4はAPIへ、W6は地理院へ接続。ドメインはReact・Leaflet・Fetch・DBをimportしない。

現在地はブラウザメモリのみ。LeSpotの検索API、URL、history.state、永続storage、アプリログに入れない。地理院にはIP・表示タイル範囲が伝わり得るため、完全な位置秘匿とは表明しない。位置拒否時も地域プリセットと地図中心検索を維持する。

## 6. C3-B — API内部

| ID | Component | 責務 |
| --- | --- | --- |
| A1 | HTTPルーター | GET/HEAD、ID/query検証、経路・状態判定 |
| A2 | 公開データRepository | 現在のactive release、公開DTO、写真権利の取得 |
| A3 | 画像ゲート | published・operating・approvedを確認して固定内部パスを読む |
| A4 | レスポンス方針 | ETag、304/409、404/410/503、キャッシュ、安全なheaders |

A1→A2、画像要求はA1→A3→A2→DB、許可時だけA3→ASSET。A4の方針で応答を整形。公開APIは書込不可。既存API.mdのエンドポイント、DTO、unknown、health例外、revision照合を維持する。

## 7. C4 — W5のコード契約（未実装）

`searchSpots(input: SearchInput, snapshot: PublicSnapshot): SearchResult`を入口とする設計。Snapshotは同一release/revisionのSpotSearchRecord集合、Inputは検索中心・条件・注入可能なUTC時刻。戻り値はitems、判定上のwarnings、coverage/部分取得状態。

| 関数契約 | 内容 | 重要試験 |
| --- | --- | --- |
| distanceMeters(origin, spot) | Haversine。未丸め値で判定、距離→IDで安定順 | 同一座標、半径境界、度→ラジアン |
| effectiveCheck(check, now) | fresh/stale/unverified/disputed | valid_untilちょうど、missing、disputed |
| eligibleEntryCost(plans, checks, now) | 一般成人・予約なし・税込・必須初期費用 | NULL/0、会員のみ、動的価格、期限切れ |
| evaluateOpening(hours, calendar, now) | 日またぎ・祝日・暦日例外・滞在 | 閉店境界、前日持越し、祝日不明、確認期限 |

関数名は今回の設計案。実装済み型・クラスの自動解析ではない。計算規則の詳細とデータ列挙値はDETAILED_DESIGN.md/DATA_MODEL.mdを維持する。料金の不明を0円、ソファを仮眠許可、営業時間を空席へ変換しない。

## 8. 静的画像ゲートと公開手順

### 8.1 配信境界

審査済み派生画像のみをASSET内の `/__photos/{photo_id}/{sha256}-{variant}.webp` に配置。`thumb_key/detail_key` はR2キーではなく、この固定内部パスとして使う。公開DTOは従来の `/media/{photo_id}/{variant}` のまま。原本・許可メール・内部メモを配信ディレクトリに置かない。

`/api`と配下、`/media`と配下、`/__photos`と配下、詳細・地域のゲート対象経路をrun_worker_firstへ列挙する。内部画像パスは外部から404。画像ゲートはD1のactive版と権利を確認してからASSETS.fetchを使用し、任意URL取得をしない。二重エンコード、大小文字、区切り文字、dot segment、直接URL、HEAD、Content-Typeを試験する。ルール名だけで非公開保護済みとは判断しない。[S-08]

Worker枠超過では保護対象が429となり、静的ファイルへ素通しさせない。D1不通なら503。preview_urls=falseを設定して過去版URLの取得不能を確認し、公開別名・カスタムドメインの迂回経路も列挙する。アカウント上の実検証が公開ゲート。[S-06,14]

### 8.2 データ公開

1. clean Git SHAと最新takedownsを固定し、schema・根拠・権利を検証。
2. 新規画像がある場合、現行公開版に必要な画像を保持したまま審査済み画像資産を先行デプロイ。内部資産manifestとハッシュを確認する。公開経路は旧active版のままなので未公開写真は返さない。
3. D1の新releaseをstagingとして登録し、JSON・件数・FK・画像資産対応を検証。
4. ready後、expected revision付きでpublicationを切り替える。公開API・画像・HTMLを再取得。
5. 未参照資産の削除・保持版整理は別作業。誤った取り下げの復活を避ける。

D1切替と資産デプロイは分散トランザクションではない。配備直後に画像欠損があれば旧activeを維持して再試行。世界中へ瞬時に完全反映されるとは保証しない。Workerの旧版rollback前にも、現在のD1版の画像・スキーマとの互換性を確認する。最新取り下げ台帳を無視した旧データ版へのrollbackは禁止。

オンライン新規再取得時の最大60秒cache残存という目標を維持。現在表示中・offline・保存済みコピーの回収を保証しない。写真がない施設でも利用でき、画像障害は画像だけ縮退。

### 8.3 CSRと非JavaScriptフォールバック

主画面はCSR。React SSR/RSCやSvelteKit adapterを必須にしない。公開詳細の直接URLはWorkerで状態を確認し、404/410/休業状態を保持する。

既存のJavaScript無効時の閲覧方針を捨てないため、公開器が公開DTOから簡易HTMLを生成する。`/__fallback/{release_id}/spots/{id}.html` と地域一覧の固定内部パスに置き、直アクセスを拒否する。公開URLから現在版のゲートを通して取得する。簡易HTMLには動的な「現在利用可能」を埋め込まず、通常時間・確認日時・出典・JavaScript必須の機能を明示。SPAシェルとnoscript代替を含む静的HTMLとし、実行時のReact SSRとは分ける。資産を先行配備する同じ手順を適用する。古い版をURLパラメーターで公開しない。

## 9. 無料運用の境界

確認日2026-10-11。Workers Free：100,000 requests/日、CPU10ms/実行。D1 Free：読取5M行/日、書込100k行/日、単一DB500MB、合計5GB。Static Assets：Freeで20,000ファイル/版、25MiB/ファイル。純静的配信とWorkerを通す画像/APIのリクエスト枠は別。[S-05〜10]

D1 Freeで日次上限を超えるとクエリは失敗する。無断でPaidへ移行しない。使用中アカウントがすでにPaidならこの前提は成立しないため、既存サービスを勝手にダウングレードせず、無料運用可能な正当な配置先を確認する。無料枠を逃れる目的の複数アカウント作成はしない。

R2、有料地図、Places/Routes API、有料監視、新規ドメイン購入をMVPの前提から外す。GitHub Actionsは残り無料枠・超過課金停止を確認してから利用し、それまではローカル検証。定期監視の有効化は未実施。無料枠で性能や安全性を満たせなければ、0円保証をせず対策・停止・必要な承認を記録する。

仮定：1訪問20 Worker requests・60 D1読取行なら1,000訪問/日で20,000 requests・60,000行。60スポット×2枚×2派生サイズで240画像。これは実測ではなく、bot、長時間閲覧、監視、他プロジェクトを別加算する。通信・電気・現地調査・写真許可・人件費・既存契約・AI開発費用はサービス実行基盤の無料枠とは別。

## 10. v1.0の関連仕様への適用表

この節は今回の技術変更に対する置換規則の正本。既存の詳細文書を丸ごと廃棄せず、以下の旧方式だけをSUPERSEDEDにする。サービス機能、FR/NFRの品質目標、データ列・計算規則・受け入れ条件はそれ以外を維持する。対応する旧記述をそのまま実装しない。

| 対象 | 旧記述の置換 |
| --- | --- |
| AGENTSのSvelteKit版・adapter注意 | React/Vite/Router/Cloudflare pluginの互換性を確認。ドメインからUI・基盤を隔離する原則を維持 |
| DATA_MODEL photos.thumb_key/detail_key | R2キー→第8節のASSET内部パス。列名・公開URL・権利metadataは維持 |
| API.md画像配信・SSR参照 | R2 get→権利検証後のASSETS.fetch。詳細はCSR＋同じ状態ゲートの静的fallback。HTTP/DTOは維持 |
| DETAILED_DESIGNのSvelte/root layout/binding | Reactのルーター配下メモリ状態とWorker binding。計算・ETag・例外優先を維持 |
| DATA_OPERATIONSのR2先行upload | Static Assets＋fallback HTMLの先行配備・manifest検証。D1 CAS公開、takedowns、backupは維持 |
| OPERATIONSのR2 bucket/secrets | ASSETS bindingに置換。R2契約・鍵は不要。preview無効化、Free確認を追加 |
| OPERATIONSのSvelteKit CSP/SSR | Reactビルド成果とWorker headersへ。静的fallbackにも同じ秘匿・状態ルール |
| RESEARCH_AND_COSTSのR2見積・Paid移行 | 比較用の旧案。現行MVP見積からR2を除き第9節のFree構成を使用。有料化は許可されていない |
| TEST_PLANのR2/SSRケース | 同じIDで静的画像ゲート・fallback・直URL・quota fail-closed・旧asset版rollbackへ置換 |
| TASKS T-001/002/019/020/021/023 | React/Vite/Router/Worker構成へ。SvelteKit scaffoldを実施しない |
| TASKS T-012/014/017/029/030/035 | R2関連を静的画像資産、経路保護、Free確認、整合・復旧試験へ置換 |
| TASKS T-025/031/033/034/036/039 | 新ゲート・静的fallback・配備manifest・無料枠と実機検証へ適用。タスクはTODOのまま |

次回の実装開始時に対象文書・タスク行をこの置換規則で編集・展開してからコード化する。今回のC4出力は全詳細文書の逐語的な移行まで完了した意味ではない。構成変更の未適用箇所はAI_WORK_STATE/NEXT_WORKに明記する。

## 11. 将来拡張

1地域500件/未圧縮1.5MB/gzip350KB、取得8地域、検索性能の既存分割基準を維持。投稿・画像投稿・会員・お気に入り・混雑はMVP外。管理量・画像数増大で静的資産の再配備が負担になった時に、R2等を料金・権限とともに再評価する。現在地をサーバー検索に送る変更は別のプライバシー判断。地域拡張のため画面コードへ名古屋固定の分岐を入れない。

## 12. 公式出典

全て2026-10-11確認。製品動作やアカウント残枠を確認済みという意味ではない。

- S-01 C4 diagrams: https://c4model.com/diagrams
- S-02 C4 code: https://c4model.com/diagrams/code
- S-03 React build from scratch: https://react.dev/learn/build-a-react-app-from-scratch
- S-04 Cloudflare React/Vite: https://developers.cloudflare.com/workers/framework-guides/web-apps/react/
- S-05 Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- S-06 Assets billing: https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
- S-07 Workers limits: https://developers.cloudflare.com/workers/platform/limits/
- S-08 Assets bindings: https://developers.cloudflare.com/workers/static-assets/binding/
- S-09 D1 pricing: https://developers.cloudflare.com/d1/platform/pricing/
- S-10 D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- S-11 R2 subscription: https://developers.cloudflare.com/r2/get-started/
- S-12 地理院タイル: https://maps.gsi.go.jp/development/ichiran.html
- S-13 Maps URLs: https://developers.google.com/maps/documentation/urls/get-started
- S-14 Preview URLs: https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/
