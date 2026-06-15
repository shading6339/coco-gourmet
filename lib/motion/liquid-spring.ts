import type { Transition } from "motion/react";

/**
 * Liquid Glass の状態別 spring（docs/liquid-glass.md §3）。
 * Active=潰れて広がる / Release=プルン揺り戻し / Morph=溶けて流れる。
 */
export const LIQUID_SPRING = {
  active: { type: "spring", stiffness: 520, damping: 18 },
  release: { type: "spring", stiffness: 320, damping: 12, mass: 0.9 },
  morph: { type: "spring", stiffness: 380, damping: 30, mass: 1 },
} as const satisfies Record<string, Transition>;
