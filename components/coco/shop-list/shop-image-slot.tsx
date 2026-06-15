import type { JSX } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { ShopListImage } from "@/components/coco/shop-list/shop-list-image";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/map/distance";
import { TEXT } from "@/constants/text";

export type ShopImageSlotProps = {
  imageUrl: string;
  shopName: string;
  variant: "list" | "detail";
  /** 現在地からの直線距離（画像左下に重ね表示） */
  distanceMeters?: number | null;
  className?: string;
};

function ShopImageDistanceOverlay({
  distanceMeters,
  compact,
}: {
  distanceMeters: number;
  compact: boolean;
}): JSX.Element {
  const label = formatDistance(distanceMeters);

  return (
    <span
      className={cn(
        "absolute bottom-1 left-1 z-10 inline-flex max-w-[calc(100%-0.5rem)] items-center gap-0.5 rounded-md bg-black/60 px-1.5 py-0.5 font-medium text-white backdrop-blur-[2px]",
        compact ? "text-[10px] leading-none" : "text-xs leading-tight",
      )}
      aria-label={`${TEXT.location.distanceFromHere} ${label}`}
    >
      <MapPin className={cn("shrink-0", compact ? "size-2.5" : "size-3")} aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
}

/**
 * 店舗画像の共通入れ物。
 * 一覧は行の高さに合わせて object-cover（固定比率なし）。詳細ヒーローは ShopDetailHero。
 */
export function ShopImageSlot({
  imageUrl,
  shopName,
  variant,
  distanceMeters = null,
  className,
}: ShopImageSlotProps): JSX.Element {
  const alt = `${shopName}${TEXT.common.imageAltSuffix}`;
  const showDistance =
    distanceMeters !== null && Number.isFinite(distanceMeters);

  if (variant === "detail") {
    const frameClass =
      "relative aspect-[5/4] w-full max-w-full overflow-hidden rounded-xl bg-surface-muted";

    if (imageUrl) {
      return (
        <div className={cn(frameClass, className)} data-slot="shop-image-detail">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
          />
          {showDistance ? (
            <ShopImageDistanceOverlay
              distanceMeters={distanceMeters}
              compact={false}
            />
          ) : null}
        </div>
      );
    }

    return (
      <div
        className={cn(
          frameClass,
          "flex items-center justify-center text-sm text-muted-foreground",
          className,
        )}
        data-slot="shop-image-detail"
        aria-hidden={!showDistance}
      >
        {TEXT.common.noImage}
        {showDistance ? (
          <ShopImageDistanceOverlay
            distanceMeters={distanceMeters}
            compact={false}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-[4.25rem] h-full self-stretch", className)}>
      <ShopListImage imageUrl={imageUrl} alt={alt} className="h-full" />
      {showDistance ? (
        <ShopImageDistanceOverlay
          distanceMeters={distanceMeters}
          compact
        />
      ) : null}
    </div>
  );
}
