# 次の作業

## 現在の到達点

要件・設計・実装タスクを文書化した。アプリ本体、依存関係、DB、CLI、実スポットデータ、写真、インフラ、公開URLは未作成。設計者の技術推奨は承認済みではない。実際のGitHub反映検証は `AI_WORK_STATE.md` を確認する。

## WU-01：実装基盤の確立（次回の実装依頼後）

対象タスク：T-001 → T-002。成果は「fresh cloneからlocal起動・型検査・buildできる最小プロジェクト」。検索・地図・施設登録を同時に実装しない。

### 入力

`AGENTS.md`、`AI_WORK_STATE.md`、`TASKS.md` のT-001/002、`docs/ARCHITECTURE.md` 第1〜3節、`docs/OPERATIONS.md` 第1〜3節、`docs/DECISIONS.md`。必要になるまで全設計書を読み込まない。

### 手順

1. Repository・mainの先頭SHA・既存ファイル・作業ツリーを確認する。別チャットの作業を上書きしない。ユーザーが新たにブランチを指定した場合は従う。
2. O-01の採用方針と後続指示を確認。未承認は暫定のまま、公式安定版とCloudflare adapterの互換性・binding型生成手順を調べ、実装で使用するversionを固定する。
3. SvelteKit/TypeScript strictの最小構成、local環境、lockfile、secret除外を作る。Cloudflare bindingはserverモジュールに隔離する。
4. package scriptsでformat/lint/check/test/buildの責務を定義する。CI本体はT-003へ分け、まずlocalのtypecheck/buildと最小smokeを実行する。
5. READMEに実行済みの起動手順、必要ツールversion、未実装範囲を追記する。Windowsでの手順も確認し、未確認なら明示する。
6. 差分をレビューしてCommitし、GitHubから再取得。T-001/T-002と検証状態を更新し、次はT-003/T-004を準備する。

### 変更予定範囲

package manifest/lockfile、SvelteKit/Vite/TypeScript/Cloudflare設定、最小src、secret除外・sample設定、README、決定・検証・状態記録。確定パスは採用版の公式雛形に合わせる。

### 完了条件

再現可能なlocal起動、型検査・buildの実結果、SSR時のブラウザAPI参照なし、秘密・本番IDの混入なし、アプリ未実装範囲の明記、GitHub read-back。動作していない雛形を「実装基盤完成」としない。

### このWUで行わないこと

有料契約、R2有効化・支払設定、本番リソース作成、外部公開、実施設情報の収集・転載、Google Places呼出、投稿/認証機能、ブランドデザインの確定。

## 停止・継続条件

重大な依存互換性問題は代替版・公式対応策を検証し、理由を記録する。費用・公開・実データ権利が未確定でも、fixture・schema・純粋関数など独立したlocalタスクまで停止しない。承認が必要な操作だけを保留する。

今回の依頼は設計のみなので、この文書があることを実装開始の許可とは解釈しない。再開指示で実装が求められた場合に上記WUを実行する。

## 再開の入口

```text
/continue Shota-Zaki/lespot
```

Repositoryの正本から現状を復元し、今回の依頼範囲と新しい指示を照合する。確定済みのサービス方針を再質問せず、提案の承認状態や実行していない試験を推測しない。
