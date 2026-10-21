# Sheets / CSV更新手順

## 編集

非公開Google Sheetsを管理用の第一候補とする。既存の接続権限・対象シートは未設定のため、CSV取込を完成させた。シート公開、サービスアカウント発行、API課金は不要。

`data/template.csv` をSheetsへインポート。列はDATA_MODELに一致させ、公開列にtrue/false、fixtureには実データのfalseを入力。設備は `|` 区切り。出典の利用条件を確認し、写真や口コミは転記しない。秘密・個人連絡先を表へ入れない。

公式情報だけで入口/休憩区画座標や条件を確定できない場合はpublished=falseのままにする。候補の調査状況はDATA_CANDIDATES参照。

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

本番公開承認後のみ：`npm run release:check` → Pages Freeの設定確認 → dist配信。Pages側build commandは `npm run build`、outputはdist、Node24。必ずレビュー済みJSONを使う。build失敗時に以前のデプロイを維持することは実アカウントで公開前に検証する。

## 自動化

ローカルCLIが抽出・検証・JSON生成・buildを自動化。ブラウザはSheetsを読み込まない。

GitHub Actionsはprivate repoの無料残量/有料超過設定が未確認なので自動有効化しない。`ops/validate.yml.example` は手動dispatchだけの検証テンプレート。無料残量と課金停止を確認・承認した後に `.github/workflows/validate.yml` へ移す。デプロイ・Commit・シート取得の権限を持たない。

Sheets直接同期/Pages自動配信は未接続。無断で公開CSV URLに変更しない。必要になったら読み取り専用権限、出力先、トークン保管、公開ゲートを決めて追加する。

## 復旧

誤情報はまず非公開化し更新。取込失敗はCSVを修正して再試行。ロールバック時も取り下げ済み施設を復活させないよう旧JSONを確認・修正する。Git revertだけで安全とは限らない。
