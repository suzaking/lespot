# 開発・無料運用・公開ゲート

## ローカル

npm ci → npm run check → Playwright導入済み環境でnpm run test:e2e。ビルド結果はdist。現在の実行環境に制約があればVERIFICATIONへ記録する。

Node24、ロックファイル、型検査、ESLint、Prettier、Vitestで再現する。実施設確認と本番相当E2E完了前は完成扱いしない。

## 公開前に確認すること

- VercelアカウントがHobbyであること、個人・非商用用途であること、使用量・上限、Pro/課金サービスに変更がないこと。
- Functions/Storage/Analyticsを追加せず、付属vercel.appの無料URLを使うこと。
- ユーザーが2026-10-24にVercel公開を指定済み。対象アカウント、URL、運営者/情報更新窓口を確認。
- 実施設の区画位置・利用条件・出典/権利と確認期限。
- 本番ビルドのE2E・実機リンク起動、vercel.jsonヘッダー適用、更新失敗時の旧版維持・取り下げ。

Vercel設定の閲覧・接続・デプロイは未実施。無料残量を確認済みと推測しない。50人という人数だけでは稼働保証にならない。VERCEL_DEPLOYMENTを参照。

## セキュリティ・プライバシー

GPSはユーザー操作時のみメモリ保持。ログ/解析/URL/保存なし。外部経路へorigin送信なし。地図タイルはIPと表示範囲を提供元へ送るため画面で説明する。

Zod strict検証、固定先外部地図URL、Reactのテキストエスケープ、出典HTTPS、noopener/noreferrer。vercel.jsonにCSP、Referrer-Policy、Permissions-Policy、nosniffを設定。Leafletの動的位置CSSのためstyle-srcのみunsafe-inlineを許可。scriptはselfのみ。

写真・ログイン・投稿・秘密鍵・ユーザーデータ保存なし。public/に置くものは全て公開される。CSV原本/秘密情報を置かない。

## コスト

地理院タイルとMaps URLsは契約APIを使わない。Vercel Hobbyの静的配信だけを使う。Hobbyは個人・非商用のみで追加使用量を購入できず、上限時は停止/待機の可能性がある。広告や商用化の際は無料前提を再検討し、有料変更は承認を得る。上限変更/規約変更/地図停止は残るリスク。CIは無料残量・課金停止設定の確認前に有効化しない。
