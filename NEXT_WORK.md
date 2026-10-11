# 次の作業 — React＋Vite / C4 v1.1

更新：2026-10-11。C4モデルのHTML出力依頼に対応。今回もアプリ本体は未実装・未公開。

## 最初に読む正本

AGENTS.md → AI_WORK_STATE.md → 本書 → docs/DECISIONS.mdの最新追記 → docs/ARCHITECTURE.md v1.1の第1・8・9・10節 → TASKS.mdの対象タスク。

SvelteKit採用案はReact＋Vite方針に置換された。R2はMVP必須から外し、D1 Free＋Static Assets画像ゲートを推奨する。旧詳細文書のSvelteKit/R2の文言をそのままコード化しない。適用範囲の正本はARCHITECTURE第10節。

## WU-01：実装基盤（次の実装依頼後）

対象：T-001 → T-002。今回の「C4モデルでHTML出力」はアプリ実装開始の許可ではない。

1. mainの先頭、作業ツリー、他エージェントの変更を確認する。指定がなければmainの既存運用を維持する。
2. ARCHITECTURE第10節に基づき、T-001/T-002、AGENTSのフレームワーク注意、対象の詳細設計・運用記述をReact/Viteへ展開してCommitする。画像実装時は対応するR2記述をStatic Assetsへ展開する。全40タスクを完了扱いにしない。
3. React、Vite、TypeScript、ルーター、Cloudflareツールの公式安定版と互換性を確認し、lockする。最近使ったからという理由で別構成へ変更しない。
4. 最小SPA、独立Worker、共有型、secret除外、local設定を作る。本番の秘密・アカウントIDをブラウザへ渡さない。
5. ローカル起動、型検査、build、簡単なルーティング・Worker smokeを実行。Windows手順を確認し、未検証の端末をPASSにしない。
6. READMEに実在するコマンドだけを追記し、差分・CommitをGitHubから再取得。実装完了と検証状態を更新する。

### 完了条件

fresh cloneからlocal起動・型検査・buildが再現可能。UIとAPIの境界が明確。SvelteKit固有設定なし。秘密のクライアント配信なし。GitHub read-back済み。次はT-003/T-004。

### このWUで行わないこと

R2契約、Paidへの移行、新規有料ドメイン購入、有料監視、production公開、実施設データの転載、投稿・認証機能。本番配置は実アカウントがFreeであることと既存使用量を確認してから。既存Paidアカウントを勝手にダウングレードしない。

## 後続の重点検証

画像ゲートの直接URL・パス正規化・HEAD・D1不通・Free quota超過、preview URL無効化、静的資産先行配備、active版との画像整合、取り下げ後のrollback。CSRだけで非JavaScript代替を消さず、公開版に対応する静的fallbackを同じゲートから配信する。実装はARCHITECTURE第8節に従う。

## 再開

`/continue Shota-Zaki/lespot`

React＋Viteの進行指示を再質問しない。ただし課金・契約・公開・運営連絡先・実データ目標の承認まで取得済みとは解釈しない。
