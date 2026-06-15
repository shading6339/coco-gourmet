"use client";

import type { JSX, ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEXT } from "@/constants/text";

type ShopDetailHeroProps = {
  imageUrl: string;
  shopName: string;
  onBack?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
};

function HeroOverlayButton({
  children,
  onClick,
  ariaLabel,
  ariaPressed,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel: string;
  ariaPressed?: boolean;
  className?: string;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      className={cn(
        "glass-float flex size-10 items-center justify-center rounded-full text-foreground transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** 詳細上部: 4:3 画像・下辺のみ角丸（AppBar なし・戻るは画像上） */
export function ShopDetailHero({
  imageUrl,
  shopName,
  onBack,
  isFavorite = false,
  onToggleFavorite,
  className,
}: ShopDetailHeroProps): JSX.Element {
  const alt = `${shopName}${TEXT.common.imageAltSuffix}`;

  return (
    <div
      className={cn(
        "detail-bleed-x w-full overflow-hidden rounded-b-hero bg-surface-muted",
        className,
      )}
      data-slot="shop-detail-hero"
    >
      <div className="relative w-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt}
              fill
              sizes="(max-width: 448px) 100vw, 448px"
              priority
              className="object-cover"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center text-sm text-muted-foreground"
              aria-hidden
            >
              {TEXT.common.noImage}
            </div>
          )}
        </div>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {onBack ? (
            <HeroOverlayButton
              onClick={onBack}
              ariaLabel={TEXT.common.backLabel}
              className="pointer-events-auto"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </HeroOverlayButton>
          ) : (
            <span className="size-10" aria-hidden />
          )}

          <HeroOverlayButton
            onClick={onToggleFavorite}
            ariaLabel={TEXT.shop.favoriteLabel}
            ariaPressed={isFavorite}
            className={cn(
              "pointer-events-auto",
              isFavorite ? "text-secondary" : "text-foreground",
            )}
          >
            <Heart
              className={cn("size-5", isFavorite && "fill-current")}
              aria-hidden
            />
          </HeroOverlayButton>
        </div>
      </div>
    </div>
  );
}
