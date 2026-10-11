# AI_WORK_STATE — 2026-10-11 最新方針

**写真の運用をしないこと、無料優先、外部Googleマップ詳細の許容をユーザーが指定。** React/Viteを維持し、Cloudflare Pages Free/静的JSON/Maps URLsを現在の初期案とした。新C4アーキテクチャはdocs/ARCHITECTURE.md、スコープはdocs/FREE_MVP_STRATEGY.md、タスクはTASKS.md先頭のF-001〜F-010。

旧写真・D1・Worker APIの詳細書は初期版に適用しないと明示した。外部Maps URLsのAPIキー不要性、Cloudflare Pages静的配信の無料条件、自治体CC BY/OSM ODbLを公式情報で調査。アプリ実装・実施設登録・実機でのリンク先照合・クラウド契約/配信・build/testはNOT_RUN。C4の新HTMLはチャットで別成果物として生成し、ブラウザの表示・リンク・ズームの技術検査を実施したが、HTMLをGitHubにCommitしたわけではない。

次WUはNEXT_WORK.mdのF-001→F-002。課金/外部公開の承認は取得していない。

---

## 以前の設計作業履歴

# LeSpot 作業・検証状態

更新：2026-10-11。対象：Shota-Zaki/lespot / main。

## 現在の作業

追加依頼：React＋Viteを基準とし、C4モデルのHTMLを出力する。アプリ本体の実装・クラウド資源作成・課金・公開は今回も行っていない。

## 成果

- C4 HTMLの説明用出力を作成。C1 System Context、C2 Container、C3 Webアプリ、C3 公開API、C4 検索ドメインの5図。C4は設計案で、既存実装の解析ではない。
- ARCHITECTURE.mdをv1.1に更新。React/Vite/独立Worker、D1 Free、Static Assets画像ゲート、公開順序、無料枠を明記。
- DECISIONS.mdにReact方針と無料条件を記録。SvelteKit一式案はSUPERSEDED。D1/静的画像ゲートの具体方式はPROPOSED_DEFAULTのまま。
- NEXT_WORK.mdをReact基準のWU-01へ更新。旧SvelteKitの再質問・雛形作成を防止。

## HTMLの実施済み検証

ローカルChromium（/usr/bin/chromium）にHTML文字列を読み込ませて検証した。通常のPlaywright付属ブラウザは未配置のためシステムChromiumを使用。環境側のfile URL制限により、file://直接起動試験ではなくpage.set_contentによる描画確認。

| 項目 | 結果 |
| --- | --- |
| 1440px幅のデスクトップ表示 | 描画・スクリーンショット確認 |
| 390px幅のスマートフォン相当表示 | ページ全体の横はみ出しなし。図は局所スクロール |
| 5図のノード内文字 | bounding boxによる文字はみ出し0 |
| JavaScriptエラー | 最終検査0 |
| 外部リソース要求 | 0。HTML/SVG/CSS/JSを内包 |
| 重複ID・存在しない内部リンク | 0 |
| 図の拡大・全体表示 | 125%への変更とリセットを確認 |
| 章ナビゲーション | #costへの移動を確認 |
| 印刷用CSS | サイドバー非表示を確認。印刷・PDF生成は未実施 |

HTMLの確認はLeSpot本体のbuild/testやクラウドの検証ではない。iOS/Android実機・アクセシビリティ適合全体・スクリーンリーダーは未検証。

## 正本への変更適用状況

構成・境界・旧方式の置換規則の正本はARCHITECTURE v1.1。旧詳細設計、DATA_MODEL、API、DATA_OPERATIONS、OPERATIONS、TEST_PLAN、TASKSにはSvelteKit/R2由来の記述が残る。ARCHITECTURE第10節で対象と置換内容を明示した。全ファイルを逐語的に移行した扱いにはしない。

次の実装Work Unitでは、対象タスク行・詳細文書を第10節で展開・更新してからコード化する。40実装タスクは引き続き全てTODO。サービス要件と計算規則は維持し、移行を理由に省略しない。

## 公式確認と未確認

C4公式、React公式、CloudflareのReact/Vite・Workers・D1・Static Assets・R2契約、地理院タイル、Maps URLs等を確認。URLと適用条件はARCHITECTURE第12節、HTML出典欄。

実アカウントのFree/既存使用量、画像直アクセスの防止、D1・Workerの性能、quota障害、preview URL無効化、公開・復旧、実施設情報・写真権利は未検証。R2契約や有料サービスを有効化していない。

## 履歴と次

v1.0の設計一式と検証記録はCommit 8cb1759bbab2c01eb7f6c853d3dd9a35d899fd3fまで。今回はその状態から文書のみ更新。

次はNEXT_WORK.mdのWU-01（T-001→T-002）。新しい実装依頼後に、React/Vite互換性と最小ローカル基盤から進める。再開は `/continue Shota-Zaki/lespot`。
