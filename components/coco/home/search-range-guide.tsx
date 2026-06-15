"use client";

import { useMemo, type JSX } from "react";
import { Footprints } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { SearchRangeTabs } from "@/components/ui/search-range-tabs";
import { TEXT } from "@/constants/text";
import { estimateWalkMinutes } from "@/lib/map/walk-time";
import { cn } from "@/lib/utils";
import type { SearchRangeOption } from "@/types/search-range";

type SearchRangeGuideProps = {
  range: string;
  onRangeChange: (value: string) => void;
  rangeOptions: readonly SearchRangeOption[];
  className?: string;
};

/** ヒーロー上: 検索半径タブ + 徒歩時間ヒント（glass パネル） */
export function SearchRangeGuide({
  range,
  onRangeChange,
  rangeOptions,
  className,
}: SearchRangeGuideProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  const selectedRange = useMemo(
    () => rangeOptions.find((option) => option.value === range),
    [range, rangeOptions],
  );

  const walkMinutes = estimateWalkMinutes(selectedRange?.meters ?? 1000);
  const radiusLabel = selectedRange?.label ?? "";

  return (
    <div
      data-slot="search-range-guide"
      className={cn(
        "overflow-hidden rounded-2xl",
        "border border-white/30 bg-black/30 backdrop-blur-md",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.25),inset_0_-1px_0_rgb(0_0_0/0.2),0_8px_24px_rgb(0_0_0/0.25)]",
        className,
      )}
    >
      <div className="space-y-3 px-3 pb-3 pt-3">
        <p className="hero-overlay-eyebrow text-center">{TEXT.search.radiusLabel}</p>

        <SearchRangeTabs
          value={range}
          onValueChange={onRangeChange}
          options={rangeOptions}
          variant="on-image-nested"
        />
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className="border-t border-white/10 bg-white/[0.04] px-3 py-2.5"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full",
              "border border-white/15 bg-white/10 text-white/90",
              "shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]",
            )}
          >
            <Footprints className="size-4" strokeWidth={2.25} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
              <span className="hero-overlay-caption">{TEXT.search.walkTimePrefix}</span>
              <span className="inline-flex items-baseline overflow-hidden text-white">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={walkMinutes}
                    initial={
                      reduceMotion ? false : { opacity: 0, y: 10, filter: "blur(4px)" }
                    }
                    animate={
                      reduceMotion
                        ? undefined
                        : { opacity: 1, y: 0, filter: "blur(0px)" }
                    }
                    exit={
                      reduceMotion
                        ? undefined
                        : { opacity: 0, y: -10, filter: "blur(4px)" }
                    }
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="font-brand text-2xl font-bold tabular-nums leading-none tracking-tight [text-shadow:0_1px_3px_rgb(0_0_0/45%)]"
                  >
                    {walkMinutes}
                  </motion.span>
                </AnimatePresence>
                <span className="ml-0.5 text-sm font-semibold [text-shadow:0_1px_2px_rgb(0_0_0/35%)]">
                  分
                </span>
              </span>
              <span className="hero-overlay-caption">{TEXT.search.walkTimeSuffix}</span>
            </p>

            {radiusLabel ? (
              <p className="hero-overlay-caption-muted mt-0.5 truncate">
                {radiusLabel}
                {TEXT.search.searchRadiusWithin}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
