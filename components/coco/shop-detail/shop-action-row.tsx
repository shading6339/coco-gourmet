"use client";

import { useRef, useState, type JSX } from "react";
import { ExternalLink, Navigation, Share2 } from "lucide-react";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/shop";

const SHARE_FEEDBACK_MS = 1600;

function buildDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

function openExternal(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

type ShopActionRowProps = {
  shop: Shop;
  className?: string;
};

/** 詳細: 経路・ホットペッパー・共有のアクション行 */
export function ShopActionRow({
  shop,
  className,
}: ShopActionRowProps): JSX.Element | null {
  const [shareCopied, setShareCopied] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasCoords = shop.lat !== null && shop.lng !== null;
  const hasHotpepperUrl = Boolean(shop.hotpepperUrl);

  const handleShare = async (): Promise<void> => {
    // このアプリの詳細ページ自体を共有する（ホットペッパーURLではない）
    const url = `${window.location.origin}/?shop=${encodeURIComponent(shop.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: shop.name, url });
      } catch {
        // ユーザーキャンセルは黙殺
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    copiedTimerRef.current = setTimeout(() => {
      setShareCopied(false);
    }, SHARE_FEEDBACK_MS);
  };

  return (
    <div className={cn("flex gap-2", className)} data-slot="shop-action-row">
      {hasCoords ? (
        <LiquidGlassButton
          variant="on-glass"
          className="h-11 min-w-0 flex-1 gap-1.5"
          onClick={() => {
            openExternal(buildDirectionsUrl(shop.lat!, shop.lng!));
          }}
        >
          <Navigation className="size-4" aria-hidden />
          {TEXT.shop.directionsAction}
        </LiquidGlassButton>
      ) : null}

      <LiquidGlassButton
        variant="on-glass"
        className="h-11 min-w-0 flex-1 gap-1.5"
        aria-live="polite"
        onClick={() => {
          void handleShare();
        }}
      >
        <Share2 className="size-4" aria-hidden />
        {shareCopied ? TEXT.shop.shareCopied : TEXT.shop.shareAction}
      </LiquidGlassButton>

      {hasHotpepperUrl ? (
        <LiquidGlassButton
          variant="on-glass"
          className="h-11 min-w-0 flex-1 gap-1.5 text-muted-foreground"
          onClick={() => {
            openExternal(shop.hotpepperUrl);
          }}
        >
          <ExternalLink className="size-4" aria-hidden />
          {TEXT.shop.hotpepperAction}
        </LiquidGlassButton>
      ) : null}
    </div>
  );
}
