# テスト方針

| 層                        | 検証内容                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------- |
| TypeScript                | strict、未使用、配列境界、全src/scripts/tests                                      |
| ESLint / Prettier         | TSとHooksの静的解析、整形統一                                                      |
| Vitest core               | Haversine既知値、距離境界/同距離順、AND検索、無料/不明/期限切れ、URL構築           |
| Vitest boundary           | JSON未知版/重複/座標逆転/不正URL/日付/fixture/非公開拒否、CSV引用符/BOM/非公開除外 |
| Vitest React              | フィルター操作、リセット、0件、GPS拒否、読込失敗→再試行                            |
| CLI                       | 不正CSVで前回JSONが変化しないこと                                                  |
| Playwright desktop/mobile | 本番previewの検索→カード→地図ピン→一覧、外部リンク、拒否、再試行、キーボード、axe  |
| ブラウザ                  | 320/390px・PCの視覚確認、タイル表示、リンク・focus                                 |
| 公開前実機                | iOS Safari/Android Chromeの実GPS/外部アプリ、読み上げ、施設位置照合                |

Playwrightのネットワークfixtureはtestsからの合成データのみ。本番public/へコピーしない。テスト合格は施設情報の真偽やStreet View撮影範囲を証明しない。

`npm run check` はE2Eを含まない。`npm run release:check` は実データ0件/期限切れを拒否した後、checkとE2Eを順に実行する。実績はVERIFICATION。
