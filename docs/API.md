# 静的データ配信契約

独自APIはない。`GET /spots.json` が唯一のアプリ用データ取得。200 JSON `{schemaVersion:1, spots:[...]}` をZodで全体検証する。フィールドはDATA_MODEL参照。

非200、ネットワーク失敗、15秒timeout、不正JSON、未知版、不正データはerrorとして再試行を提供する。0件は正常データとし「掲載スポットを確認中」を表示。条件一致0件とは区別する。

同一originのみ取得。fetchはcache:no-cache、Pagesの_headersでもspots.jsonをno-cacheとする。サービスワーカーやオフラインキャッシュは設けない。以前の写真・公開Worker APIは廃止しGit履歴へ保存。
