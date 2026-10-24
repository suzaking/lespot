# Vercelでの公開・運用

2026-10-24にLeSpotをVercel Hobbyで公開。現在の接続先は非公開Repository `suzaking/lespot` の `main`。過去の文書に記載された `Shota-Zaki/lespot` とは異なり、Repo移転は利用者の明示指示がある場合だけ実施する。

## 本番環境

- URL: https://lespot-lac.vercel.app/
- Vercel Project: `zaki-7fc3/lespot` (`prj_x8SleXqg0siwHMQwPPkHfiKBaOtT`)
- Framework: React / Vite、Node.js 24.x、生成先 `dist`
- Install: `npm ci --no-audit --no-fund`
- Build: `node --import tsx scripts/prepare-release.ts && npm run check`
- 公開デプロイ: `dpl_DLeiZiHAtTDyBBF3LB2eLKfCxDW6` / READY（2026-10-24、デザインv3）
- Code Commit: `7b789fce3075d78e96df2fea742fb6c51ebcd257`
- `vercel.json` のCSP、Referrer-Policy、Permissions-Policy、nosniff、キャッシュ制御を適用。HTML、CSS、JS、公開JSONのHTTP 200を確認。
- Vercel Blobのストア `lespot-content` を作成し、`BLOB_READ_WRITE_TOKEN` が接続されている。ただし現行アプリでは未使用。Upstash Marketplaceは導入したがRedisリソースと接続変数は未確認/未使用。

## 無料運用

Vercel Hobbyは個人・非商用利用に限る。有料ドメイン・追加従量サービス・有料アップグレードは承認なく行わない。現行UIは写真・Functions・DBアクセス・解析SDK・画像最適化を必要としない。想定50人でも枠の利用量・停止リスクは継続確認する。

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/limits/fair-use-guidelines

## 更新と再デプロイ

1. ソース・施設情報を変更する前に `AGENTS.md` / `AI_WORK_STATE.md` / `NEXT_WORK.md` とGitHub最新mainを読む。
2. 出典の権利/位置/休憩条件を確認して、非公開Sheets→CSV→検証済み`public/spots.json`を更新。fixturesを公開しない。
3. `npm run check` と `npm run release:check` を実行し、実機試験を別途記録。テスト未実施は成功と記さない。
4. GitHub mainを更新し、Vercelの該当commit・本番デプロイ対象を照合する。
5. 公開URLの`/`、`/spots.json`、JS/CSS、レスポンスヘッダー、検索・地図・外部地図リンクを検証する。新デザインのE2E・実機検証は現時点で未実施。
6. エラー時は既存正常デプロイを保持し、誤情報を復活させないよう施設JSONを検証してから修復またはロールバックする。

## プライバシー

利用者のGPSはボタン許可後にメモリだけで処理し保存しない。地図タイルは利用者が明示操作した場合のみ国土地理院から取得する。秘密情報は環境変数に保管し、Repositoryや公開JSONへ書き込まない。
