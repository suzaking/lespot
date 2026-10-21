# 検証記録

実施：2026-10-21〜22。Node24.19.0、固定依存、ローカル実装。実データ・公開環境の検証とは別。

## 実行済み

- TypeScript strict型検査：成功。
- ESLint：成功。地図effect cleanupのref警告を修正。
- Vitest：共通関数/入力検証/React操作/CSV失敗時の旧JSON保持/地図ピンのクリック・Space・選択状態の31件成功（4ファイル）。
- `npm run check`：型検査→ESLint→Prettier→31テスト→JSON検証→本番buildの全工程成功。
- `npm ci --no-audit --no-fund` で246パッケージを再インストールし、続く本番buildも成功。ロックファイルから再現確認済み。
- Vite本番build：成功。初回JSは約322KB（gzip約99.7KB）、地図JSは約151KB（gzip約44.6KB）。地図CSSも別chunk。地図は明示操作後だけ読込。値は実行時出力の丸め値。
- クラウドChrome/dev：実際の地理院タイル表示、地域切替、PCの地図と一覧の横並びを確認。
- 合成データ3件の検証画面：PCでピン2選択→カード2へfocus/選択、カード1選択→ピン1強調の双方向連動を確認。
- 390px/320px iframe表示を目視確認。390px料金freeで3件→1件、地図切替。axe-core初期一覧画面は両幅とも指摘0件。iOS Safariそのものの検証ではない。
- 外部リンクはURL構造・固定ホスト・座標・origin省略をテスト。実アプリ起動やGoogle検索の正しい施設解決は未検証。

## BLOCKED / NOT_RUN

- Playwrightはdesktop/mobile各2ケースの計4ケースを実行したが、全てブラウザ起動前に失敗。実行ファイル不在。`playwright install chromium` はダウンロードが不正ZIPとなり導入失敗。アプリのE2E合格ではない。
- 本番distのE2E、実iOS/Android、実GPS、スクリーンリーダー、現地位置照合、Cloudflareヘッダー/配信/復旧は未検証。
- 本番施設0件のためrelease:checkは公開準備不足として拒否する設計。

## 再現

`npm ci` → `npm run check` → ブラウザ導入済み環境で `npm run test:e2e`。

クラウド検証用qaページは一時ファイルで、Commit/本番buildに含めない。testsのfixtureは公開JSONへ入れない。テストは施設情報の真偽を証明しない。
