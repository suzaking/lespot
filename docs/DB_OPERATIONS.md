# LeSpot DB管理・運用（2026-10-24）

## データの正本

スポットは**Upstash Redis**の1キー `lespot:spots:v1` にJSONとして保存する（revision付、原子的な比較更新）。ユーザー公開APIは `GET /api/spots`、運営者は`/admin.html`と`GET/PUT /api/admin/spots`を使う。CSVは本番データ更新に使用しない。

初回DBが空の場合に限り、`data/bootstrap-spots.json`に記録した確認済み2件を`SET NX`で初期登録する。初回登録後はDBが唯一の正本。次回デプロイで初期データを上書きしない。空データ（全件削除）もrevision付きでDBに残り、次回デプロイで復元されない。

### 管理画面

1. Vercelプロジェクト `zaki-7fc3/lespot` の環境変数 `LESPOT_ADMIN_TOKEN` を自分だけが知る十分に長い値に設定/更新し、Vercelで再デプロイする（公開リポジトリ、チャット、URLへ入力しない）。
2. 本番 `https://lespot-lac.vercel.app/admin.html` にアクセスし、同じ値を管理キーとして入力する。キーは画面メモリのみ保持（localStorage/cookieなし）。通信はHTTPS。
3. 登録済み施設から編集/削除、または「新規登録」。施設情報を確認して保存する。
4. 更新前に「JSONバックアップを保存」で手元に復旧用JSONを保持する。バックアップは公開共有しない。
5. 他の管理画面が先に保存した場合、revision照合でHTTP 409となる。再読込してから保存し直す。

REST APIの書き込みにはサーバー内の`LESPOT_ADMIN_TOKEN`によるBearer認証およびOrigin一致が必要。公開クライアントへKVトークンを配信しない。編集データはZod strictObject、重複ID、出典HTTPS、座標範囲、確認日で検証する。公開APIで非公開フィールドは配信しない。

### 障害と復旧

- Redisに接続できない場合、APIはHTTP 503を返して画面は再試行メッセージを表示する。静的JSONへ黙ってフォールバックしない。
- 復旧はUpstash Redis側のデータ確認、または認証付き管理APIから検証済みバックアップを修復登録する。DBキーの削除は初期データの再投入を招くので通常運用で実行しない。
- 1つのJSON datasetの上限は500件。将来の大量データ/複数管理者には専用PostgreSQLとRBACを検討する。
- 地図ピンは施設の代表位置。GPS座標はDBに保存しない。

### 無料枠

2026-10-24時点でUpstash Redis Freeは256MB・月50万コマンド、Vercel HobbyにもFunctionsの無償枠がある。いずれも制限/利用条件は更新され得るため運用画面を確認する。Blobストアは接続済みだが現在画像などのバイナリを必要としないため未使用。Blobへテキスト施設情報を重複保存しない。
