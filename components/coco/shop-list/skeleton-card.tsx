import type { CSSProperties, JSX } from "react";
import { cn } from "@/lib/utils";
import { RESTAURANT_LIST_CARD_GRID } from "@/constants/shopImage";

/** 横並び一覧カードのスケルトン */
export function SkeletonCard({
  className,
  delayMs = 0,
}: {
  className?: string;
  delayMs?: number;
}): JSX.Element {
  const skeletonStyle =
    delayMs === 0
      ? undefined
      : ({
          "--skeleton-delay": `${delayMs}ms`,
        } as CSSProperties);

  return (
    <article
      aria-hidden
      className={cn(
        RESTAURANT_LIST_CARD_GRID,
        "box-border overflow-hidden rounded-md bg-surface ring-1 ring-foreground/6 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="relative min-h-[4.25rem] h-full w-full min-w-0 self-stretch rounded-none bg-surface-muted">
        <div
          className="skeleton absolute inset-0 rounded-none"
          style={skeletonStyle}
        />
        <div
          className="skeleton absolute bottom-1 left-1 z-10 h-4 w-10 rounded-md"
          style={skeletonStyle}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-start gap-1 overflow-hidden py-2 pr-2">
        {/* 実カードの2行店名枠（min-h-[2.5rem]）をミラーして loading→loaded を不動に */}
        <div className="flex min-h-[2.5rem] flex-col gap-1">
          <div className="skeleton h-4 w-4/5 rounded-lg" style={skeletonStyle} />
          <div className="skeleton h-4 w-2/5 rounded-lg" style={skeletonStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <div
            className="skeleton h-3 w-full max-w-[90%] rounded-lg"
            style={skeletonStyle}
          />
          <div className="skeleton h-3 w-20 rounded-lg" style={skeletonStyle} />
          <div className="grid w-full min-w-0 grid-cols-2 gap-2">
            <div className="skeleton h-3 rounded-lg" style={skeletonStyle} />
            <div className="skeleton h-3 rounded-lg" style={skeletonStyle} />
          </div>
        </div>
        <div className="mt-1 flex h-5 w-full min-w-0 flex-nowrap items-center gap-1.5">
          <div
            className="skeleton h-5 w-14 shrink-0 rounded-full"
            style={skeletonStyle}
          />
          <div
            className="skeleton h-5 w-12 shrink-0 rounded-full"
            style={skeletonStyle}
          />
          <div
            className="skeleton h-5 w-8 shrink-0 rounded-full"
            style={skeletonStyle}
          />
        </div>
      </div>
    </article>
  );
}
