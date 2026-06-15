"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { SearchRangeOption } from "@/types/search-range";

export type { SearchRangeOption };

type SearchRangeTabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly SearchRangeOption[];
  /** ヒーロー上の暗い背景向け */
  variant?: "default" | "on-image" | "on-image-nested";
  className?: string;
};

type IndicatorRect = {
  left: number;
  width: number;
};

const INDICATOR_SPRING = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.72,
};

const triggerBaseClass = cn(
  "relative z-10 h-8 min-h-8 min-w-0 flex-1 basis-0 rounded-md px-0.5 text-xs tabular-nums",
  "border-0 bg-transparent shadow-none after:hidden",
  "data-active:bg-transparent dark:data-active:bg-transparent",
  "focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-0",
);

/** 検索半径切り替え（スライドする glass インジケーター付き） */
export function SearchRangeTabs({
  value,
  onValueChange,
  options,
  variant = "default",
  className,
}: SearchRangeTabsProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const reduceMotion = useReducedMotion();
  const onImage = variant === "on-image" || variant === "on-image-nested";
  const nested = variant === "on-image-nested";

  const updateIndicator = useCallback((): void => {
    const root = rootRef.current;
    if (!root) return;

    const list = root.querySelector<HTMLElement>('[data-slot="tabs-list"]');
    const active = root.querySelector<HTMLElement>(
      '[data-slot="tabs-trigger"][data-state="active"]',
    );
    if (!list || !active) return;

    const listRect = list.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    setIndicator({
      left: activeRect.left - listRect.left,
      width: activeRect.width,
    });
  }, []);

  useLayoutEffect(() => {
    updateIndicator();
  }, [value, options, updateIndicator]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const list = root.querySelector('[data-slot="tabs-list"]');
    if (!list) return undefined;

    const observer = new ResizeObserver(() => {
      updateIndicator();
    });
    observer.observe(list);
    window.addEventListener("resize", updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [updateIndicator]);

  return (
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <div ref={rootRef} className="relative w-full">
        <TabsList
          className={cn(
            "relative !inline-flex !h-auto w-full flex-row items-stretch gap-1 overflow-hidden rounded-xl p-1",
            onImage
              ? nested
                ? "border border-white/10 bg-white/[0.08] text-white"
                : "border border-white/15 bg-black/30 text-white backdrop-blur-sm"
              : "bg-surface-muted text-muted-foreground",
          )}
        >
          {indicator ? (
            <motion.span
              aria-hidden
              className={cn(
                "pointer-events-none absolute top-1 z-0 h-8 rounded-md",
                "shadow-[inset_0_1px_0_rgb(255_255_255/0.7)]",
                onImage
                  ? "bg-white/95 shadow-sm shadow-black/20"
                  : "bg-surface shadow-sm",
              )}
              initial={false}
              animate={{
                left: indicator.left,
                width: indicator.width,
              }}
              transition={
                reduceMotion ? { duration: 0 } : INDICATOR_SPRING
              }
            />
          ) : null}

          {options.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className={cn(
                triggerBaseClass,
                "transition-colors duration-200",
                onImage
                  ? nested
                    ? cn(
                        "font-normal text-[rgb(255_252_249/0.88)]",
                        "[text-shadow:0_1px_2px_rgb(0_0_0/38%)]",
                        "hover:text-[rgb(255_252_249/0.96)]",
                        "data-active:text-foreground data-active:font-semibold data-active:[text-shadow:none]",
                      )
                    : "text-white/75 hover:text-white data-active:text-foreground data-active:font-semibold"
                  : "data-active:text-foreground data-active:font-semibold",
              )}
            >
              <span className="block w-full truncate text-center">
                {option.label}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
