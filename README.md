# LeSpot

**公開URL：** [LeSpotを開く](https://lespot-lac.vercel.app/)

名古屋周辺の休憩スポットを地図から探すWebアプリです。
施設情報は**Upstash Redis**で管理し、CSVを介さず管理画面で編集できます。
閲覧は無料です。写真、口コミ、利用者アカウントはありません。

## 画面

- **地図がメイン：** ページを開くとLeaflet＋国土地理院の標準地図を表示します。右下の切替ボタンで淡色地図にも変更できます。
- **PC：** 全画面の地図上に、必要時だけ検索結果と地点詳細のフローティングパネル。
- **スマートフォン：** 常時表示は検索バーと小さな操作ボタンだけ。検索結果・地点詳細は必要時に下部シートで表示。
- **検索：** 地域、現在地（許可制）、名称、カテゴリ、料金、半径を指定。
- **スポット選択：** 地図マーカーと一覧を連動。地図アプリ・徒歩ルートへ遷移。

画面デザインの正本は[design.md](design.md)です。

## 施設情報のDB管理

- 管理画面：**https://lespot-lac.vercel.app/admin.html**
- 一般公開API：`GET /api/spots`
- 管理API：`GET /api/admin/spots`、`PUT /api/admin/spots`（認証必須）
- DB：Upstash Redis。初回空DBには確認済み2件を1回だけ初期登録。
- 管理画面で新規登録・編集・削除。保存後はDBからデータを取得します。
- 編集前にJSONバックアップをダウンロードできます。

管理画面のキーはVercelの環境変数`LESPOT_ADMIN_TOKEN`で設定します。
キーはGitHub、画面ソース、ブラウザの永続ストレージに保存しません。
利用手順と復旧方法は[DB運用](docs/DB_OPERATIONS.md)にあります。

Vercel Blobは接続済みですが、施設のテキスト情報はRedisだけに保存します。
将来画像などのファイル保存が必要になった場合に使用します。

## 開発・検証

Node.js 24、React 19、Vite 8、TypeScript strict、CSS Modules、
Leaflet、Zodを使用します。依存は`package-lock.json`で固定。

```bash
npm ci
npm run dev
npm run check
npm run release:check
```

ローカルのVite開発サーバーだけではVercel Functionsが起動しません。
実DBを使う場合はVercelの開発環境を使ってください。
`npm run check`は型・Lint・整形・単体テスト・ビルド、
`npm run release:check`はブラウザE2Eも実行します。

## 運用上の制約

- 施設位置は代表座標です。入口・席・空席や営業時間を保証しません。
- 利用条件と出典を確認したスポットだけを掲載します。
- 現在地は利用者操作で許可されたときだけ取得し、DBに保存しません。
- 地図タイル表示時は国土地理院にIPアドレスと表示範囲が伝わります。
- Vercel Hobbyの個人・非商用条件と無料枠を守ります。有料化は行いません。

[DB運用](docs/DB_OPERATIONS.md) /
[検証結果](docs/VERIFICATION.md) /
[データ根拠](docs/DATA_EVIDENCE.md) /
[アーキテクチャ](docs/ARCHITECTURE.md) /
[次の作業](NEXT_WORK.md)

## 地図操作（2026-10-24更新）

地図のパン・ズーム後は「このエリアを検索」で可視範囲の登録スポットを絞り込めます。検索入力からDB登録済み施設の候補を選ぶと、その場所へ地図を移動して詳細を表示します。モバイルでは検索結果を上下ドラッグして拡大・縮小できます。Googleマップの操作モデルを参考にしたUIであり、Googleの地図データ・口コミ・交通/経路APIを複製したものではありません。
