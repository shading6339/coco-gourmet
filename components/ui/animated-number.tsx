"use client";

import { useEffect, type JSX } from "react";
import {
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

type AnimatedNumberProps = {
  value: number;
  className?: string;
};

/**
 * ローリング数値カウンタ（tabular-nums 前提）。
 * 値の変化を旧値→新値へ素早く流し、ローディングを感じさせない。
 * prefers-reduced-motion では即時切替。
 */
export function AnimatedNumber({
  value,
  className,
}: AnimatedNumberProps): JSX.Element {
  const reduceMotion = useReducedMotion();
  const spring = useSpring(value, { stiffness: 280, damping: 32 });

  useEffect(() => {
    if (reduceMotion) {
      spring.jump(value);
    } else {
      spring.set(value);
    }
  }, [reduceMotion, spring, value]);

  const display = useTransform(spring, (latest) =>
    Math.round(latest).toLocaleString("ja-JP"),
  );

  return (
    <motion.span className={className} aria-hidden>
      {display}
    </motion.span>
  );
}
