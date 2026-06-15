import type { JSX } from "react";
import { buildDetailMetaTags } from "@/lib/shop/detail-meta-tags";
import { ShopTag } from "@/components/coco/shop-list/shop-tag";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/shop";

type ShopDetailMetaTagsProps = {
  shop: Shop;
  className?: string;
};

/** 詳細: カテゴリ・料金帯（￥）・距離のみタグ表示 */
export function ShopDetailMetaTags({
  shop,
  className,
}: ShopDetailMetaTagsProps): JSX.Element | null {
  const tags = buildDetailMetaTags(shop);
  if (tags.length === 0) return null;

  return (
    <div className={cn("flex min-w-0 flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <ShopTag key={tag}>{tag}</ShopTag>
      ))}
    </div>
  );
}
