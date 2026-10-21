# 開発・無料運用・公開ゲート

## ローカル

npm ci → npm run check → Playwright導入済み環境でnpm run test:e2e。ビルド結果はdist。現在の実行環境に制約があればVERIFICATIONへ記録する。

Node24、ロックファイル、型検査、ESLint、Prettier、Vitestで再現する。実施設確認と本番相当E2E完了前は完成扱いしない。

## 公開前に確認すること

- CloudflareアカウントがPages Freeであること、使用量・上限、既存Paidサービスに変更がないこと。
- Pages Functions/Worker/D1/R2を追加せず、pages.devの無料URLを使うこと。
- ユーザーによる本番公開承認、URL、運営者/情報更新窓口。
- 実施設の区画位置・利用条件・出典/権利と確認期限。
- 本番ビルドのE2E・実機リンク起動、_headers適用、更新失敗時の旧版維持・取り下げ。

Cloudflare設定の閲覧・接続・デプロイは未実施。無料残量を確認済みと推測しない。50人という人数だけでは無料保証にならない。

## セキュリティ・プライバシー

GPSはユーザー操作時のみメモリ保持。ログ/解析/URL/保存なし。外部経路へorigin送信なし。地図タイルはIPと表示範囲を提供元へ送るため画面で説明する。

Zod strict検証、固定先外部地図URL、Reactのテキストエスケープ、出典HTTPS、noopener/noreferrer。_headersにCSP、Referrer-Policy、Permissions-Policy、nosniffを設定。Leafletの動的位置CSSのためstyle-srcのみunsafe-inlineを許可。scriptはselfのみ。

写真・ログイン・投稿・秘密鍵・ユーザーデータ保存なし。public/に置くものは全て公開される。CSV原本/秘密情報を置かない。

## コスト

地理院タイルとMaps URLsは契約APIを使わない。Pages Freeの静的配信だけを使う。上限変更/規約変更/地図停止は残るリスク。無料枠付き有料契約は追加しない。CIは無料残量・課金停止設定の確認前に有効化しない。
