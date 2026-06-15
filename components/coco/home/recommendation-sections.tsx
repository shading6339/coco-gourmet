import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import Image from "next/image";
import { ChevronRight, Utensils } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { TEXT } from "@/constants/text";
import type { RecommendationSection } from "@/types/recommendation";
import { Button } from "@/components/ui/button";
import { formatDistance } from "@/lib/map/distance";
import { LIQUID_SPRING } from "@/lib/motion/liquid-spring";
import { cn } from "@/lib/utils";
import { TypographyMuted } from "@/components/ui/typography";

type RecommendationSectionsProps = {
  sections: RecommendationSection[];
  title: string;
  hint?: string | null;
  emptyMessage?: string | null;
  isLoading?: boolean;
  showLocationAction?: boolean;
  locationActionLabel: string;
  isLocating?: boolean;
  onLocationAction: () => void;
  onShowSection: (section: RecommendationSection) => void;
  onSelectShop: (shop: RecommendationSection["shops"][number]) => void;
  className?: string;
};

function RecommendationSkeleton(): JSX.Element {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className="space-y-3">
          <div className="skeleton h-5 w-40 rounded-lg" />
          <div className="flex gap-3 overflow-hidden pb-1">
            {Array.from({ length: 2 }, (_, cardIndex) => (
              <div
                key={cardIndex}
                className="w-[17rem] shrink-0 space-y-2"
                aria-hidden
              >
                <div className="skeleton aspect-[16/10] rounded-lg" />
                <div className="skeleton h-4 w-3/4 rounded-lg" />
                <div className="skeleton h-3 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type RecommendationImageLoadState = "loading" | "loaded" | "error";

function RecommendationShopImage({
  imageUrl,
  shopName,
}: {
  imageUrl: string;
  shopName: string;
}): JSX.Element {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loadState, setLoadState] = useState<RecommendationImageLoadState>(
    imageUrl ? "loading" : "error",
  );

  useEffect(() => {
    setLoadState(imageUrl ? "loading" : "error");
  }, [imageUrl]);

  const syncCompletedImage = useCallback((): void => {
    const image = imageRef.current;
    if (!image || !imageUrl || !image.complete) return;

    setLoadState(image.naturalWidth > 0 ? "loaded" : "error");
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl) return undefined;

    const frame = window.requestAnimationFrame(syncCompletedImage);
    const timer = window.setTimeout(syncCompletedImage, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [imageUrl, syncCompletedImage]);

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface ring-1 ring-foreground/8 shadow-[var(--shadow-card)]">
      {imageUrl && loadState !== "error" ? (
        <>
          {loadState === "loading" ? (
            <div className="skeleton absolute inset-0 rounded-lg" aria-hidden />
          ) : null}
          <Image
            ref={imageRef}
            key={imageUrl}
            src={imageUrl}
            alt={`${shopName}の画像`}
            fill
            sizes="272px"
            className={cn(
              "object-cover transition-opacity duration-200",
              loadState === "loaded" ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => {
              setLoadState("loaded");
            }}
            onError={() => {
              setLoadState("error");
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center text-muted-foreground/70"
          aria-hidden
        >
          <Utensils className="size-5" />
        </div>
      )}
    </div>
  );
}

export function RecommendationSections({
  sections,
  title,
  hint = null,
  emptyMessage = null,
  isLoading = false,
  showLocationAction = false,
  locationActionLabel,
  isLocating = false,
  onLocationAction,
  onShowSection,
  onSelectShop,
  className,
}: RecommendationSectionsProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <section className={cn("space-y-4", className)} aria-label={title}>
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-[1.375rem] font-bold leading-7 tracking-normal text-foreground">
            {title}
          </h2>
          {showLocationAction ? (
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={isLocating}
              onClick={onLocationAction}
              className="shrink-0 font-normal"
            >
              {isLocating ? TEXT.location.locationLoading : locationActionLabel}
            </Button>
          ) : null}
        </div>
        {hint ? (
          <TypographyMuted className="text-xs leading-5">{hint}</TypographyMuted>
        ) : null}
      </div>

      {isLoading ? (
        <RecommendationSkeleton />
      ) : sections.length === 0 ? (
        emptyMessage ? (
          <TypographyMuted className="text-sm leading-6">
            {emptyMessage}
          </TypographyMuted>
        ) : null
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.code} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="min-w-0 truncate text-[0.9375rem] font-semibold leading-5 text-foreground">
                  {section.title}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onShowSection(section);
                  }}
                  aria-label={`${section.title}を検索`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  <ChevronRight className="size-4" aria-hidden />
                </button>
              </div>

              <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                {section.shops.map((shop) => (
                  <motion.button
                    key={shop.id}
                    type="button"
                    onClick={() => {
                      onSelectShop(shop);
                    }}
                    className="w-[17rem] shrink-0 space-y-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={`${shop.name}の詳細を表示`}
                    whileTap={
                      reduceMotion
                        ? undefined
                        : { scale: 0.98, transition: LIQUID_SPRING.active }
                    }
                    transition={LIQUID_SPRING.release}
                  >
                    <RecommendationShopImage
                      imageUrl={shop.imageUrl}
                      shopName={shop.name}
                    />

                    <div className="min-w-0 space-y-1">
                      {/* 2行ぶんの高さを予約し、カルーセル行の縦ズレを防ぐ */}
                      <h4 className="line-clamp-2 min-h-10 break-words text-sm font-semibold leading-5 text-foreground">
                        {shop.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs leading-tight text-muted-foreground">
                        {shop.genreName ? (
                          <span className="min-w-0 truncate">
                            {shop.genreName}
                          </span>
                        ) : null}
                        {shop.genreName && shop.distanceMeters !== null ? (
                          <span aria-hidden className="text-border">
                            ·
                          </span>
                        ) : null}
                        {shop.distanceMeters !== null ? (
                          <span className="shrink-0 tabular-nums">
                            {formatDistance(shop.distanceMeters)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
