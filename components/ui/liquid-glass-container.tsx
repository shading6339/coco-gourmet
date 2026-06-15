"use client";

import * as React from "react";
import { LayoutGroup, motion, useReducedMotion, type Transition } from "motion/react";

import { LIQUID_SPRING } from "@/lib/motion/liquid-spring";
import { cn } from "@/lib/utils";

type LiquidGlassContextValue = {
  groupId: string;
  morph: Transition;
};

const LiquidGlassContext = React.createContext<LiquidGlassContextValue | null>(null);

let groupCounter = 0;

type LiquidGlassContainerProps = { children: React.ReactNode; className?: string };

/**
 * 複数 Liquid Glass 要素の統合管理（docs/liquid-glass.md §4.2）。
 * 配下の LiquidGlassIndicator が layoutId 共有で「溶けて流れる」選択モーフを行う。
 */
export function LiquidGlassContainer({ children, className }: LiquidGlassContainerProps): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const groupId = React.useMemo(() => {
    groupCounter += 1;
    return `liquid-glass-${groupCounter}`;
  }, []);

  const value = React.useMemo<LiquidGlassContextValue>(
    () => ({ groupId, morph: reduceMotion ? { duration: 0 } : LIQUID_SPRING.morph }),
    [groupId, reduceMotion],
  );

  return (
    <LiquidGlassContext.Provider value={value}>
      <LayoutGroup id={groupId}>
        <div data-slot="liquid-glass-container" className={className}>{children}</div>
      </LayoutGroup>
    </LiquidGlassContext.Provider>
  );
}

type LiquidGlassIndicatorProps = { name: string; className?: string };

/** 選択インジケータ。active な要素内に1つだけ描画すると layoutId 経由でモーフ移動する。 */
export function LiquidGlassIndicator({ name, className }: LiquidGlassIndicatorProps): React.JSX.Element {
  const ctx = React.useContext(LiquidGlassContext);
  const morph = ctx?.morph ?? LIQUID_SPRING.morph;
  const layoutId = ctx ? `${ctx.groupId}:${name}` : name;

  return (
    <motion.div
      aria-hidden
      layoutId={layoutId}
      transition={morph}
      className={cn("pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary-container", className)}
    />
  );
}
