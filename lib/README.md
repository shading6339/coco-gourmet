# lib

UI を持たない処理を置く。React hook は `hooks/` に分ける。

| ディレクトリ | 役割 |
|--------------|------|
| `shop/` | 店舗データの表示整形、営業時間、予算、タグ |
| `search/` | 検索条件、位置情報、一覧スクロール |
| `pagination/` | ページ番号、結果件数、pull-to-next-page の計算 |
| `map/` | 距離、徒歩時間、地図タイル座標 |
| `hotpepper/` | Hot Pepper Web Service API のクライアント・型・店舗マッピング |

`utils.ts` は横断的な小さいユーティリティだけに留める。
