# shadcn/ui（プリミティブ）

このディレクトリは **shadcn CLI / MCP で追加し、DS に合わせて編集する** コンポーネント専用です。

- 追加: `pnpm dlx shadcn@latest add <component> -y`（既存ファイルは `n` でスキップ）
- MCP: `project-0-coco-gourmet-spike-shadcn` の `get_add_command_for_items`
- 店舗ドメインの組み立ては `@/components/coco`（AppBar・Pagination・Typography 等はここから import）

## 主なコンポーネント

| ファイル | 用途 |
|----------|------|
| `app-bar.tsx` | Glass 検索バー（折りたたみ / 展開） |
| `pagination.tsx` | 番号ページネーション（前へ / 次へ） |
| `typography.tsx` | 見出し・本文・ラベル |
| `search-range-tabs.tsx` | 半径タブ（Tabs ベース） |
| `badge.tsx` | タグ用 `chip` variant |
| `button.tsx` / `input.tsx` / `tabs.tsx` / `card.tsx` | 汎用 |

## import 例

```tsx
import { AppBar, PaginationBar, Typography, TypographyMuted } from "@/components/ui";
// または個別
import { AppBar } from "@/components/ui/app-bar";
```
