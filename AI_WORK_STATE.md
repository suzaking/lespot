# 作業状態 — 2026-10-22

対象：Shota-Zaki/lespot / main。ローカル実装・検証・GitHub反映は許可済み。本番公開・新サービス接続・課金は別承認。

## 完了

React/Vite/TS strict・CSS Modules・トークン、地図/一覧連動、現在地と地域代替、距離順・名称/カテゴリ/料金/距離絞込、Google詳細/徒歩/Street View/Appleリンク。GPSは許可時メモリのみ、外部origin送信なし。

Leaflet遅延読込、地図縮退、JSON境界検証・再試行。非公開Sheets→CSV→検証済みJSON手順、失敗時の正常版保持、CSV書出しによる編集開始を実装。

公式案内と愛知県の再利用可能な座標を照合し実施設2件を登録。施設代表位置と個別席の違いを画面・データ・DATA_EVIDENCEに明記。写真・口コミは取得保存していない。

35件Vitest、型/Lint/整形/build、3幅×3件の本番E2E9件、release:check成功。E2Eで発見した範囲外ピンと読み上げ名を修正。標準ブラウザ配布ZIP失敗を検証専用Chromium153で解決。環境・制約はVERIFICATION参照。

## 残作業

ローカルWebアプリの実装・自動検証は完了。本番公開は未実施。Pages設定/無料条件/公開URL/運営窓口とユーザー承認が必要。Sheets直接同期は不要でCSV代替運用可能。Actionsは無料条件未確認のためopsテンプレートのみ。

実iOS/Android端末・実GPS・外部アプリ起動・読み上げ・現地確認は未実施。必要なアカウント・端末がない状態を成功にしない。

## GitHub・再開

基点：5edc482332f54e151e572de3c10727c48e746c87。main直接Commit方針。今回のSHAは本ファイルを含む履歴で確認し、反映後にGitHubから再取得検証する。

次：NEXT_WORKの公開ゲート確認。/continue Shota-Zaki/lespot で復元する。承認済みの技術選定・CSV代替を再質問しない。
