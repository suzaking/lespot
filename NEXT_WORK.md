# LeSpot — 次の作業（2026-10-24）

## 現在の構成

- GitHub正本：`suzaking/lespot` / `main`（既存Vercel Git接続先）
- 公開URL：https://lespot-lac.vercel.app/
- UI設計正本：[design.md](design.md)
- React / Vite / TypeScript strict / Leaflet / Upstash Redis / Vercel Functions / CSS Modules
- 初期公開データ：公式根拠を確認した2件（鶴舞公園とノリタケの森）
- 2026-10-24にmap-firstレイアウトへ変更。写真・外部フォント・新規依存なし。

## 優先タスク

1. 最新の`main`を取得し、`npm ci`、`npm run check`、`npm run release:check`を再実行する。最新版Playwrightは実行環境不足のため未実施。
2. PC1280/800・スマホ390/320で検索・フィルター・地図への切替・選択地点プレビュー・詳細へのフォーカス遷移・横はみ出し・axeを目視とE2Eで確認する。
3. 実iOS Safari/Android ChromeでGPS許可/拒否・国土地理院タイル・外部地図起動を確認する。
4. 施設データを追加する場合は利用条件、休憩場所、再利用可能な座標、出典、確認期限を確認してから公開する。既存2件は2026-11-21に確認期限を迎える。
5. Vercel Blobは接続済み・静的アプリから未使用。Upstash RedisへのAPI接続は2026-10-24に本番で確認済み。Blobはファイル保存の用途が発生するまで不要。
6. 最新の本番デプロイ、配信ヘッダー、エラーログを確認し、`docs/VERIFICATION.md`へ追記する。

有料プラン・新しいサービス・写真・ユーザー位置履歴・解析SDKを無断追加しない。古い文書にある`Shota-Zaki/lespot`への移転も行わない。

## 2026-10-24 DB化追記

- 管理画面 `/admin.html`、公開API `/api/spots`、認証API `/api/admin/spots`。詳細は`docs/DB_OPERATIONS.md`。
- 実Redisデータ初期化はDBキーが存在しない場合のみ。`data/bootstrap-spots.json`を非公開初期スナップショットとして保持。
- 公開地図を初期表示。API不通・認証失敗・DB更新・競合/復元・iPhone/AndroidのUIを検証する。Blobはバイナリファイルが必要になるまで未使用。

## 2026-10-24 DB移行の本番実測

- Production deploy `dpl_D9u6fBqCS9wBAN7iyTFu4Y45k9L3` READY。
- `GET /api/spots`はHTTP 200、Redisから鶴舞公園・ノリタケの森の2件を返した。
- `/admin.html`はHTTP 200。管理APIにはBearer認証を要求。実管理者キーを使った本番編集は未検証。
- Vitest39件成功、TypeScript/ESLint/Prettier/build成功。新地図UIの実機とPlaywright E2Eは未実施。
