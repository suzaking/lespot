# LeSpot 運用

## 現行構成

Vercel Hobby（Vite静的配信＋Node.js Functions）、
Upstash Redis（施設DB）、
Leaflet＋国土地理院タイルで運用します。
管理画面は`/admin.html`、地図・検索は`/`です。

DB管理、秘密情報、バックアップおよび復旧は
[DB_OPERATIONS.md](DB_OPERATIONS.md)を正本とします。

## 公開と検証

1. GitHubの`suzaking/lespot`最新mainを確認します。
2. `npm ci`、`npm run check`、ブラウザの`npm run release:check`を実施します。
3. Vercelの対応するCommitでProductionをデプロイします。
4. `/`、`/admin.html`、`/api/spots`の応答を確認します。
5. 無認証の管理APIアクセスが拒否されることを確認します。
6. 地図ピン・検索・GPS拒否・外部地図・実機UIを検証します。

ブラウザE2Eと実機テストを実行していない場合、成功扱いにしません。

## セキュリティ

管理キーとRedisトークンはVercelの環境変数に格納します。
クライアントにRedis資格情報を配信せず、管理APIはBearer認証、
Origin照合、Zodのデータ検証、楽観的リビジョン検査を実施します。

GPS座標をDBに保存しません。Googleマップの口コミや写真を取得しません。
本番レスポンスにはCSP、nosniff、Referrer-Policyと位置情報制限を付与します。

## コスト

Vercel Hobbyは個人・非商用利用の範囲に限ります。
Upstash RedisのFreeプランの上限や利用量を定期的に確認し、
有料プラン・Prod Packへの変更は行いません。
Blobはファイル保存が必要になるまで利用しません。
