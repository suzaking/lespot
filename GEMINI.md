# Gemini・AI共同作業ガイド

このファイルはGemini CLIなどの協働AI向けの入口です。共通ルールの正本は[AGENTS.md](AGENTS.md)です。両者の内容が食い違う場合はAGENTS.mdを優先してください。

## 作業を始める順番

1. `AGENTS.md`でRepository・Branch・データ保護・公開ルールを確認する。
2. `AI_WORK_STATE.md`、`NEXT_WORK.md`、`TASKS.md`で最新の進捗と未完了事項を読む。
3. UI・操作の正本である`design.md`と[docs一覧](docs/README.md)を確認し、担当範囲の設計書・コード・テストを読む。
4. 最新のmain SHAと作業中の差分を確認してから、担当Work Unitの変更範囲を決める。

## 協働の進め方

- 同時に作業するAI同士で変更対象ファイルを分け、同じファイルの同時編集を避ける。
- 作業が独立している場合は`gemini/<topic>`のような専用ブランチに変更をまとめ、Pull Requestでレビューする。mainへforce pushしない。
- Work Unitを小さく保ち、コード・テスト・必要な設計書を同じ変更として提出する。無関係な整形や大規模な再構成を混ぜない。
- 競合やmainの更新があれば最新状態を取得してから解決する。先行変更を黙って上書きしない。

## LeSpot固有の注意

- 本番施設データの唯一の正本はUpstash Redis。bootstrap JSONは空DBの初期投入専用で、既存DBへ自動反映されない。
- 公開施設データは出典、位置、利用条件、権利を確認し、未確認の料金・設備・営業時間・空席は断定しない。写真や口コミを収集・転載しない。
- MapLibre GL JS＋OpenFreeMapを使用し、道路レイヤーだけを残す。APIキー・アカウント・課金は不要。地図APIや費用条件を変える場合は公式条件を再確認する。
- GPSは利用者が明示的に許可した時だけ取得し、永続保存しない。秘密情報をチャット、URL、Repositoryに書かない。
- 本番公開やRedis変更は、ユーザーが明確に依頼した範囲だけで行う。現在の設計・操作の正本は`design.md`と[docs一覧](docs/README.md)。

## 検証と引継ぎ

Node.js 24を使用し、通常は次を実行する。

```sh
npm ci
npm run check
npm run test:e2e
```

変更範囲と実行環境に応じて`npm run release:check`も実施する。未実施のテストは未実施と記録する。

作業後は`TASKS.md`、`NEXT_WORK.md`、`AI_WORK_STATE.md`に完了・未完了・次のWork Unit・検証結果を反映する。最終報告にはCommit/PRとテスト結果を含める。
