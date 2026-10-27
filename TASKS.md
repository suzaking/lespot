# LeSpot 実装タスク

更新：2026-10-27。旧タスクはGit履歴へ保存。ローカル実装・公開・実機は別管理。

| ID   | 作業                                     | 状態                                           |
| ---- | ---------------------------------------- | ---------------------------------------------- |
| I-01 | 既存資産・OSS・無料構成選定              | DONE                                           |
| I-02 | React/Vite/TS strict・CSS・テスト基盤    | DONE                                           |
| I-03 | 現在地・地域・検索・距離・料金/カテゴリ  | DONE                                           |
| I-04 | 地図/一覧連動・Mapsリンク・縮退          | DONE：本番E2E確認                              |
| I-05 | CSV検証・JSON生成・Sheets手順・CSV書出し | DONE                                           |
| I-06 | 型/Lint/整形/Vitest/build                | DONE：35件成功                                 |
| I-07 | C4・設計・運用・決定記録更新             | DONE                                           |
| I-08 | 実施設データ登録                         | DONE：2件、DATA_EVIDENCE参照                   |
| I-09 | 本番ビルドE2E                            | DONE：PC/390px/320px、9件成功                  |
| I-10 | Vercel Hobby設定・公開                   | DONE：2026-10-24 READY / HTTP 200、本番URL確認 |
| I-11 | 実iOS/Android・実GPS・読み上げ・現地検証 | NOT_RUN：端末/現地アクセスなし                 |
| I-12 | 街なかのベンチ地点を追加                 | STAGED：bootstrap計5地点。公開DBへの反映待ち   |

次はNEXT_WORK参照。ローカル実装完了。本番公開や実機試験まで完了したとはしない。

## 2026-10-24 本番公開実績

- Vercel Hobby `zaki-7fc3/lespot`、production deployment `dpl_9Sr1p4Z7nm76auqECaPtHnaBU5ZQ`、Commit `1cc5f7ebbe1a271f54b9c8513ee9fa9b6e68bd4d`、READY。
- https://lespot-lac.vercel.app/ と `/spots.json` はともにHTTP 200。公開JSON2件、CSP・Permissions-Policy・Referrer-Policy・nosniff・Cache-Controlを確認。
- Vercelで型・Lint・整形（vercel.jsonは除外）・Vitest35件・公開データ2件・Vite build成功。実iOS/Android・本番ブラウザE2Eは未実施。
- Vercel Blob (`lespot-content`) は作成・環境変数接続済み。ただし静的アプリ本体からの利用は未実装。Upstash integrationはインストール済みだがRedisの接続変数なし、DB作成/実利用は未確認。

## 2026-10-24 デザインv3

- D-UI-01 DONE：参考UX調査、独自配色・タイポグラフィ・ヒーロー・ブランドヘッダーを実装。
- D-UI-02 DONE：検索フォーム再配置、3つのクイックフィルター、カード再設計、地図で見る導線とモバイルタブを実装。
- D-UI-03 DONE：Vercel `dpl_DLeiZiHAtTDyBBF3LB2eLKfCxDW6` READY。TypeScript、ESLint、Prettier、Vitest35件、JSON2件、Vite build成功。HTML/CSS/JS/JSONのHTTP 200確認。
- D-UI-04 NOT_RUN：最新版のPlaywright E2E（PC/390px/320px）、実iOS/Androidのレイアウト・GPS・地図ピン操作・スクリーンリーダー確認。

## 2026-10-24 Map-first UI再設計

- [x] `design.md`新設と他の地図アプリからのUIパターン整理
- [x] 装飾的LPを検索・地図主体の画面へ置換
- [x] PCの固定レイアウト、モバイル切替と選択地点プレビュー
- [x] 現行フィルター・出典・外部地図・位置情報保護の維持
- [x] 単体テスト36件成功、型/Lint/整形・本番ビルド成功
- [ ] 更新版Playwright E2E（PC/390px/320px）とブラウザ目視比較
- [ ] iOS/Android実機、GPS、実地図、アクセシビリティ確認

## 2026-10-24 全画面マップ化

- [x] 固定ヘッダー・白枠・常時表示の結果パネルを撤去
- [x] 地図フルブリード、フローティング検索、スポット詳細Peek/Expand、検索結果シート
- [x] 現在地・情報ボタン、外部徒歩ルートとDB検索機能を保持
- [x] Googleマップ風UXを`design.md`に定義し、Googleの商標・素材は複製しない
- [x] TypeScript/ESLint/Prettier、Vitest40件、Viteビルド、本番HTTP配信検証
- [ ] 最新版Playwright E2E・PC/スマホ実ブラウザレイアウト・操作検証

## 2026-10-26 街なかベンチ調査

- [x] OpenStreetMapの個別ベンチ地点と地図を照合し、白川公園・科学館南側の1地点を選定
- [x] 公園の所在地と一般利用原則を名古屋市公式案内で確認。ODbL帰属・未確認事項を記録
- [x] Street Viewの撮影年を確認し、現況の根拠として扱わない制約を記録
- [x] 型付きデータとしてbootstrapへ追加。料金区分はunknown、利用条件・空席・現況は未確認
- [ ] 認証付き管理画面からUpstash Redis本番データへ反映。管理キーは運営者が安全に入力する必要あり

## 2026-10-27 街なかベンチ4地点の追加調査

- 下園公園のOSMベンチ3地点と西大須公園の1地点をbootstrapへ追加。3公園で合計5地点をコード側に準備。
- OSMノードの位置・公園面を地図照合し、市公式の都市公園一覧・利用案内を確認。詳細はDATA_EVIDENCE参照。
- 料金、個別ベンチの現況、設備、空席、利用制限は未確認としてunknownを維持。
- 公開APIはUpstash Redisが唯一の正本。追加分はbootstrap stagedであり、公開APIへ登録済みとは扱わない。Redis反映と公開API再確認は管理者キーによるバックアップ後の操作待ち。

## 2026-10-27 地図種類の切替

- [x] 初期表示を地理院タイル標準地図へ変更
- [x] ボタン操作で淡色地図へ切替・標準地図へ復帰できるよう実装
- [x] GSIの2タイルのみを使用し、追加サービス・APIキー・依存を増やさない
- [x] 単体操作テストを追加
- [x] Vercel本番のnpm run check（TypeScript・ESLint・Prettier・Vitest45件・データ検証・Vite build）成功。Deployment `dpl_56pr9uXam7Z6nxBscXgaX32U8TA9` READY。
- [ ] 最新版のPlaywright E2E、実機・スクリーンリーダー・地図タイルの操作視認確認

## 2026-10-27 Geminiとの共同作業準備

- [x] Repositoryルール・設計・データ・運用文書の一覧を作成
- [x] Gemini向け入口ガイドを追加し、共通ルールと優先順位を明記
- [x] Vercelビルド整形エラーと公開データ期待値の古さを修正し、最新本番反映を確認（Commit `1c9a347`）。

## 2026-10-27 最終反映

- [x] Geminiとの共同作業ガイドと文書フォルダ索引を整備
- [x] 地図初期表示を標準地図にし、ボタンで淡色地図へ切替
- [x] Vercel本番ビルドでVitest45件、静的解析、データ検証、本番build成功を確認
- [x] 公開URLに切替済みコードの本番Aliasを確認
- [ ] Playwright E2E、実端末・実地図タイル・実GPS・スクリーンリーダー確認
