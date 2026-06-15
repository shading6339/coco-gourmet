"use client";

import type { ComponentProps, FormEvent, JSX } from "react";
import { useEffect, useRef } from "react";
import { ArrowLeft, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { LIQUID_SPRING } from "@/lib/motion/liquid-spring";
import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";

export type AppBarMode = "home" | "results";

/** AppBar 高さ固定（折りたたみ / 展開で同じ） */
export const APP_BAR_OFFSET_CLASS = "app-bar-offset-pt";

const BAR_ROW_CLASS = "relative h-10 w-full";
const EXPAND_MS = 0.18;
const EXPAND_EASE = [0.22, 1, 0.36, 1] as const;
const FADE_MS = 0.1;

const SEARCH_INPUT_CLASS = cn(
  "h-10 w-full rounded-lg border-0 bg-transparent pl-10 pr-3 text-base shadow-none",
  "outline-none focus-visible:border-0 focus-visible:ring-0 focus-visible:shadow-none",
);

const ICON_BUTTON_CLASS = cn(
  "flex size-10 shrink-0 items-center justify-center rounded-full text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

/** Liquid Glass の押下「潰れて広がる」を持つアイコンボタン（カプセル内要素） */
function LiquidIconButton({
  className,
  children,
  ...props
}: ComponentProps<typeof motion.button>): JSX.Element {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      className={cn(ICON_BUTTON_CLASS, className)}
      style={{ transformOrigin: "center bottom" }}
      whileTap={
        reduceMotion
          ? undefined
          : { scaleY: 0.9, scaleX: 1.06, transition: LIQUID_SPRING.active }
      }
      transition={LIQUID_SPRING.release}
      {...props}
    >
      {children}
    </motion.button>
  );
}

type AppBarProps = {
  mode: AppBarMode;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  showBack?: boolean;
  onBack?: () => void;
  searchExpanded: boolean;
  onSearchExpandedChange: (expanded: boolean) => void;
  onSearchFocus?: () => void;
  showFilter?: boolean;
  filterActiveCount?: number;
  filterExpanded?: boolean;
  onFilterClick?: () => void;
  className?: string;
};

function SearchField({
  inputRef,
  value,
  onChange,
  onFocus,
  onSubmit,
  placeholder,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onSubmit?: () => void;
  placeholder: string;
}): JSX.Element {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex h-10 w-full min-w-0 items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: FADE_MS, delay: EXPAND_MS * 0.35 }}
    >
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">{TEXT.search.searchLabel}</span>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          onFocus={onFocus}
          placeholder={placeholder}
          enterKeyHint="search"
          autoComplete="off"
          className={SEARCH_INPUT_CLASS}
        />
      </label>
    </motion.form>
  );
}

/** §10.3 Glass 検索 AppBar（高さ固定・右端アイコンから展開） */
export function AppBar({
  mode,
  value,
  onChange,
  onSubmit,
  placeholder = TEXT.search.searchPlaceholder,
  showBack = false,
  onBack,
  searchExpanded,
  onSearchExpandedChange,
  onSearchFocus,
  showFilter = false,
  filterActiveCount = 0,
  filterExpanded = false,
  onFilterClick,
  className,
}: AppBarProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const isHome = mode === "home";
  const isExpanded = !isHome || searchExpanded;
  const showLeading = showBack || (isHome && isExpanded);

  useEffect(() => {
    if (!isExpanded) return undefined;
    const id = window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(id);
    };
  }, [isExpanded]);

  const openSearch = (): void => {
    onSearchExpandedChange(true);
  };

  const closeSearch = (): void => {
    onSearchExpandedChange(false);
    inputRef.current?.blur();
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-[28rem]",
        "px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]",
        className,
      )}
      data-slot="app-bar"
      data-mode={mode}
      data-expanded={isExpanded}
    >
      {/* L3 浮遊カプセル: 背景が透けて glass が知覚できる */}
      <div className="glass-float box-border rounded-full px-2 py-1">
        <div className={BAR_ROW_CLASS}>
          {isHome ? (
            <motion.p
              aria-hidden={isExpanded}
              className={cn(
                "pointer-events-none absolute inset-x-12 top-1/2 -translate-y-1/2 truncate text-center",
                isExpanded && "select-none",
              )}
              initial={false}
              animate={{
                opacity: isExpanded ? 0 : 1,
                scale: isExpanded ? 0.98 : 1,
              }}
              transition={{ duration: FADE_MS, ease: "easeOut" }}
            >
              <Typography
                as="span"
                variant="headline-md"
                className="font-brand text-base font-normal"
              >
                {TEXT.common.appTitle}
              </Typography>
            </motion.p>
          ) : null}

          <div className="flex h-10 w-full items-center gap-2">
            <motion.div
              className="shrink-0 overflow-hidden"
              initial={false}
              animate={{ width: showLeading ? 40 : 0 }}
              transition={{ duration: EXPAND_MS, ease: EXPAND_EASE }}
            >
              {showLeading ? (
                showBack ? (
                  <LiquidIconButton
                    onClick={onBack}
                    aria-label={TEXT.common.backLabel}
                  >
                    <ArrowLeft className="size-5" aria-hidden />
                  </LiquidIconButton>
                ) : (
                  <LiquidIconButton
                    onClick={closeSearch}
                    aria-label={TEXT.search.closeSearchLabel}
                    className="text-muted-foreground"
                  >
                    <ArrowLeft className="size-5" aria-hidden />
                  </LiquidIconButton>
                )
              ) : null}
            </motion.div>

            <motion.div
              className={cn(
                "relative ml-auto flex h-10 min-w-0 overflow-hidden rounded-full",
                isExpanded && "flex-1 bg-input",
              )}
              initial={false}
              animate={{
                width: isExpanded ? "100%" : 40,
                marginLeft: isExpanded ? 0 : "auto",
              }}
              transition={{ duration: EXPAND_MS, ease: EXPAND_EASE }}
              style={{ transformOrigin: "right center" }}
            >
              {isExpanded ? (
                <SearchField
                  inputRef={inputRef}
                  value={value}
                  onChange={onChange}
                  onFocus={onSearchFocus}
                  onSubmit={onSubmit}
                  placeholder={placeholder}
                />
              ) : (
                <LiquidIconButton
                  onClick={openSearch}
                  aria-label={TEXT.search.openSearchLabel}
                >
                  <Search className="size-5" aria-hidden />
                </LiquidIconButton>
              )}
            </motion.div>

            {showFilter && isExpanded ? (
              <LiquidIconButton
                onClick={onFilterClick}
                aria-label={
                  filterExpanded
                    ? TEXT.search.closeFilterPanelLabel
                    : TEXT.search.openFilterPanelLabel
                }
                aria-pressed={filterExpanded}
                className={cn(
                  "relative bg-input text-muted-foreground",
                  filterExpanded && "text-primary",
                )}
              >
                {/* 開閉に応じて Sliders ⇄ X をモーフ（DS --motion-fast 相当） */}
                <AnimatePresence initial={false} mode="popLayout">
                  {filterExpanded ? (
                    <motion.span
                      key="close"
                      className="flex"
                      initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                      transition={{ duration: 0.15, ease: EXPAND_EASE }}
                    >
                      <X className="size-5" aria-hidden />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="filter"
                      className="flex"
                      initial={{ opacity: 0, rotate: 90, scale: 0.8 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, rotate: -90, scale: 0.8 }}
                      transition={{ duration: 0.15, ease: EXPAND_EASE }}
                    >
                      <SlidersHorizontal className="size-5" aria-hidden />
                    </motion.span>
                  )}
                </AnimatePresence>
                {filterActiveCount > 0 && !filterExpanded ? (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold leading-none text-primary-foreground">
                    {filterActiveCount}
                  </span>
                ) : null}
              </LiquidIconButton>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
