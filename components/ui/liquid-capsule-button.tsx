"use client";

import type { JSX } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import { LIQUID_SPRING } from "@/lib/motion/liquid-spring";
import { cn } from "@/lib/utils";

/** AppBar カプセルと同じ L3 浮遊ガラス容器 */
export const APP_BAR_CAPSULE_CLASS =
  "glass-float box-border rounded-full px-2 py-1";

/** AppBar 内の横並び行（高さ h-10 固定） */
export const APP_BAR_CAPSULE_ROW_CLASS = "flex h-10 w-full items-center gap-1";

/** 詳細検索フッター用（タップしやすい高さ） */
export const FILTER_FOOTER_CAPSULE_CLASS = cn(APP_BAR_CAPSULE_CLASS, "py-1.5");

export const FILTER_FOOTER_ROW_CLASS =
  "flex h-12 w-full items-center gap-1.5";

/** 条件パネル等の浮遊シート（背面透け抑制の強めガラス） */
export const APP_BAR_FLOAT_PANEL_CLASS =
  "glass-float-panel box-border min-h-0 overflow-hidden rounded-float";

export const LIQUID_CAPSULE_BUTTON_CLASS = cn(
  "inline-flex shrink-0 select-none items-center justify-center rounded-full",
  "text-sm font-semibold outline-none",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  "disabled:pointer-events-none disabled:opacity-50",
);

type LiquidCapsuleButtonVariant = "ghost" | "input" | "primary";

const VARIANT_CLASS: Record<LiquidCapsuleButtonVariant, string> = {
  ghost: "text-foreground",
  input: "bg-input text-muted-foreground",
  primary: "bg-primary text-primary-foreground",
};

type LiquidCapsuleButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: LiquidCapsuleButtonVariant;
};

/**
 * AppBar カプセル内ボタンと同じ見た目・押下物理。
 * アイコン／テキストどちらにも使う。
 */
export function LiquidCapsuleButton({
  className,
  variant = "ghost",
  children,
  ...props
}: LiquidCapsuleButtonProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      data-slot="liquid-capsule-button"
      className={cn(
        LIQUID_CAPSULE_BUTTON_CLASS,
        VARIANT_CLASS[variant],
        className,
      )}
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
