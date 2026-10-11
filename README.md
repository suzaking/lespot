# LeSpot

> **現在の最小公開版（2026-10-11）：** 写真なし。React＋Viteの静的なスポット一覧で場所を表示し、Googleマップの施設検索・周辺ストリートビュー・徒歩経路、Appleマップへ外部遷移する。DB/APIを初期要件にしない。**[現行MVP0仕様](docs/FREE_MVP_STRATEGY.md)** ／ [新C4設計](docs/ARCHITECTURE.md) ／ [現行タスク](TASKS.md)。以下の旧写真・詳細機能一覧は履歴であり、初期公開の必須ではない。

外出先で「少し休みたい」ときに、休憩するための条件から場所を探す地図型Webサービス。

## 現在の状態

- 対象：`Shota-Zaki/lespot`、既定ブランチ：`main`。
- 今回の成果物は要件定義・基本設計・詳細設計・実装タスク。**アプリ本体は未実装・未公開**。
- 設計基準日：2026-10-11。設計者の推奨案は、ユーザー承認済みの決定とは区別する。
- 完了・検証の正本は [AI_WORK_STATE.md](AI_WORK_STATE.md)。承認状態は [docs/DECISIONS.md](docs/DECISIONS.md)。

## サービスの範囲

初期対象は名古屋市の栄・久屋大通・矢場町周辺。無料のベンチや公共施設から、カフェ、仮眠施設、ホテルのデイユースまでを「休憩場所」として扱う。施設カテゴリだけではなく、料金、距離、屋内外、営業時間、座席、設備、利用条件を比較できることを目指す。

MVPは現在地取得、地図と一覧、条件検索、距離順、詳細、料金・営業時間・設備・写真、外部地図への経路案内。ユーザー投稿、口コミ、お気に入り、混雑情報、アプリ内の情報修正依頼は将来機能。AIは開発手段であり、製品への搭載要件ではない。

## 設計書の入口

| 正本 | 責務 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 作業ルール、正本の読み方、変更・検証・引継ぎ |
| [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) | 目的、スコープ、機能・非機能要件、成功基準 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 構成、技術選定、境界、拡張方針 |
| [docs/DETAILED_DESIGN.md](docs/DETAILED_DESIGN.md) | 検索、料金、営業時間、状態遷移、モジュール契約 |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | ER図、テーブル・フィールド・列挙値の正本 |
| [docs/API.md](docs/API.md) | HTTP契約、DTO、エラー、キャッシュ |
| [docs/UI_UX.md](docs/UI_UX.md) | 画面、導線、ワイヤーフレーム、アクセシビリティ |
| [docs/DATA_OPERATIONS.md](docs/DATA_OPERATIONS.md) | データ収集、出典、写真、審査、更新・公開 |
| [docs/OPERATIONS.md](docs/OPERATIONS.md) | 環境、認証・権限、セキュリティ、運用・復旧 |
| [docs/RESEARCH_AND_COSTS.md](docs/RESEARCH_AND_COSTS.md) | 公式調査、利用条件、比較、費用・試算 |
| [docs/TEST_PLAN.md](docs/TEST_PLAN.md) | 検証項目、要件との対応、公開判定 |
| [docs/DECISIONS.md](docs/DECISIONS.md) | 確定事項、暫定推奨、未決事項 |
| [TASKS.md](TASKS.md) | 依存関係付きの実装タスク・完了条件 |
| [NEXT_WORK.md](NEXT_WORK.md) | 次のWork Unitと停止条件 |
| [AI_WORK_STATE.md](AI_WORK_STATE.md) | 実施済み作業と実際の検証状態 |

## 再開

`/continue Shota-Zaki/lespot` を入口とし、`AGENTS.md` → `AI_WORK_STATE.md` → `NEXT_WORK.md` → 対象タスクと必要な設計書だけを読む。

設計書に将来のコマンドやパスがあっても、その実装が存在することを意味しない。設計の作成、承認、実装、ビルド・試験、実データ確認、公開は別々の状態として扱う。
