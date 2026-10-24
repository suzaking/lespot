# 次のWork Unit

対象：Shota-Zaki/lespot / main。再開：/continue Shota-Zaki/lespot。

## I-10：Vercel接続後の公開

AGENTS → AI_WORK_STATE → docs/VERIFICATION → docs/OPERATIONSを読む。ローカル実装、初期実データ2件、35件単体/操作テスト、本番E2E9件は完了。既存の技術選定やCSV代替について再確認しない。

1. GitHubの最新mainと正本を確認する。
2. 2026-10-24にVercel公開の意向は確認済み。Vercelアプリ未インストール/未接続で提案済み。接続を確認後、アカウントHobby/個人非商用条件・使用量、公開URL、窓口を確認。公開承認を再質問しない。
3. VERCEL_DEPLOYMENTの手順でNode24、vercel.jsonのbuild、出力dist、静的配信。Functions/DB/ストレージ/有料ドメインは追加しない。
4. 有効期限を確認し、必要なら公式資料を再確認。npm run release:check後に公開。ヘッダー/キャッシュ/モバイル/外部リンク/復旧を確認。
5. 実iPhone/AndroidでGPS・地図アプリ・読み上げを確認。端末なしなら未実施として記録。

Sheetsは非公開CSV編集で運用可能。直接同期・Actionsは無料条件と接続承認を確認するまで有効化しない。追加候補はDATA_CANDIDATES、照合根拠はDATA_EVIDENCE。

## I-10 接続ブロッカー追記（2026-10-24）

Vercel MCP接続とHobbyチーム認証は済み。既存Project `zaki-7fc3/lespot`（`prj_x8SleXqg0siwHMQwPPkHfiKBaOtT`）は`suzaking/lespot`へ誤接続状態で、Deployments 0件。正本`Shota-Zaki/lespot` / mainへのVercel Gitアクセスはなく、preview要求は`incorrect_git_source_info`。既存プロジェクトから誤Repositoryを本番配信しない。

次の作業はユーザーがGitHub `Shota-Zaki`でVercel GitHub Appの`lespot`単独アクセスを承認後、Vercel git_namespaces/search_repoで対象の表示を確認し、既存プロジェクトのGit接続を正本へ修正（UI操作が必要なら案内）してからデプロイする。Hobby/private repoのコミット作者制約も確認。公開意向は承認済みで再質問しない。Node 24、Vite、既存vercel.json、静的配信、課金不可は維持する。

## 2026-10-24 公開後の次作業

- 公開URL: https://lespot-lac.vercel.app/。本番deployment READY、HTML/JSON HTTP 200、静的2件を確認。
- `suzaking/lespot` mainの `1cc5f7e` に本番ビルド修正を反映。元文書内の `Shota-Zaki/lespot` 正本記述は現行Vercel/GitHub実体と相違するため、今後Repository移転の要否を別途確認（無断移転しない）。
- 本番Chromeの操作E2E・iPhone Safari・Android・GPS/地図外部アプリ・スクリーンリーダー・現地確認はNOT_RUN。
- BlobはVercelの `BLOB_READ_WRITE_TOKEN` 接続済み、アプリコードは未使用。UpstashのRedisリソースは環境変数未登録で未使用。静的JSONは従来通り正常配信。両ストレージは用途/無料枠を確認し、ユーザーデータを保存しない設計で採用可否を決める。
- 公開後の実行時エラー確認、データ更新/ロールバック検証、運用連絡先整備を進める。
