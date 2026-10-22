# 決定記録 — 2026-10-21

| ID / 状態                       | 判断・理由                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| D-21 USER_CONFIRMED             | ユーザーの実装指示により設計のみ制限を解除。ローカル実装/テスト/文書/GitHub反映を実施                |
| D-22 USER_CONFIRMED             | 無料・管理負担・スマホUX優先。写真、独自バックエンド/DB、従量APIを設けない                           |
| D-23 USER_CONFIRMED             | 地図と一覧の連動を必須化。旧一覧のみMVP0はSUPERSEDED                                                 |
| D-24 PROPOSED_DEFAULT（実装済） | React/Vite/TS＋Leaflet直接統合＋Zod。React Leafletの追加peer依存は避け、地図の責務を1部品へ隔離      |
| D-25 PROPOSED_DEFAULT（実装済） | Sheets編集→CSV取込→検証済JSON。新規接続なしでも運用できる                                            |
| D-26 PROPOSED_DEFAULT（実装済） | native input/selectと小規模CSS Modules。Radix等の複雑なUI機能は不要                                  |
| D-27 PROPOSED_DEFAULT（実装済） | GPSをメモリ保持、外部originなし。地図は操作後にロード                                                |
| D-28 IMPLEMENTED                | 再利用可能な愛知県位置データと公式条件を照合し実施設2件登録。代表位置の限界を表示。DATA_EVIDENCE参照 |
| D-29 OPEN                       | Pages Free実設定・残量、公開URL、運営窓口、本番公開承認。デプロイしていない                          |
| D-30 VERIFIED / DEVICE_OPEN     | 本番ビルドE2E9件成功。標準配布ZIP失敗のため検証専用Chromium153を使用。実iOS/Androidは未検証          |
| D-31 SUPERSEDED                 | 旧写真/R2/D1/Worker API・高度な時間/価格推定・SvelteKit設計は現行ファイルから置換。履歴はGitに保持   |

main直接Commitは既存AGENTSの方針を維持。Repository公開化・ライセンスの一括付与はしない。Web Parts Libraryは所有者と限定MIT-0範囲を確認したが、Astro/Recipe境界の移植コストと本体権利留保を踏まえコードをコピーしていない。

2026-10-22追記：地図は検索起点と結果のboundsに余白をつけて収める。固定zoomでは実施設ピンが表示範囲外となるE2E不具合を修正。ピンの読み上げ名には見えている番号も含め、axeで見つかったラベル不一致を解消。CSV書出しは既存スキーマ・列定義を再利用し、編集開始時の手入力を減らす。追加の本番依存はない。検証用ブラウザはRepository/配信物に含めない。
