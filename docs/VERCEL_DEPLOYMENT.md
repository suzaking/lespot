# Vercelでの公開

2026-10-24のユーザー指定により配信先をVercelへ変更。本番公開の意向は確認済み。未接続のためアカウント/プランと実配信は未確認。

## 無料運用の前提

Vercel Hobbyは個人・非商用に限定。利用料無料のサイトでも広告・業務目的等は別判定なので、Hobbyの用途条件を守る。現在のコードには広告・決済・アフィリエイト・Functions・画像最適化・解析SDKがない。上限超過時は機能停止/待機の可能性があり、50人という利用者数だけで稼働を保証しない。Proへの変更や追加購入は行わない。

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/limits/fair-use-guidelines
- https://vercel.com/pricing

## プロジェクト設定

| 項目                    | 設定                                                          |
| ----------------------- | ------------------------------------------------------------- |
| Git Repository / Branch | Shota-Zaki/lespot / main                                      |
| Plan                    | 個人アカウントのHobbyを確認                                   |
| Framework Preset        | Vite                                                          |
| Root Directory          | Repositoryルート（変更不要）                                  |
| Node.js                 | 24.x（package.jsonのenginesも24）                             |
| Install                 | npm ci --no-audit --no-fund                                   |
| Build                   | node --import tsx scripts/prepare-release.ts && npm run check |
| Output                  | dist                                                          |
| Environment Variables   | 不要                                                          |
| Domain                  | Vercel付属のvercel.app。取得結果のURLを記録する               |

vercel.jsonがinstall/build/output/headerの正本。既存ダッシュボードの上書き設定を確認する。buildでデータ期限と型/Lint/整形/単体試験を検査し、失敗時は配信させない。ブラウザE2Eは公開前にローカルでrelease:checkを実行する。

公開操作は接続済みVercelアプリを優先。Git連携を使う場合は対象Repositoryだけを選び、不要な全Repository権限を増やさない。Git連携後はmainのCommitが自動本番配信されるため、その設定を確認する。Repository自体を公開化する必要はない。

直接CLIで配信する場合も.vercelignoreでCSV原本・環境変数ファイル・テスト成果物を除外。.vercelのローカル接続情報はCommitしない。秘密情報を新たに要求しない。

## 配信後の確認

1. 実アカウントのHobby、Deployment Ready、返されたProduction URLとCommitを照合する。
2. / と /spots.json が200、JSONが2件（または承認済み最新データ）であることを確認する。
3. CSP / Permissions-Policy / Referrer-Policy / nosniff、spots.jsonのCache-Controlを実HTTP応答で確認する。Vite previewはVercelヘッダー適用を再現しない。
4. 地図タイル・GPS許可/拒否・検索/一覧/ピン・外部地図リンクを公開URLで確認する。CSPでVercelのプレビュー用Toolbarが動かない場合があっても、製品に不要な外部scriptを許可しない。
5. 本番で閲覧にVercelログインを要求しないことを確認する。Previewの保護は維持し、用途を確認せずプロジェクト全体の保護を弱めない。
6. データ更新はSheets→CSV→検証→JSON Commit→Vercel再配信。エラー時の前回正常配信維持を確認する。誤情報の復旧は取り下げ対象を復活させない。

## 参照

- Vite: https://vercel.com/docs/frameworks/frontend/vite
- vercel.json: https://vercel.com/docs/project-configuration/vercel-json

公開URL、Vercel project ID、プラン確認、HTTP実測結果は接続・実配信後にAI_WORK_STATEとVERIFICATIONへ記録する。未接続の段階で公開成功とは書かない。
