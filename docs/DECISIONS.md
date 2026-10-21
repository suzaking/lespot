# 決定記録 — 2026-10-21

| ID / 状態                       | 判断・理由                                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| D-21 USER_CONFIRMED             | ユーザーの実装指示により設計のみ制限を解除。ローカル実装/テスト/文書/GitHub反映を実施              |
| D-22 USER_CONFIRMED             | 無料・管理負担・スマホUX優先。写真、独自バックエンド/DB、従量APIを設けない                         |
| D-23 USER_CONFIRMED             | 地図と一覧の連動を必須化。旧一覧のみMVP0はSUPERSEDED                                               |
| D-24 PROPOSED_DEFAULT（実装済） | React/Vite/TS＋Leaflet直接統合＋Zod。React Leafletの追加peer依存は避け、地図の責務を1部品へ隔離    |
| D-25 PROPOSED_DEFAULT（実装済） | Sheets編集→CSV取込→検証済JSON。新規接続なしでも運用できる                                          |
| D-26 PROPOSED_DEFAULT（実装済） | native input/selectと小規模CSS Modules。Radix等の複雑なUI機能は不要                                |
| D-27 PROPOSED_DEFAULT（実装済） | GPSをメモリ保持、外部originなし。地図は操作後にロード                                              |
| D-28 OPEN                       | 実施設の入口/区画座標・利用条件・権利確認。本番JSONは0件。候補のみDATA_CANDIDATESに記録            |
| D-29 OPEN                       | Pages Free実設定・残量、公開URL、運営窓口、本番公開承認。デプロイしていない                        |
| D-30 OPEN                       | ローカルPlaywrightブラウザ導入が環境制約で失敗。本番相当E2EとiOS/Android実機は未完了               |
| D-31 SUPERSEDED                 | 旧写真/R2/D1/Worker API・高度な時間/価格推定・SvelteKit設計は現行ファイルから置換。履歴はGitに保持 |

main直接Commitは既存AGENTSの方針を維持。Repository公開化・ライセンスの一括付与はしない。Web Parts Libraryは所有者と限定MIT-0範囲を確認したが、Astro/Recipe境界の移植コストと本体権利留保を踏まえコードをコピーしていない。
