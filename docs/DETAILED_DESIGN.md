# 詳細設計 v2

## 検索

searchSpotsは全条件のAND。検索語はtrim/NFKC/日本語小文字化し名称・住所へ部分一致。距離はHaversine、地球半径6,371,000m、計算誤差を0..1へclamp。未丸め距離が半径以下で一致。距離昇順→ID ASCII順。距離は徒歩経路を表さない。

表示は10m未満、10m単位、1km以上は小数1桁。unknownと無料を区別し、期限切れのfree/paidはその条件に一致させない。営業時間・料金計算・空席推定は実装しない。

## 状態

useSpotsはloading/error/readyを管理。15秒で取得を中断して再試行を提供。unmount時に中断。JSON不正は全体を拒否する。

useGeolocationはボタン押下時だけ要求し、10秒timeout、キャッシュ1分、低精度で取得。地域選択時にrequest IDを更新し、遅れて返るGPS結果で地域を上書きしない。位置はメモリだけ。

Appが選択IDを保持。絞込で消えたIDは選択表示しない。カード選択はピンを強調・pan、ピン選択は一覧表示に戻してカードボタンへfocus。モバイル地図は明示操作後に読込。PCも地図読込ボタンにより初回通信を抑える。

## 地図

MapLibre GL JSはMapViewごと遅延読込。MapViewのmountで地図作成、unmountでremove。OpenFreeMap Positronのスタイルから背景・道路線だけを残し、ラベル/施設記号/建物と未使用sourceを除外。検索結果変更はmarkerだけ更新。選択変更で地図を作り直さない。React Error Boundaryとタイルエラー表示で一覧へ縮退。同座標の複数ピンは重なるが全カードから個別選択できる。密集時の専用クラスタリングは未実装。

検索起点と全結果をboundsに含め、ピンが欠けない余白・最大zoom15で表示。幅変更時も再調整する。可視番号をピンの読み上げ名に含め、音声操作と読み上げを一致させる。施設代表位置と入口/席の違いを画面に明示。

## 外部リンク

固定HTTPSホスト＋URLSearchParams。Google Maps URLsのapi=1、徒歩はtravelmode=walking、Street Viewはmap_action=pano。originは常に省略。新規タブとnoopener/noreferrerを明示。Google検索結果とパノラマの場所・撮影日は保証しない。
