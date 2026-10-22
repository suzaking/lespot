# 次のWork Unit

対象：Shota-Zaki/lespot / main。再開：/continue Shota-Zaki/lespot。

## I-10：本番公開の準備と承認

AGENTS → AI_WORK_STATE → docs/VERIFICATION → docs/OPERATIONSを読む。ローカル実装、初期実データ2件、35件単体/操作テスト、本番E2E9件は完了。既存の技術選定やCSV代替について再確認しない。

1. GitHubの最新mainと正本を確認する。
2. 本番公開の許可後、Cloudflareアカウント/Pages Free・課金設定、無料残量、公開URL、運営窓口を確認。権限がない場合のみ具体的な接続手続きを依頼。
3. Node24、build npm run build、出力dist、静的配信のみ。Functions/DB/ストレージ/有料ドメインは追加しない。
4. 有効期限を確認し、必要なら公式資料を再確認。npm run release:check後に公開。ヘッダー/キャッシュ/モバイル/外部リンク/復旧を確認。
5. 実iPhone/AndroidでGPS・地図アプリ・読み上げを確認。端末なしなら未実施として記録。

Sheetsは非公開CSV編集で運用可能。直接同期・Actionsは無料条件と接続承認を確認するまで有効化しない。追加候補はDATA_CANDIDATES、照合根拠はDATA_EVIDENCE。
