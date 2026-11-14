# LeSpot Agent Rules

対象：suzaking/lespot / main（現行GitHub/Vercel接続先。過去のShota-Zaki表記と不一致のため無断移転しない）。既存のmain直接Commit運用を維持。他Repositoryのwork運用を持ち込まない。

## 正本・開始手順

最新ユーザー指示 > 承認済み決定 > docsの対象仕様 > タスク。2026-10-21に実装・ローカル検証・GitHub反映が許可された。以前の設計のみという制限は終了。本番公開・サービス接続・課金は別承認。

AGENTS → AI_WORK_STATE → NEXT_WORK → TASKSと対象設計を読む。開始時にWork Unit、変更対象、検証、承認ゲートを短く宣言。完了・未検証・次作業を正本へ記録する。GeminiなどのAI協働者はGEMINI.mdを入口として読む。内容が異なる場合はAGENTS.mdを優先する。

## 実装・データ

- React/Vite/TypeScript strict、MapLibre GL JS＋OpenFreeMap、Upstash Redis、Vercel Functionsを使用。地図スタイルは道路レイヤーだけを残す。写真管理・解析SDKは追加しない。
- CSS Modules、共通トークン、純粋検索関数、境界検証を維持する。重複・過剰な抽象化を避ける。
- unknownや期限切れを無料・設備あり・利用可としない。区画の利用条件を施設全体から推測しない。
- 本番データは出典・確認日・権利・場所・利用条件を確認する。fixtureはtestsだけ。Redisへの合成データ混入を拒否する。
- Googleの写真・口コミ・施設情報を無断取得しない。Maps URLsは外部リンクだけ。
- GPSは許可時のメモリだけ。URL、ログ、ストレージ、外部経路のoriginへ書かない。
- `npm run check` と本番ビルド対象のE2Eを実行。環境制約はBLOCKED/NOT_RUNとして記録し、成功と書かない。
- 依存は安定版・互換性・ライセンスを確認しexact固定。秘密情報やimportsのCSVをCommitしない。

## GitHub・引継ぎ

読み取りはGitHub、書き込みは書き込み可能なGitHubプラグインを優先。head SHA確認 → tree/commit → expected_sha付きforce=falseのref更新 → 再取得検証。競合は取得し直して解消する。複数AIが同時作業する間は同一ファイルを並行編集しない。独立作業は`gemini/<topic>`など専用ブランチとPull Requestを使い、force pushしない。

公開、Repository公開化、Paid化、新サービス接続を無断で行わない。可逆な実装・テスト・文書更新は継続する。

2026-10-24：ユーザーがVercelでの公開を指定。Vercel Hobbyでの静的公開を進める。公開意向を再質問しない。アカウント接続・Hobby/個人非商用条件を確認し、有料変更・不要な全Repositoryアクセスは追加しない。

TASKS、NEXT_WORK、AI_WORK_STATEに検証済み範囲と未完了を残し、`/continue suzaking/lespot` で復元可能にする。

進捗の確認・表示を頼まれたら、毎回`TASKS.md`と`NEXT_WORK.md`を直接読み、必要に応じて`AI_WORK_STATE.md`も参照して回答する。これらは正本として保ち、進捗を表示するためだけに変更したり、`TASKLIST.md`などの別コピーを作成・維持したりしない。このルールはGemini／Google AIなど他の協働AIにも適用する。

## UI設計の正本（2026-10-24更新）

デザイン、レイアウト、インタラクションはリポジトリ直下の`design.md`を正本とする。地図は道路中心のラベル・施設記号なし表示。GPSは許可制・非永続化。施設の唯一の正本はUpstash Redisとし、更新時にDBを初期スナップショットで上書きしない。管理APIの認証・入力検証を維持する。

