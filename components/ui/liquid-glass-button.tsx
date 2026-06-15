"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";

import { LIQUID_SPRING } from "@/lib/motion/liquid-spring";
import { cn } from "@/lib/utils";

type LiquidGlassButtonVariant = "glass" | "primary" | "on-glass";

type LiquidGlassButtonProps = Omit<
  HTMLMotionProps<"button">,
  "ref"
> & {
  variant?: LiquidGlassButtonVariant;
  /** カプセル(pill)で表示。false で rounded-[var(--radius-float)] */
  pill?: boolean;
};

const VARIANT_CLASS: Record<LiquidGlassButtonVariant, string> = {
  // L3 浮遊ガラス（背景が透ける）
  glass: "glass-float text-foreground",
  // 主要 CTA: 不透明 primary + ガラスのエッジ感
  primary:
    "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25),var(--shadow-float)]",
  // すでにガラス面の上に乗る軽量ボタン（二重ガラス回避）
  "on-glass":
    "bg-surface/70 text-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]",
};

/**
 * Liquid Glass ボタン（docs/liquid-glass.md §4.1）。
 * 押下で「潰れて広がる」(scaleY↓ + scaleX↑)、離すと Release spring で揺り戻す。
 * reduced-motion では物理アニメを停止し opacity/色のみ。
 */
export const LiquidGlassButton = React.forwardRef<
  HTMLButtonElement,
  LiquidGlassButtonProps
>(function LiquidGlassButton(
  { className, variant = "glass", pill = true, children, ...props },
  ref,
) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      ref={ref}
      type="button"
      data-slot="liquid-glass-button"
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center gap-1.5",
        "text-sm font-semibold outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        pill ? "rounded-full" : "rounded-[var(--radius-float)]",
        VARIANT_CLASS[variant],
        className,
      )}
      style={{ transformOrigin: "center bottom" }}
      whileTap={
        reduceMotion
          ? undefined
          : {
              // 接地: Z方向に縮み、四隅が外へ広がる
              scaleY: 0.92,
              scaleX: 1.04,
              transition: LIQUID_SPRING.active,
            }
      }
      transition={LIQUID_SPRING.release}
      {...props}
    >
      {children}
    </motion.button>
  );
});
