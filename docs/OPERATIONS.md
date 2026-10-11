# 環境・セキュリティ・デプロイ・運用設計

暫定推奨設計。環境・アカウント・デプロイ・監視は未作成。料金・製品の制約は `RESEARCH_AND_COSTS.md`、データ運用は `DATA_OPERATIONS.md` が正本。

## 1. 環境分離

| 環境 | 実行・データ | 公開範囲 |
| --- | --- | --- |
| local | ローカルWorkers互換実行、ローカルD1/R2相当、架空fixture | 開発者PCのみ。実データ・秘密のコピーは最小限 |
| staging | 専用Worker・D1・private R2、試験用データ | 認証等で制限した評価環境。承認なしに未公開施設やfixtureを一般公開しない |
| production | 別Worker・D1・private R2、審査済み実データ | O-02/O-03と公開判定を満たしてから公開 |

名前案はlespot-staging / lespot-production。DBとbucketも同じ環境接尾辞を付ける。実装時に実リソースIDを設定し、環境名だけを見て誤った本番DBへ書かないようplanに対象IDを出す。

stagingのrobots/noindexは認証の代わりにならない。実アカウントで使用できるCloudflare Access等の認証手段・料金を確認して適用する。確保できなければlocalで試験を継続し、アクセス制限なしの公開を勝手に代替にしない。

## 2. 設定・環境変数・秘密

| 名前 | 種別・配置 | 内容 |
| --- | --- | --- |
| APP_ENV | server設定 | local/staging/production |
| PUBLIC_APP_ORIGIN | 公開設定 | 正規URL。未定のドメインを仮公開しない |
| PUBLIC_MAP_PROVIDER | 公開設定 | 初期gsi。コードallowlist外のURLを受け付けない |
| DB | server binding | 環境別D1。ブラウザimport禁止 |
| PHOTOS | server binding | 環境別private R2 |
| MAINTENANCE_MODE | server設定、0/1 | 1ならAPI・詳細SSR・写真を503、案内ページだけ継続 |
| CLOUDFLARE_ACCOUNT_ID | publisher/CI設定 | 対象アカウント。秘密鍵ではないが公開DTOに出さない |
| D1_DATABASE_ID | publisher設定 | 対象環境のDB |
| R2_BUCKET_NAME | publisher設定 | 対象環境のバケット |
| CLOUDFLARE_API_TOKEN | publisher/deploy秘密 | 必要なアカウント・操作に限定したトークン |
| R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY | 画像publisher秘密、必要な場合のみ | 限定バケットへのアップロード。配信Workerに埋め込まない |
| CONTACT_URL | server公開用設定 | 検証済み運営連絡先。httpsまたは明示許可したmailtoのみ |

上記は変数名の設計。実装時にCLIが要求する公式変数名と一致させ、違いは1か所でマッピングする。`PUBLIC_` に秘密を置かない。ローカルの `.dev.vars` / `.env*` / 資格情報ファイルはGit除外、sampleはダミー値のみ。Node側の環境変数とWorkers bindingは混同しない。[SRC-11,20]

## 3. 認証と権限

閲覧ユーザーのアカウントやセッションは作らない。管理者はGitHubとCloudflareの認証・MFAを利用し、公開アプリから管理操作を受け付けない。編集者は必要なRepository権限、公開担当だけが本番deploy/publish権限を持つ。1人運営でも本番トークンをlocal fixture試験へ渡さない。

Cloudflareトークンは対象アカウント/リソースを限定し、D1編集、必要なR2バケット操作、Workersデプロイを用途ごとに最小限にする。scopeの正式名称・粒度は実アカウントで確認する。Global API Keyを既定にしない。GitHub Actions secretsはEnvironment保護と最小permissionsで利用し、外部PR・未信頼コードへ渡さない。

## 4. アプリの防御

公開APIは固定read経路のみ、ID・query・長さ・enumを境界で検証。D1はprepared statements/bound params、公開DTOはallowlist生成。サーバーにURLを渡して写真・公式ページを任意取得させる機能は作らない。HTMLはテキストとして描画し、施設説明・source URLのHTML直挿しを禁止する。

外部URLはhttpsと承認済みmailto以外を拒否。経路URLは固定Google Maps originから生成する。別ドメインへの自動転送は受け付けない。画像は公開時に再エンコード、配信時にactive版・権利・スポット状態を確認し、バケットを公開しない。

CSPはSvelteKitのnonce/hash対応を使用し、script-srcにunsafe-inline/unsafe-evalを許可しない。default-src self、object-src none、base-uri self、frame-ancestors noneを基準にする。地理院タイルの承認済みoriginだけをimg-srcへ追加、connect-srcは原則self。Leafletのstyle属性は互換性確認の上でstyle-src-attrに限定した例外を検討し、scriptの制限と混同しない。実際のCSPはブラウザ試験で確認する。

HTTPS、X-Content-Type-Options nosniff、Referrer-Policy strict-origin-when-cross-origin、Permissions-Policy geolocation=(self)を設定。必要のないカメラ・マイク権限を許可しない。外部画像直リンクを使わず、必要なLeafletアイコンは同一オリジンへ配置する。地図出典リンクは読みやすく維持する。

秘密スキャン・依存関係監査・型検査をCIに含める。lockfileをCommitし、依存更新は自動マージせず互換性・build・主要導線を確認。重大な未対応脆弱性は公開ゲートで停止する。

## 5. プライバシー・ログ

GPSはブラウザメモリだけ。位置・経路検索・フィルターの入力値を分析SDKやログへ送らない。URL/history.stateにも入れない。LeSpotのHTTPへ地域IDが送られ、地理院タイル提供者にはIP・viewport相当のタイル情報、Google Mapsへはリンク操作後に目的地等が伝わることを利用案内に記す。[SRC-01,05,13]

アプリログは日時、ランダムrequest_id、routeのテンプレート、HTTP status、duration、非機密error codeに限定する。raw URL、query、body、Cookie、Authorization、GPS、メール、IP、施設の内部証拠を記録しない。ホスティングや接続先が技術ログを処理する可能性まで否定しない。運用開始時に基盤ログの収集項目・保存日数を確認しprivacy本文へ反映する。

運営ログはsource SHA、release_id、revision、実行者、検証概要を残す。原則90日を運用上の保持目標とし、基盤の無料保存日数を超える外部保管は必要性・費用を判断する。個人を特定するユーザビリティ試験記録は同意・保管先・削除日を別途決め、Repositoryには匿名集計だけを残す。

## 6. CI/CDとリリース

CIの予定順序はformat/lint → typecheck → unit → API/DB integration → build → Playwright smoke。実装がない現在はこのパイプラインも未作成。コマンド名はT-002/T-003で固定しREADMEへ実在する手順として追記する。

アプリ配信とデータ公開を分離する。アプリ変更は後続作業時のユーザー指定ブランチを優先し、指定がなければ現在のmain基準を維持する。今回のdocs直接Commit許可を、将来の無制限な本番デプロイ許可と解釈しない。

デプロイ手順は、対象確認 → CI成功 → stagingへdeploy → migration互換性確認 → fixtureでsmoke → 承認済みデータで公開版検証 → オーナー公開判定 → productionへdeploy → health/検索/詳細/画像/経路/出典/秘密漏洩を確認する。依存バージョン、compatibility_date、Worker版、Git SHA、schema_version、data releaseを記録する。[SRC-11]

schema変更はexpand-contract方式を基本にし、旧アプリが読む列を同時削除しない。アプリrollback時は対象が現在data schemaに対応することを確認する。データrollbackは別手順で、権利取り下げを再公開させない。

## 7. 監視・費用・通知

初期推奨は、デプロイ直後のsmokeとGitHub Actionsによる1時間ごとのhealth/代表詳細取得。1回の監視はLinux runner1分以内を目標とし、実測・契約残り枠を確認して有効化する。予定時刻どおりに必ず走る保証や分単位の障害検知は約束しない。

失敗するworkflowの通知先をオーナーのGitHub通知設定等で確認し、意図的な失敗で通知が届くことを試験する。通知先が未設定のまま監視完了としない。秘密が必要な内部監視と公開health確認は分ける。GitHub Actionsのプラン・現行の実行上限等はT-034で公式情報と実アカウントを再確認する。

Cloudflare側ではHTTP status、CPU、エラー、D1行走査、R2操作・容量を週次点検する。月99.5%は自サービスの運用目標で、無料事業者SLAではない。月次HTTP指標と監視ログの測定条件を合わせて報告し、地図タイル障害は別集計する。1時間の監視頻度では短時間の停止を全件検出できないことを明記する。

無料枠・承認予算の50/70/90%時の判断は `RESEARCH_AND_COSTS.md`。未知のbot流入、CPU制限、D1全走査を早期に調べる。利用可能なレート制御/WAFの機能・費用を確認し、未確認の有料機能を無断で有効にしない。

## 8. バックアップ・復元

公開メタデータはGitから再生成でき、画像は公開前に別保管先への複製を確認するため、公開済みデータのRPOは設計上0を目標にする。これは復元試験で裏付ける目標であって、現在達成済みではない。D1のTime Travel（Free7日/Paid30日）は補助で、Git・写真backupの代わりにしない。[SRC-08]

リリースごとにDB版情報・checksum・適用migration・必要画像のmanifestを保存。障害時は安全なアプリ版 → 空のD1へmigration → Git正本と最新取り下げ台帳から公開版生成 → 画像復元 → 公開ポインター設定 → read-back検証の順。実行者が障害を認知してから2時間以内の復旧を初期目標とする。

四半期ごと、または大きなschema変更後にstagingの空環境で復元試験を行い、経過時間・欠損・権利撤回の維持を記録する。バックアップ鍵・所有者が不明なら復旧可能と判断しない。

## 9. インシデント手順

データ誤り：根拠確認 → disputed/非公開化 → 小さな修正release → 最大60秒のオンラインcache確認 → 原因と再発防止。

画像権利・個人情報：公開停止を優先 → takedowns台帳 → R2配信確認 → 許可・保管範囲の判断 → ログから個人情報を除いた記録。古いreleaseへのrollbackで復活させない。

秘密漏洩：対象トークン失効・再発行 → 影響範囲調査 → 公開成果物/ログ確認 → 履歴上の秘密対応。ファイルの現行行だけを消して安全になったと判断しない。

基盤障害：health/API/画像/地図を切り分け → 地図だけなら一覧縮退 → data不整合なら安全版へrollback → 復旧できなければmaintenance → 再取得smoke。無断で課金プラン変更・別ホスト公開・規約違反のタイル代理取得をしない。

## 10. 公開前の運用ゲート

契約・予算、運営者・連絡先、staging認証、秘密保管、source/写真権利、backup復元、監視通知、privacy/terms/credits、利用者実機試験を確認する。無料枠・コード完成・設計書完成のいずれも公開承認の代わりにはならない。
