# データ運用

2026-10-24からLeSpotは**CSV管理を廃止し、Upstash Redisを正本**とします。

現行の管理・バックアップ・復旧手順は
[DB_OPERATIONS.md](DB_OPERATIONS.md)に移動しました。

初期移行用スナップショットは`data/bootstrap-spots.json`です。
`public/spots.json`は公開配信から削除済みで、実際のスポットは
`GET /api/spots`経由でRedisから取得します。

以前のSheets / CSV運用手順はGit履歴に残しています。
旧`scripts/csv.ts`などは互換・移行時の補助コードであり、
本番DBの更新経路ではありません。
