# Sheets / CSV更新手順

## 編集

非公開Google Sheetsを管理用の第一候補とする。既存の接続権限・対象シートは未設定のため、CSV取込を完成させた。シート公開、サービスアカウント発行、API課金は不要。

初回は `mkdir -p imports` → `npm run data:export -- imports/current.csv` で現在の掲載JSONをCSV化しSheetsへインポート。空から作る場合は `data/template.csv` を使用。出力先の既存ファイルは上書きしない。CSVはUTF-8 BOM付き、引用符をエスケープし、数式開始文字を持つ値の出力を拒否する。列はDATA_MODELに一致させ、公開列にtrue/false、fixtureには実データのfalseを入力。設備は `|` 区切り。出典の利用条件を確認し、写真や口コミは転記しない。秘密・個人連絡先を表へ入れない。

座標は入口・席・施設代表位置のどれかを確認する。代表位置で登録する場合は画面で限界を明示し、個別席への経路や空席を保証しない。再利用可能な位置データと一般利用条件を確認できない場合はpublished=falseのままにする。初期2件の根拠はDATA_EVIDENCE、候補はDATA_CANDIDATES参照。

既存Sheetsを編集用の正本とする。data:exportは公開中の行だけを書き出すため、既存Sheets全体をこれで置換すると非公開行やメモを失う。書出しは初回作成・公開内容の照合用に使う。

## 手動更新

```bash
mkdir -p imports
# 非公開Sheetsの対象タブをCSVダウンロードし imports/spots.csv に保存
npm run data:import -- imports/spots.csv
npm run check
```

CSVの列・公開状態・全行ID重複を確認し、公開行だけを型・必須項目・座標・出典・日付・fixtureで検証。成功後のみ同一ディレクトリの一時ファイルからrenameでJSONを切替。不正入力時は既存JSONを保持する。CSVから任意URL取得は行わない。

公開差分を確認し `public/spots.json` だけをCommit。importsはGit除外。全件取り下げは明示的に `npm run data:import -- imports/spots.csv --allow-empty`。0件への変更は意図を確認する。

## 配信

2026-10-24にユーザーがVercel公開を指定。`npm run release:check` → Vercel Hobby/用途条件の確認 → dist配信。Vercel buildは `node --import tsx scripts/prepare-release.ts && npm run check`、outputはdist、Node24。必ずレビュー済みJSONを使う。build失敗時の前回配信維持は実アカウントで確認する。詳細はVERCEL_DEPLOYMENT。

## 自動化

ローカルCLIが抽出・検証・JSON生成・buildを自動化。ブラウザはSheetsを読み込まない。

GitHub Actionsはprivate repoの無料残量/有料超過設定が未確認なので自動有効化しない。`ops/validate.yml.example` は手動dispatchだけの検証テンプレート。無料残量と課金停止を確認・承認した後に `.github/workflows/validate.yml` へ移す。デプロイ・Commit・シート取得の権限を持たない。

Sheets直接同期/Vercel自動配信は未接続。無断で公開CSV URLに変更しない。必要になったら読み取り専用権限、出力先、トークン保管、公開ゲートを決めて追加する。

## 復旧

誤情報はまず非公開化し更新。取込失敗はCSVを修正して再試行。ロールバック時も取り下げ済み施設を復活させないよう旧JSONを確認・修正する。Git revertだけで安全とは限らない。
