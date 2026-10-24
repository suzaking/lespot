# LeSpot 実装タスク

更新：2026-10-24。旧タスクはGit履歴へ保存。ローカル実装・公開・実機は別管理。

| ID   | 作業                                     | 状態                                      |
| ---- | ---------------------------------------- | ----------------------------------------- |
| I-01 | 既存資産・OSS・無料構成選定              | DONE                                      |
| I-02 | React/Vite/TS strict・CSS・テスト基盤    | DONE                                      |
| I-03 | 現在地・地域・検索・距離・料金/カテゴリ  | DONE                                      |
| I-04 | 地図/一覧連動・Mapsリンク・縮退          | DONE：本番E2E確認                         |
| I-05 | CSV検証・JSON生成・Sheets手順・CSV書出し | DONE                                      |
| I-06 | 型/Lint/整形/Vitest/build                | DONE：35件成功                            |
| I-07 | C4・設計・運用・決定記録更新             | DONE                                      |
| I-08 | 実施設データ登録                         | DONE：2件、DATA_EVIDENCE参照              |
| I-09 | 本番ビルドE2E                            | DONE：PC/390px/320px、9件成功             |
| I-10 | Vercel Hobby設定・公開                   | DONE：2026-10-24 READY / HTTP 200、本番URL確認 |
| I-11 | 実iOS/Android・実GPS・読み上げ・現地検証 | NOT_RUN：端末/現地アクセスなし            |

次はNEXT_WORK参照。ローカル実装完了。本番公開や実機試験まで完了したとはしない。


## 2026-10-24 本番公開実績

- Vercel Hobby `zaki-7fc3/lespot`、production deployment `dpl_9Sr1p4Z7nm76auqECaPtHnaBU5ZQ`、Commit `1cc5f7ebbe1a271f54b9c8513ee9fa9b6e68bd4d`、READY。
- https://lespot-lac.vercel.app/ と `/spots.json` はともにHTTP 200。公開JSON2件、CSP・Permissions-Policy・Referrer-Policy・nosniff・Cache-Controlを確認。
- Vercelで型・Lint・整形（vercel.jsonは除外）・Vitest35件・公開データ2件・Vite build成功。実iOS/Android・本番ブラウザE2Eは未実施。
- Vercel Blob (`lespot-content`) は作成・環境変数接続済み。ただし静的アプリ本体からの利用は未実装。Upstash integrationはインストール済みだがRedisの接続変数なし、DB作成/実利用は未確認。
