"use client";

import type { JSX } from "react";
import { Heart, History, House, Search } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import {
  LiquidGlassContainer,
  LiquidGlassIndicator,
} from "@/components/ui/liquid-glass-container";
import { LIQUID_SPRING } from "@/lib/motion/liquid-spring";
import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";

export type BottomNavTab = "home" | "search" | "history" | "favorites";

const NAV_ITEMS: ReadonlyArray<{
  tab: BottomNavTab;
  label: string;
  icon: typeof House;
}> = [
  { tab: "home", label: TEXT.common.navHome, icon: House },
  { tab: "search", label: TEXT.common.navSearch, icon: Search },
  { tab: "history", label: TEXT.common.navHistory, icon: History },
  { tab: "favorites", label: TEXT.common.navFavorites, icon: Heart },
];

type BottomNavProps = {
  active: BottomNavTab;
  onChange: (tab: BottomNavTab) => void;
  /** 詳細表示・フィルタ表示中は下へ退避 */
  hidden?: boolean;
  className?: string;
};

/** DS §10.6 + Liquid Glass: 角丸の浮遊バー・選択pill流動モーフ */
export function BottomNav({
  active,
  onChange,
  hidden = false,
  className,
}: BottomNavProps): JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[28rem]",
        "px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1",
        "transition-transform duration-[var(--motion-base)] ease-[var(--ease-out-soft)]",
        hidden && "translate-y-[calc(100%+1rem)]",
        className,
      )}
    >
      <LiquidGlassContainer className="glass-float rounded-[var(--radius-float)] p-1.5">
        <nav
          aria-label="メインナビゲーション"
          data-slot="bottom-nav"
          className="flex items-stretch gap-1"
        >
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
            const isActive = tab === active;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  onChange(tab);
                }}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset",
                  isActive
                    ? "text-primary-container-foreground"
                    : "text-muted-foreground",
                )}
              >
                {/* 選択pill: active タブ内に1つだけ描画 → layoutId で流動モーフ */}
                {isActive ? <LiquidGlassIndicator name="nav-pill" /> : null}

                <motion.span
                  className="flex flex-col items-center gap-0.5"
                  // 形状変化に遅れて沈む（テキスト/アイコン）
                  animate={
                    reduceMotion ? undefined : { scale: isActive ? 1 : 0.96 }
                  }
                  transition={LIQUID_SPRING.morph}
                >
                  <Icon
                    className="size-6"
                    strokeWidth={isActive ? 2.25 : 1.75}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-[10px] leading-none",
                      isActive ? "font-semibold" : "font-medium",
                    )}
                  >
                    {label}
                  </span>
                </motion.span>
              </button>
            );
          })}
        </nav>
      </LiquidGlassContainer>
    </div>
  );
}
