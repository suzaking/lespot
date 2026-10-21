# 作業状態 — 2026-10-22

対象：Shota-Zaki/lespot / main。2026-10-21実装指示で設計のみ制限を解除。本番公開・新サービス接続・課金は未承認。

## 実装済み

React/Vite/TS strict、CSS Modules/トークン、地図/一覧・検索/距離/料金/カテゴリ、現在地と地域代替、外部Mapsリンク。GPSはメモリのみ、origin送信なし。

Leaflet遅延読込、地図縮退、JSON検証・再試行、非公開Sheets→CSV→検証→JSON生成。失敗時の正常版保持、fixture拒否、座標/重複/日付/出典検証を実装。

旧設計を現行C4/データ/UX/運用/選定文書へ置換。履歴はGitに残す。npm run check全工程とVitest31件通過。最終結果はdocs/VERIFICATION参照。

## 未完了・制約

公開JSONは0件。実施設候補2件は正確な区画座標・条件・権利確認が残る。

Playwright4ケースはブラウザ不在で起動前失敗。ダウンロードは不正ZIPで失敗。dev画面のクラウドブラウザ確認を本番相当E2E合格とは扱わない。

iOS/Android実機・外部地図アプリ起動・実地確認・Pages設定/配信は未実施。Actionsは無料残量未確認のためopsテンプレートのみ。Sheets直接接続も未設定。

## GitHub

基点c4cf108e58984dcc8199f7deb83ab25e8b5fc9f6。既存main直接Commit方針を維持し、実装と検証記録を同一Commitへ格納する。SHAはこのファイルを含むGit履歴を参照。反映後はGitHubから対象ファイル/差分を再取得する。

次：NEXT_WORKのI-09 → I-08。全体完成・本番公開完了とはしていない。
