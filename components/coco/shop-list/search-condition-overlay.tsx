"use client";

import { useEffect, useMemo, useState, type JSX } from "react";
import { motion } from "motion/react";

import { SearchConditionPanel } from "@/components/coco/shop-list/search-condition-panel";
import { AnimatedNumber } from "@/components/ui/animated-number";
import {
  APP_BAR_FLOAT_PANEL_CLASS,
  FILTER_FOOTER_CAPSULE_CLASS,
  FILTER_FOOTER_ROW_CLASS,
  LiquidCapsuleButton,
} from "@/components/ui/liquid-capsule-button";
import { TEXT } from "@/constants/text";
import { useSearchPreviewCount } from "@/hooks/use-search-preview-count";
import {
  DEFAULT_SHOP_SEARCH_CONDITIONS,
  type SearchOption,
  type ShopSearchConditions,
} from "@/lib/search/filter-shops";
import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import type { GeoCoords } from "@/lib/search/geolocation";
import { areSearchConditionsEqual } from "@/lib/search/search-condition-utils";
import { cn } from "@/lib/utils";
import type { SearchRangeOption } from "@/types/search-range";

type SearchConditionOverlayProps = {
  open: boolean;
  coords: GeoCoords | null;
  conditions: ShopSearchConditions;
  rangeOptions: readonly SearchRangeOption[];
  genres: SearchOption[];
  specials?: SpecialSearchOption[];

  budgetHistogramCounts?: readonly number[];
  mastersErrorMessage?: string | null;
  /** ボタンの件数初期値（一覧の現在総件数）。確認前から数字を出して待ちを感じさせない */
  initialTotal?: number | null;
  onApply: (conditions: ShopSearchConditions) => void;
  onClose: () => void;
  className?: string;
};

/* DS motion トークン準拠: --motion-base(220ms) / --ease-out-soft */
const SHEET_TRANSITION = { duration: 0.22, ease: [0.22, 1, 0.36, 1] } as const;
/* --motion-fast(150ms) */
const SCRIM_TRANSITION = { duration: 0.15 } as const;

/** 結果一覧のスクロール位置に依存せず、AppBar 直下に詳細検索を表示する */
export function SearchConditionOverlay({
  open,
  coords,
  conditions,
  rangeOptions,
  genres,
  specials,

  budgetHistogramCounts,
  mastersErrorMessage,
  initialTotal = null,
  onApply,
  onClose,
  className,
}: SearchConditionOverlayProps): JSX.Element {
  const [draft, setDraft] = useState<ShopSearchConditions>(conditions);
  /** 最後に確定した件数を保持し、確認中も前の数字を表示し続ける */
  const [displayTotal, setDisplayTotal] = useState<number | null>(initialTotal);

  useEffect(() => {
    if (!open) return;
    setDraft(conditions);
    setDisplayTotal(initialTotal);
    // initialTotal はオープン時のスナップショットでよい
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, conditions]);

  const isDirty = useMemo(
    () => !areSearchConditionsEqual(draft, conditions),
    [conditions, draft],
  );

  const isDraftDefault = useMemo(
    () => areSearchConditionsEqual(draft, DEFAULT_SHOP_SEARCH_CONDITIONS),
    [draft],
  );

  const preview = useSearchPreviewCount(open, coords, draft);

  useEffect(() => {
    if (preview.total !== null && !preview.isLoading && !preview.error) {
      setDisplayTotal(preview.total);
    }
  }, [preview.error, preview.isLoading, preview.total]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <div
      className={cn("fixed inset-0 z-40 w-full", className)}
      data-slot="search-condition-overlay"
    >
      {/* 背景スクリム */}
      <motion.button
        type="button"
        aria-label={TEXT.search.closeFilters}
        className="absolute inset-0 bg-foreground/32"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={SCRIM_TRANSITION}
      />

      {/* フィルターシート（AppBar 下・横インセットの浮遊ガラス） */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={TEXT.search.filterDialogTitle}
        className="search-filter-overlay-panel"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={SHEET_TRANSITION}
      >
        <div
          className={cn(APP_BAR_FLOAT_PANEL_CLASS, "flex min-h-0 flex-1 flex-col")}
        >
          {mastersErrorMessage ? (
            <p
              role="alert"
              className="bg-error-container px-4 py-2 text-xs text-on-error-container"
            >
              {mastersErrorMessage}
            </p>
          ) : null}

          <div className="search-filter-overlay-scroll">
            <SearchConditionPanel
              conditions={draft}
              rangeOptions={rangeOptions}
              genres={genres}
              specials={specials}

              budgetHistogramCounts={budgetHistogramCounts}
              onChange={setDraft}
              className="pb-4"
            />
          </div>
        </div>
      </motion.div>

      {/* 下部フッター（AppBar カプセルと同型） */}
      <motion.div
        className="search-filter-overlay-footer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={SHEET_TRANSITION}
      >
        <div className={FILTER_FOOTER_CAPSULE_CLASS}>
          <div className={FILTER_FOOTER_ROW_CLASS}>
            <LiquidCapsuleButton
              variant="input"
              className="h-12 shrink-0 px-5"
              disabled={isDraftDefault}
              onClick={() => {
                setDraft(DEFAULT_SHOP_SEARCH_CONDITIONS);
              }}
            >
              {TEXT.search.clearFilters}
            </LiquidCapsuleButton>
            <LiquidCapsuleButton
              variant="primary"
              className="h-12 min-w-0 flex-1 px-5"
              disabled={displayTotal === 0 && !preview.error}
              aria-label={
                displayTotal === null || preview.error
                  ? TEXT.search.applyFilters
                  : `${displayTotal.toLocaleString("ja-JP")}${TEXT.search.applyWithCountSuffix}`
              }
              onClick={() => {
                if (isDirty) {
                  onApply(draft);
                } else {
                  onClose();
                }
              }}
            >
              {displayTotal === null || preview.error ? (
                TEXT.search.applyFilters
              ) : (
                <span className="flex items-baseline gap-0.5 tabular-nums">
                  <AnimatedNumber value={displayTotal} />
                  <span>{TEXT.search.applyWithCountSuffix}</span>
                </span>
              )}
            </LiquidCapsuleButton>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
