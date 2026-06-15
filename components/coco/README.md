# Coco コンポーネント（ドメイン UI）

グルメ検索アプリ固有の UI。ベースは **shadcn/ui**（`@/components/ui`）を組み合わせて実装する。

- ページから使う公開コンポーネントは `@/components/coco` から import する
- デザイン仕様: `docs/design-system.md` §10.4 以降
- 新規追加時は shadcn に相当するものがないか先に確認し、あれば `ui` から import

## 構成

| ディレクトリ | 役割 |
|--------------|------|
| `home/` | 初期検索画面のヒーローと検索範囲ガイド |
| `shop-list/` | 店舗一覧カード、一覧メタ、タグ、スケルトン |
| `shop-detail/` | 店舗詳細画面と詳細専用カード・地図 |
| `pull-next/` | 一覧下端の pull-to-next-page 表示 |

## 公開境界

`components/coco/index.ts` はページ向けの入口。各サブフォルダの内部部品は、同じ機能グループ内で直接 import する。
