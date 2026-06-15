import type { JSX } from "react";
import { TrainFront, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEXT } from "@/constants/text";
import { ShopBudgetDisplay } from "@/components/coco/shop-list/shop-budget-display";
import { ShopMetaLine } from "@/components/coco/shop-list/shop-meta-line";
import type { Shop } from "@/types/shop";

type ShopCardMetaProps = {
  shop: Shop;
  className?: string;
};

/** 一覧・詳細: 店名の下にアクセス・ジャンル・予算（距離は画像オーバーレイ） */
export function ShopCardMeta({
  shop,
  className,
}: ShopCardMetaProps): JSX.Element | null {
  const hasAccess = Boolean(shop.access.trim());
  const hasGenre = Boolean(shop.genreName);
  const hasBudget = Boolean(shop.budgetDayRange || shop.budgetNightRange);

  if (!hasAccess && !hasGenre && !hasBudget) return null;

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-1 overflow-hidden", className)}>
      {hasAccess ? (
        <ShopMetaLine
          icon={TrainFront}
          className="w-full"
          aria-label={`${TEXT.shop.accessLabel} ${shop.access}`}
        >
          {shop.access}
        </ShopMetaLine>
      ) : null}
      {hasGenre ? (
        <ShopMetaLine icon={UtensilsCrossed} className="w-full">
          {shop.genreName}
        </ShopMetaLine>
      ) : null}
      {hasBudget ? (
        <ShopBudgetDisplay
          dayRange={shop.budgetDayRange}
          nightRange={shop.budgetNightRange}
          layout="stack"
        />
      ) : null}
    </div>
  );
}
