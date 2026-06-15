"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type JSX,
  type PointerEvent as ReactPointerEvent,
} from "react";

import {
  BUDGET_SLIDER_MIN,
  BUDGET_SLIDER_OPEN_MAX,
  BUDGET_SNAP_POINTS,
  HOTPEPPER_BUDGET_TIERS,
} from "@/constants/budget-range";
import {
  equalWidthPercentToBudgetValue,
  formatBudgetRangeLabel,
  getSnapPointIndex,
  snapBudgetValue,
  stepSnapPoint,
  tierOverlapsBudgetRange,
  valueToEqualWidthPercent,
} from "@/lib/search/budget-range";
import { cn } from "@/lib/utils";

type ActiveThumb = "min" | "max" | null;

type BudgetRangeSliderProps = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  /** 予算帯ごとの店舗数 */
  histogramCounts?: readonly number[];
  className?: string;
  disabled?: boolean;
};

function clampDraftRange(
  thumb: Exclude<ActiveThumb, null>,
  draftMin: number,
  draftMax: number,
  nextValue: number,
  shouldSnap: boolean,
): { min: number; max: number } {
  if (!shouldSnap) {
    const clamped = Math.min(
      BUDGET_SLIDER_OPEN_MAX,
      Math.max(BUDGET_SLIDER_MIN, nextValue),
    );

    if (thumb === "min") {
      return {
        min: Math.min(clamped, draftMax - 1),
        max: draftMax,
      };
    }

    return {
      min: draftMin,
      max: Math.max(clamped, draftMin + 1),
    };
  }

  const snapped = snapBudgetValue(nextValue);
  const minIndex = getSnapPointIndex(draftMin);
  const maxIndex = getSnapPointIndex(draftMax);

  if (thumb === "min") {
    const targetIndex = getSnapPointIndex(snapped);
    const clampedIndex = Math.min(targetIndex, maxIndex - 1);
    return {
      min: BUDGET_SNAP_POINTS[Math.max(0, clampedIndex)],
      max: draftMax,
    };
  }

  const targetIndex = getSnapPointIndex(snapped);
  const clampedIndex = Math.max(targetIndex, minIndex + 1);
  return {
    min: draftMin,
    max: BUDGET_SNAP_POINTS[
      Math.min(BUDGET_SNAP_POINTS.length - 1, clampedIndex)
    ],
  };
}

export function BudgetRangeSlider({
  min,
  max,
  onChange,
  histogramCounts = [],
  className,
  disabled = false,
}: BudgetRangeSliderProps): JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null);
  const labelId = useId();
  const [activeThumb, setActiveThumb] = useState<ActiveThumb>(null);
  const [snapPulse, setSnapPulse] = useState<ActiveThumb>(null);
  const [draftMin, setDraftMin] = useState(min);
  const [draftMax, setDraftMax] = useState(max);

  useEffect(() => {
    if (!activeThumb) {
      setDraftMin(min);
      setDraftMax(max);
    }
  }, [activeThumb, max, min]);

  const snapPulseTimerRef = useRef<number | null>(null);

  const emitSnapPulse = useCallback((thumb: ActiveThumb): void => {
    if (!thumb) return;
    if (snapPulseTimerRef.current !== null) {
      window.clearTimeout(snapPulseTimerRef.current);
    }
    setSnapPulse(thumb);
    snapPulseTimerRef.current = window.setTimeout(() => {
      snapPulseTimerRef.current = null;
      setSnapPulse((current) => (current === thumb ? null : current));
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (snapPulseTimerRef.current !== null) {
        window.clearTimeout(snapPulseTimerRef.current);
      }
    };
  }, []);

  const updateFromPointer = useCallback(
    (
      clientX: number,
      thumb: Exclude<ActiveThumb, null>,
      shouldSnap: boolean,
    ): { min: number; max: number } => {
      const track = trackRef.current;
      if (!track) {
        return { min: draftMin, max: draftMax };
      }

      const rect = track.getBoundingClientRect();
      const percent = ((clientX - rect.left) / rect.width) * 100;
      const rawValue = equalWidthPercentToBudgetValue(percent);

      return clampDraftRange(thumb, draftMin, draftMax, rawValue, shouldSnap);
    },
    [draftMax, draftMin],
  );

  const handlePointerDown =
    (thumb: Exclude<ActiveThumb, null>) =>
    (event: ReactPointerEvent<HTMLButtonElement>): void => {
      if (disabled) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setActiveThumb(thumb);
      const next = updateFromPointer(event.clientX, thumb, false);
      setDraftMin(next.min);
      setDraftMax(next.max);
    };

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>): void => {
      if (!activeThumb || disabled) return;
      const next = updateFromPointer(event.clientX, activeThumb, false);
      setDraftMin(next.min);
      setDraftMax(next.max);
    },
    [activeThumb, disabled, updateFromPointer],
  );

  const handlePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>): void => {
      if (!activeThumb || disabled) return;

      const next = updateFromPointer(event.clientX, activeThumb, true);
      setDraftMin(next.min);
      setDraftMax(next.max);
      onChange(next.min, next.max);
      emitSnapPulse(activeThumb);
      setActiveThumb(null);
      event.currentTarget.releasePointerCapture(event.pointerId);
    },
    [activeThumb, disabled, emitSnapPulse, onChange, updateFromPointer],
  );

  useEffect(() => {
    if (!activeThumb) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      const direction: -1 | 1 =
        event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 1;
      if (
        event.key !== "ArrowLeft" &&
        event.key !== "ArrowRight" &&
        event.key !== "ArrowUp" &&
        event.key !== "ArrowDown"
      ) {
        return;
      }

      event.preventDefault();

      if (activeThumb === "min") {
        const nextMin = stepSnapPoint(draftMin, direction);
        const next = clampDraftRange("min", nextMin, draftMax, nextMin, true);
        setDraftMin(next.min);
        setDraftMax(next.max);
        onChange(next.min, next.max);
        emitSnapPulse("min");
      }

      if (activeThumb === "max") {
        const nextMax = stepSnapPoint(draftMax, direction);
        const next = clampDraftRange("max", draftMin, nextMax, nextMax, true);
        setDraftMin(next.min);
        setDraftMax(next.max);
        onChange(next.min, next.max);
        emitSnapPulse("max");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeThumb, draftMax, draftMin, emitSnapPulse, onChange]);

  const displayMin = activeThumb ? draftMin : min;
  const displayMax = activeThumb ? draftMax : max;
  const snappedMin = snapBudgetValue(displayMin);
  const snappedMax = snapBudgetValue(displayMax);
  const minPercent = valueToEqualWidthPercent(displayMin);
  const maxPercent = valueToEqualWidthPercent(displayMax);
  const label = formatBudgetRangeLabel(snappedMin, snappedMax);
  const maxHistogramCount = useMemo(
    () => histogramCounts.reduce((peak, count) => Math.max(peak, count), 0),
    [histogramCounts],
  );
  const hasHistogram = maxHistogramCount > 0;

  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <span id={labelId} className="text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="text-[11px] text-muted-foreground">予算帯にスナップ</span>
      </div>

      <div
        ref={trackRef}
        className={cn(
          "relative h-12 touch-none select-none",
          disabled && "opacity-50",
        )}
        aria-disabled={disabled}
      >
        {hasHistogram ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-1 flex h-7 items-end gap-px"
            aria-hidden
          >
            {HOTPEPPER_BUDGET_TIERS.map((tier, index) => {
              const count = histogramCounts[index] ?? 0;
              const heightPercent = (count / maxHistogramCount) * 100;
              const inRange = tierOverlapsBudgetRange(
                tier,
                snappedMin,
                snappedMax,
              );

              return (
                <div
                  key={tier.code}
                  className={cn(
                    "min-w-0 flex-1 rounded-t-[2px] transition-colors duration-200",
                    inRange ? "bg-primary/22" : "bg-muted-foreground/12",
                  )}
                  style={{
                    height: `${Math.max(count > 0 ? 14 : 0, heightPercent)}%`,
                  }}
                />
              );
            })}
          </div>
        ) : null}

        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-surface-muted/80" />
        <div
          className={cn(
            "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary/70",
            activeThumb ? "transition-none" : "transition-all duration-200 ease-out",
          )}
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {(["min", "max"] as const).map((thumb) => {
          const value = thumb === "min" ? displayMin : displayMax;
          const percent = valueToEqualWidthPercent(value);

          return (
            <button
              key={thumb}
              type="button"
              aria-labelledby={labelId}
              aria-label={thumb === "min" ? "下限予算" : "上限予算"}
              role="slider"
              aria-valuemin={BUDGET_SLIDER_MIN}
              aria-valuemax={BUDGET_SLIDER_OPEN_MAX}
              aria-valuenow={snapBudgetValue(value)}
              aria-valuetext={label}
              disabled={disabled}
              onPointerDown={handlePointerDown(thumb)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={cn(
                "absolute top-1/2 z-10 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-surface shadow-sm outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary/40",
                activeThumb || snapPulse === thumb
                  ? "transition-transform duration-200 ease-out"
                  : "transition-[left,transform] duration-200 ease-out",
                (activeThumb === thumb || snapPulse === thumb) && "scale-110",
              )}
              style={{ left: `${percent}%` }}
            />
          );
        })}
      </div>
    </div>
  );
}
