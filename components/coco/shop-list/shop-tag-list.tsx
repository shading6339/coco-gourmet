import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { ShopTagListRow } from "@/components/coco/shop-list/shop-tag-list-row";
import { ShopTag } from "@/components/coco/shop-list/shop-tag";

type ShopTagListProps = {
  tags: string[];
  variant?: "list" | "detail";
  className?: string;
};

export function ShopTagList({
  tags,
  variant = "list",
  className,
}: ShopTagListProps): JSX.Element | null {
  if (tags.length === 0) return null;

  if (variant === "detail") {
    return (
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {tags.map((tag) => (
          <ShopTag key={tag}>{tag}</ShopTag>
        ))}
      </div>
    );
  }

  return <ShopTagListRow tags={tags} className={className} />;
}
