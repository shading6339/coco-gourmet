import type { JSX } from "react";
import { MapPin } from "lucide-react";
import { ShopMap } from "@/components/coco/shop-detail/shop-map";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { TEXT } from "@/constants/text";
import type { Shop } from "@/types/shop";

/** 詳細の情報ブロック（L1: hairline + shadow-card） */
const BORDERLESS_SURFACE_CLASS =
  "rounded-md bg-surface ring-1 ring-foreground/6 shadow-[var(--shadow-card)]";

type ShopLocationCardProps = {
  shop: Shop;
  className?: string;
};

/** 住所・アクセス・地図のカード */
export function ShopLocationCard({
  shop,
  className,
}: ShopLocationCardProps): JSX.Element | null {
  const hasAddress = Boolean(shop.address.trim());
  const hasAccess = Boolean(shop.access.trim());
  const hasCoords =
    shop.lat !== null &&
    shop.lng !== null &&
    Number.isFinite(shop.lat) &&
    Number.isFinite(shop.lng);

  if (!hasAddress && !hasAccess && !hasCoords) return null;

  return (
    <div className={cn(BORDERLESS_SURFACE_CLASS, className)}>
      <div className="space-y-3 p-4">
        <div className="flex gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted"
            aria-hidden
          >
            <MapPin className="size-5 text-primary" />
          </span>
          <div className="min-w-0 space-y-1">
            {hasAddress ? (
              <Typography as="p" variant="label-md" className="leading-snug">
                {shop.address}
              </Typography>
            ) : null}
            {hasAccess ? (
              <Typography as="p" variant="muted" className="leading-snug">
                {shop.access}
              </Typography>
            ) : null}
          </div>
        </div>

        {hasCoords ? (
          <ShopMap
            lat={shop.lat!}
            lng={shop.lng!}
            alt={`${shop.name} ${TEXT.shop.mapLabel}`}
            className="rounded-md"
          />
        ) : null}
      </div>
    </div>
  );
}
