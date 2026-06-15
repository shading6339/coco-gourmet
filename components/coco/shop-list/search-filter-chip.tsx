import type { JSX } from "react";
import { Check, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { SearchSelectionMode } from "@/components/coco/shop-list/search-field-group";
import { LIQUID_SPRING } from "@/lib/motion/liquid-spring";
import { cn } from "@/lib/utils";

type SearchFilterChipProps = {
  label: string;
  active?: boolean;
  mode?: SearchSelectionMode;
  onToggle?: () => void;
  onRemove?: () => void;
  className?: string;
};

/** 詳細検索用チップ（単一＝丸型、複数＝角丸＋チェック） */
export function SearchFilterChip({
  label,
  active = false,
  mode = "multiple",
  onToggle,
  onRemove,
  className,
}: SearchFilterChipProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  if (onRemove) {
    return (
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
          className,
        )}
      >
        <span className="truncate">{label}</span>
        <button
          type="button"
          aria-label={`${label}を外す`}
          onClick={onRemove}
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full",
            "text-primary/80 hover:bg-primary/15 hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        >
          <X className="size-3" aria-hidden />
        </button>
      </span>
    );
  }

  const isSingle = mode === "single";

  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      style={{ transformOrigin: "center bottom" }}
      whileTap={
        reduceMotion
          ? undefined
          : { scaleY: 0.9, scaleX: 1.05, transition: LIQUID_SPRING.active }
      }
      transition={LIQUID_SPRING.release}
      className={cn(
        "relative isolate inline-flex max-w-full items-center gap-1.5 border px-3 py-1.5 text-xs font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isSingle ? "rounded-full" : "rounded-lg",
        // 選択時の塗りは充填レイヤで表現（design-system: primary-container）
        active
          ? "border-primary text-primary-container-foreground"
          : "border-border bg-surface text-foreground hover:bg-surface-muted",
        className,
      )}
    >
      {/* 選択で満ちる: layout なしの spring scale でせり上がる */}
      {active ? (
        <motion.span
          aria-hidden
          initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={LIQUID_SPRING.morph}
          className={cn(
            "pointer-events-none absolute inset-0 z-0 bg-primary-container",
            isSingle ? "rounded-full" : "rounded-lg",
          )}
        />
      ) : null}
      {active && !isSingle ? (
        <Check className="relative z-10 size-3 shrink-0" aria-hidden />
      ) : null}
      {active && isSingle ? (
        <span
          className="relative z-10 size-1.5 shrink-0 rounded-full bg-primary"
          aria-hidden
        />
      ) : null}
      <span className="relative z-10 truncate">{label}</span>
    </motion.button>
  );
}
