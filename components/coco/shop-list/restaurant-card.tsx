import type { JSX } from "react";
import { cn } from "@/lib/utils";
import { RESTAURANT_LIST_CARD_GRID } from "@/constants/shopImage";
import { ShopCardMeta } from "@/components/coco/shop-list/shop-card-meta";
import { ShopImageSlot } from "@/components/coco/shop-list/shop-image-slot";
import { ShopTagList } from "@/components/coco/shop-list/shop-tag-list";
import { Typography } from "@/components/ui/typography";
import type { Shop } from "@/types/shop";

type RestaurantCardProps = {
  shop: Shop;
  onShowDetail: () => void;
  className?: string;
};

/** 一覧カード（画像スロット + テキスト + タグ） */
export function RestaurantCard({
  shop,
  onShowDetail,
  className,
}: RestaurantCardProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onShowDetail}
      className={cn(
        RESTAURANT_LIST_CARD_GRID,
        "box-border overflow-hidden rounded-md bg-surface text-left ring-1 ring-foreground/6 shadow-[var(--shadow-card)]",
        "transition-[transform,box-shadow] duration-150 hover:shadow-sm active:scale-[0.99] active:shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="min-h-0 self-stretch">
        <ShopImageSlot
          variant="list"
          imageUrl={shop.imageUrl}
          shopName={shop.name}
          distanceMeters={shop.distanceMeters}
          className="h-full"
        />
      </div>

      <div className="flex min-w-0 flex-col justify-start gap-1 overflow-hidden py-2 pr-2">
        {/* 2行ぶんの高さを常に予約し、1行/2行で card 高がずれないようにする */}
        <Typography
          as="h3"
          variant="label-md"
          className="line-clamp-2 min-h-[2.5rem] break-words text-[15px] font-bold leading-snug"
        >
          {shop.name}
        </Typography>

        <ShopCardMeta shop={shop} />

        <ShopTagList tags={shop.tags} variant="list" className="mt-1" />
      </div>
    </button>
  );
}
