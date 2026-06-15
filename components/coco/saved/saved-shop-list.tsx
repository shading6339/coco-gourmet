"use client";

import type { JSX } from "react";

import { RestaurantCard } from "@/components/coco/shop-list/restaurant-card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/shop";

type SavedShopListProps = {
  shops: Shop[];
  emptyTitle: string;
  emptyDescription: string;
  emptyCtaLabel: string;
  onShowDetail: (shop: Shop) => void;
  onEmptyCta: () => void;
  isFavorite?: (shopId: string) => boolean;
  onToggleFavorite?: (shop: Shop) => void;
  className?: string;
};

/** 履歴・お気に入りタブ共通のリスト + 空状態（DS §10.8） */
export function SavedShopList({
  shops,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  onShowDetail,
  onEmptyCta,
  isFavorite,
  onToggleFavorite,
  className,
}: SavedShopListProps): JSX.Element {
  if (shops.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center gap-3 px-4 py-16 text-center",
          className,
        )}
      >
        <Typography as="h2" variant="headline-md" className="font-brand">
          {emptyTitle}
        </Typography>
        <Typography as="p" variant="muted">
          {emptyDescription}
        </Typography>
        <Button
          type="button"
          variant="ghost"
          className="mt-2"
          onClick={onEmptyCta}
        >
          {emptyCtaLabel}
        </Button>
      </div>
    );
  }

  return (
    <ul className={cn("space-y-3", className)}>
      {shops.map((shop) => (
        <li key={shop.id}>
          <RestaurantCard
            shop={shop}
            isFavorite={isFavorite?.(shop.id)}
            onToggleFavorite={onToggleFavorite}
            onShowDetail={() => {
              onShowDetail(shop);
            }}
          />
        </li>
      ))}
    </ul>
  );
}
