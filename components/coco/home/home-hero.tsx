"use client";

import type { JSX } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchRangeGuide } from "@/components/coco/home/search-range-guide";
import type { SearchRangeOption } from "@/types/search-range";
import { TEXT } from "@/constants/text";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

const HERO_IMAGE = "/hero.webp";

type HomeHeroProps = {
  range: string;
  onRangeChange: (value: string) => void;
  rangeOptions: readonly SearchRangeOption[];
  onSearchFromHere: () => void;
  className?: string;
};

/** トップ: ヒーロー画像 + スクリム + コピー + 現在地検索 + 半径タブ */
export function HomeHero({
  range,
  onRangeChange,
  rangeOptions,
  onSearchFromHere,
  className,
}: HomeHeroProps): JSX.Element {
  return (
    <section
      className={cn(
        "detail-bleed-x hero-top relative w-full overflow-hidden rounded-b-hero",
        className,
      )}
      data-slot="home-hero"
    >
      <Image
        src={HERO_IMAGE}
        alt={TEXT.hero.heroImageAlt}
        fill
        priority
        sizes="(max-width: 28rem) 100vw, 448px"
        className="object-cover"
      />

      {/* ゴチャつき抑制: 全体スクリム + 下方向グラデ */}
      <div
        className="pointer-events-none absolute inset-0 bg-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-white/5"
        aria-hidden
      />

      <div className="hero-top-inner hero-safe-top-pt relative flex min-h-full flex-col px-4 pb-8">
        <div className="mt-auto w-full space-y-4 pt-10">
          <div className="space-y-3">
            <p className="font-brand text-pretty text-4xl leading-none tracking-tight text-white">
              {TEXT.hero.heroBrand}
            </p>
            <Typography
              as="p"
              variant="headline-md"
              className="text-pretty font-sans text-2xl leading-9 text-white/90"
            >
              {TEXT.hero.heroHeadline}
            </Typography>
          </div>
          <Typography
            as="p"
            variant="body-lg"
            className="text-pretty font-sans leading-relaxed text-white/75"
          >
            {TEXT.hero.heroLead}
          </Typography>
        </div>

        <div className="mt-10 space-y-3">
          <Button
            type="button"
            onClick={onSearchFromHere}
            className="h-12 w-full gap-2 text-base shadow-none"
          >
            <MapPin className="size-5 shrink-0" aria-hidden />
            {TEXT.hero.searchFromHereButton}
          </Button>

          <SearchRangeGuide
            range={range}
            onRangeChange={onRangeChange}
            rangeOptions={rangeOptions}
          />
        </div>
      </div>
    </section>
  );
}
