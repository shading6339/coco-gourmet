import type { JSX } from "react";
import { Loader2 } from "lucide-react";

import { TEXT } from "@/constants/text";
import {
  overscrollNextKeypointOffset,
  overscrollNextProgress,
} from "@/lib/pagination/overscroll-next-page";
import { cn } from "@/lib/utils";

type PullNextPageRefreshFooterProps = {
  pullOffset: number;
  pullDistance: number;
  isCommitted: boolean;
  isRefreshing: boolean;
  hasNextPage: boolean;
};

/** スピナー(24px) + gap(12px) + ラベル(16px) + 上下余白 */
const SPINNER_LAYOUT_MIN_HEIGHT = 68;

/**
 * pull-to-refresh 下端版。
 * 次ページがあるときは常にヒントを表示し、引っ張り中は高さを伸ばす。
 */
export function PullNextPageRefreshFooter({
  pullOffset,
  pullDistance,
  isCommitted,
  isRefreshing,
  hasNextPage,
}: PullNextPageRefreshFooterProps): JSX.Element | null {
  if (!hasNextPage && !isRefreshing) return null;

  const idleHeight = overscrollNextKeypointOffset();
  const isPulling = pullDistance > 0 && !isRefreshing;
  const showSpinner = isPulling || isCommitted || isRefreshing;
  const contentMinHeight = showSpinner
    ? SPINNER_LAYOUT_MIN_HEIGHT
    : idleHeight;
  const slotHeight = isRefreshing
    ? contentMinHeight
    : hasNextPage
      ? Math.max(pullOffset, contentMinHeight)
      : Math.max(pullOffset, 0);

  if (slotHeight <= 0) return null;

  const progress = overscrollNextProgress(pullDistance);
  const showIdleBounce = !isPulling && !isCommitted && !isRefreshing;
  const label = isRefreshing
    ? TEXT.pagination.pullNextPageLoading
    : isCommitted
      ? TEXT.pagination.pullNextPageCommit
      : TEXT.pagination.pullNextPagePull;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none flex items-center justify-center overflow-hidden"
      style={{ height: slotHeight }}
    >
      <div
        className={cn(
          "flex shrink-0 flex-col items-center",
          showSpinner ? "gap-3" : undefined,
        )}
      >
        {showSpinner ? (
          <Loader2
            aria-hidden
            className={cn(
              "size-6 shrink-0 text-primary transition-opacity duration-150",
              isRefreshing && "animate-spin",
            )}
            style={
              isRefreshing
                ? undefined
                : {
                    transform: `rotate(${progress * 360}deg)`,
                    opacity: 0.35 + progress * 0.65,
                  }
            }
          />
        ) : null}
        <p
          className={cn(
            "shrink-0 text-xs font-medium leading-none transition-[color,opacity] duration-150",
            isCommitted || isRefreshing
              ? "text-primary"
              : "text-muted-foreground",
            showIdleBounce && "pull-next-hint-bounce",
          )}
          style={
            isPulling
              ? { opacity: 0.55 + progress * 0.45 }
              : undefined
          }
        >
          {label}
        </p>
      </div>
    </div>
  );
}
