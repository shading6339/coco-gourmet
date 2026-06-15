"use client";

import * as React from "react";

import { TEXT } from "@/constants/text";
import { formatPageScrubContext } from "@/lib/pagination/format-result-count";
import { cn } from "@/lib/utils";

const LONG_PRESS_MS = 420;
const LONG_PRESS_CANCEL_MOVE_PX = 14;
const TAP_HINT_MS = 600;

/** スクラブオーバーレイの高さ（下基準で上に伸びる） */
const PAGINATION_SCRUB_OVERLAY_HEIGHT_CLASS = "h-40";

/** n/max 行の高さ（py-1.5 + h-8 ラベル + gap-1 + h-1.5 トラック） */
const PAGINATION_BAR_ROW_HEIGHT_CLASS = "h-[3.375rem]";

function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), totalPages);
}

function clampRatio(ratio: number): number {
  return Math.min(Math.max(ratio, 0), 1);
}

function ratioFromTrackX(clientX: number, rect: DOMRect): number {
  return clampRatio((clientX - rect.left) / rect.width);
}

function pageFromRatio(ratio: number, totalPages: number): number {
  if (totalPages <= 1) return 1;
  return clampPage(Math.round(ratio * (totalPages - 1)) + 1, totalPages);
}

function triggerHaptic(): void {
  navigator.vibrate?.(10);
}

type UsePaginationPageScrubOptions = {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
  onScrubbingChange?: (isScrubbing: boolean) => void;
};

type PaginationPageScrubState = {
  isScrubbing: boolean;
  showTapHint: boolean;
  displayPage: number;
  previewRatio: number;
  displayValue: string;
  triggerProps: {
    disabled: boolean;
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
    onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
    onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  };
  overlayProps: {
    displayPage: number;
    totalPages: number;
    previewRatio: number;
    trackRef: React.RefObject<HTMLDivElement | null>;
    onOverlayMount: (overlay: HTMLDivElement) => void;
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  };
};

function usePaginationPageScrub({
  currentPage,
  totalPages,
  disabled = false,
  onPageChange,
  onScrubbingChange,
}: UsePaginationPageScrubOptions): PaginationPageScrubState {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const tapHintTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isScrubbingRef = React.useRef(false);
  const pointerStartRef = React.useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);
  const captureTargetRef = React.useRef<HTMLDivElement | null>(null);
  const pendingPointerIdRef = React.useRef<number | null>(null);
  const pendingClientXRef = React.useRef<number | null>(null);

  const [isScrubbing, setIsScrubbing] = React.useState(false);
  const [showTapHint, setShowTapHint] = React.useState(false);
  const [previewPage, setPreviewPage] = React.useState(currentPage);
  const [previewRatio, setPreviewRatio] = React.useState(0);

  const displayPage = isScrubbing ? previewPage : currentPage;
  const displayValue = `${displayPage} / ${totalPages}`;

  const clearLongPressTimer = React.useCallback((): void => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const clearTapHintTimer = React.useCallback((): void => {
    if (tapHintTimerRef.current) {
      clearTimeout(tapHintTimerRef.current);
      tapHintTimerRef.current = null;
    }
  }, []);

  const dismissTapHint = React.useCallback((): void => {
    clearTapHintTimer();
    setShowTapHint(false);
  }, [clearTapHintTimer]);

  const revealTapHint = React.useCallback((): void => {
    clearTapHintTimer();
    setShowTapHint(true);
    tapHintTimerRef.current = setTimeout(() => {
      setShowTapHint(false);
      tapHintTimerRef.current = null;
    }, TAP_HINT_MS);
  }, [clearTapHintTimer]);

  const readRatioFromPointer = React.useCallback((clientX: number): number => {
    const track = trackRef.current;
    if (!track) {
      if (totalPages <= 1) return 0;
      return (currentPage - 1) / (totalPages - 1);
    }
    return ratioFromTrackX(clientX, track.getBoundingClientRect());
  }, [currentPage, totalPages]);

  const updatePreview = React.useCallback(
    (clientX: number): void => {
      const ratio = readRatioFromPointer(clientX);
      const nextPage = pageFromRatio(ratio, totalPages);

      setPreviewRatio(ratio);
      setPreviewPage((prev) => {
        if (nextPage !== prev) {
          triggerHaptic();
        }
        return nextPage;
      });
    },
    [readRatioFromPointer, totalPages],
  );

  const activateScrub = React.useCallback(
    (pointerId: number, clientX: number): void => {
      if (isScrubbingRef.current) return;

      dismissTapHint();
      pendingPointerIdRef.current = pointerId;
      pendingClientXRef.current = clientX;
      isScrubbingRef.current = true;
      setIsScrubbing(true);
      onScrubbingChange?.(true);

      const initialRatio =
        totalPages <= 1 ? 0 : (currentPage - 1) / (totalPages - 1);
      setPreviewPage(currentPage);
      setPreviewRatio(initialRatio);
      triggerHaptic();
    },
    [currentPage, dismissTapHint, onScrubbingChange, totalPages],
  );

  const attachOverlayCapture = React.useCallback(
    (overlay: HTMLDivElement): void => {
      const pointerId = pendingPointerIdRef.current;
      const clientX = pendingClientXRef.current;
      if (pointerId === null) return;

      captureTargetRef.current = overlay;
      overlay.setPointerCapture(pointerId);
      pendingPointerIdRef.current = null;

      if (clientX !== null) {
        requestAnimationFrame(() => {
          updatePreview(clientX);
        });
      }
    },
    [updatePreview],
  );

  const finishScrub = React.useCallback(
    (pointerId: number, clientX: number): void => {
      const target = captureTargetRef.current;
      if (!target || !isScrubbingRef.current) return;

      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }

      const confirmedPage = pageFromRatio(readRatioFromPointer(clientX), totalPages);
      isScrubbingRef.current = false;
      setIsScrubbing(false);
      onScrubbingChange?.(false);
      captureTargetRef.current = null;
      setPreviewPage(currentPage);
      setPreviewRatio(
        totalPages <= 1 ? 0 : (currentPage - 1) / (totalPages - 1),
      );

      if (confirmedPage !== currentPage) {
        onPageChange(confirmedPage);
      }
    },
    [currentPage, onPageChange, onScrubbingChange, readRatioFromPointer, totalPages],
  );

  const cancelScrub = React.useCallback(
    (pointerId: number): void => {
      const target = captureTargetRef.current;
      if (!target || !isScrubbingRef.current) return;

      if (target.hasPointerCapture(pointerId)) {
        target.releasePointerCapture(pointerId);
      }

      isScrubbingRef.current = false;
      setIsScrubbing(false);
      onScrubbingChange?.(false);
      captureTargetRef.current = null;
      setPreviewPage(currentPage);
      setPreviewRatio(
        totalPages <= 1 ? 0 : (currentPage - 1) / (totalPages - 1),
      );
    },
    [currentPage, onScrubbingChange, totalPages],
  );

  React.useEffect(() => {
    return () => {
      clearLongPressTimer();
      clearTapHintTimer();
      onScrubbingChange?.(false);
    };
  }, [clearLongPressTimer, clearTapHintTimer, onScrubbingChange]);

  React.useEffect(() => {
    if (!isScrubbing) {
      setPreviewPage(currentPage);
      setPreviewRatio(
        totalPages <= 1 ? 0 : (currentPage - 1) / (totalPages - 1),
      );
    }
  }, [currentPage, isScrubbing, totalPages]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      if (disabled) return;

      event.preventDefault();
      clearLongPressTimer();
      dismissTapHint();

      pointerStartRef.current = {
        x: event.clientX,
        y: event.clientY,
        pointerId: event.pointerId,
      };

      if (isScrubbingRef.current) {
        captureTargetRef.current = event.currentTarget;
        event.currentTarget.setPointerCapture(event.pointerId);
        updatePreview(event.clientX);
        return;
      }

      longPressTimerRef.current = setTimeout(() => {
        const start = pointerStartRef.current;
        if (!start) return;
        activateScrub(start.pointerId, start.x);
      }, LONG_PRESS_MS);
    },
    [activateScrub, clearLongPressTimer, disabled, dismissTapHint, updatePreview],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      const start = pointerStartRef.current;
      if (!start) return;

      if (!isScrubbingRef.current) {
        const moved = Math.hypot(
          event.clientX - start.x,
          event.clientY - start.y,
        );
        if (moved > LONG_PRESS_CANCEL_MOVE_PX) {
          clearLongPressTimer();
        }
        return;
      }

      updatePreview(event.clientX);
    },
    [clearLongPressTimer, updatePreview],
  );

  const handlePointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      clearLongPressTimer();

      const start = pointerStartRef.current;

      if (isScrubbingRef.current) {
        finishScrub(event.pointerId, event.clientX);
      } else if (start && !disabled) {
        const moved = Math.hypot(
          event.clientX - start.x,
          event.clientY - start.y,
        );
        if (moved <= LONG_PRESS_CANCEL_MOVE_PX) {
          revealTapHint();
        }
      }

      pointerStartRef.current = null;
    },
    [clearLongPressTimer, disabled, finishScrub, revealTapHint],
  );

  const handlePointerCancel = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>): void => {
      clearLongPressTimer();

      if (isScrubbingRef.current) {
        cancelScrub(event.pointerId);
      }

      pointerStartRef.current = null;
    },
    [cancelScrub, clearLongPressTimer],
  );

  const handleContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      event.preventDefault();
    },
    [],
  );

  const handleTriggerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (disabled) return;
      if (event.key !== "Enter" && event.key !== " ") return;

      event.preventDefault();
      revealTapHint();
    },
    [disabled, revealTapHint],
  );

  return {
    isScrubbing,
    showTapHint,
    displayPage,
    previewRatio,
    displayValue,
    triggerProps: {
      disabled,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onContextMenu: handleContextMenu,
      onKeyDown: handleTriggerKeyDown,
    },
    overlayProps: {
      displayPage,
      totalPages,
      previewRatio,
      trackRef,
      onOverlayMount: attachOverlayCapture,
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
  };
}

type PaginationPageScrubTriggerProps = {
  displayValue: string;
  displayPage: number;
  totalPages: number;
  isScrubbing: boolean;
  showTapHint: boolean;
  className?: string;
} & PaginationPageScrubState["triggerProps"];

/** 通常時の n/max + ミニトラック（スライダー操作の affordance） */
function PaginationPageScrubTrigger({
  displayValue,
  displayPage,
  totalPages,
  isScrubbing,
  showTapHint,
  disabled,
  className,
  ...handlers
}: PaginationPageScrubTriggerProps): React.JSX.Element {
  const thumbLeftPercent =
    totalPages <= 1 ? 0 : ((displayPage - 1) / (totalPages - 1)) * 100;

  return (
    <div
      role="slider"
      aria-label={TEXT.pagination.openPagePickerLabel}
      aria-valuemin={1}
      aria-valuemax={totalPages}
      aria-valuenow={displayPage}
      aria-valuetext={`${TEXT.pagination.pageLabel} ${displayValue}`}
      aria-current="page"
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      {...handlers}
      data-slot="page-scrub-trigger"
      className={cn(
        "relative col-start-2 row-start-1 flex h-full min-h-0 w-full touch-none flex-col items-stretch justify-center gap-1 rounded-md border border-primary/25 bg-surface px-2.5 py-1.5 text-foreground tabular-nums shadow-[var(--shadow-card)] outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "pointer-events-none opacity-50",
        isScrubbing && "pointer-events-none opacity-0",
        className,
      )}
    >
      <div className="grid h-8 shrink-0 place-items-center">
        <span
          className={cn(
            "col-start-1 row-start-1 text-center text-sm font-semibold leading-none text-foreground transition-opacity duration-200 ease-out",
            showTapHint ? "opacity-0" : "opacity-100",
          )}
        >
          {displayValue}
        </span>
        <span
          aria-live="polite"
          className={cn(
            "col-start-1 row-start-1 whitespace-pre-line px-0.5 text-center text-[0.6875rem] font-semibold leading-tight text-primary transition-opacity duration-200 ease-out",
            showTapHint ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          {TEXT.pagination.pageScrubTapHint}
        </span>
      </div>

      <div
        aria-hidden
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-border/55"
      >
        <div
          className="h-full rounded-full bg-primary/35"
          style={{ width: `${thumbLeftPercent}%` }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_1px_var(--surface)]"
          style={{ left: `${thumbLeftPercent}%` }}
        />
      </div>
    </div>
  );
}

type PaginationPageScrubOverlayProps = PaginationPageScrubState["overlayProps"];

/** 長押し後の全幅スクラブ面（グリッド上に重ねる） */
function PaginationPageScrubOverlay({
  displayPage,
  totalPages,
  previewRatio,
  trackRef,
  onOverlayMount,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
}: PaginationPageScrubOverlayProps): React.JSX.Element {
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const needleLeftPercent = previewRatio * 100;

  React.useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      onOverlayMount(overlay);
    }
  }, [onOverlayMount]);

  return (
    <div
      ref={overlayRef}
      role="presentation"
      className={cn(
        "page-scrub-expand absolute right-0 bottom-0 left-0 z-50 col-start-1 col-end-4 row-start-1 flex touch-none flex-col justify-end gap-2.5 overflow-hidden rounded-xl border-2 border-primary/25 bg-surface px-3 py-3 shadow-lg select-none",
        PAGINATION_SCRUB_OVERLAY_HEIGHT_CLASS,
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <div
        aria-live="assertive"
        className="flex min-h-0 shrink-0 flex-col items-center justify-center gap-0.5 py-0.5"
      >
        <span className="font-brand text-[2.75rem] font-bold leading-[1.1] text-primary tabular-nums">
          {displayPage}
        </span>
        <span className="text-xs font-medium leading-tight text-muted-foreground tabular-nums">
          {formatPageScrubContext(totalPages)}
        </span>
      </div>

      <div className="relative h-12 shrink-0 rounded-lg bg-surface-muted px-3 shadow-[inset_0_3px_10px_rgb(0_0_0/0.12)]">
        <div
          ref={trackRef}
          className="relative h-full w-full"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 overflow-hidden rounded-full bg-border/60"
          >
            <div
              className="h-full rounded-full bg-primary/50"
              style={{ width: `${needleLeftPercent}%` }}
            />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 z-1 h-10 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-[1px] bg-[#e42b2b] shadow-[0_0_12px_rgb(228_43_43/0.9),inset_0_0_0_1px_rgb(255_200_200/0.6)]"
            style={{ left: `${needleLeftPercent}%` }}
          />

          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-0 text-[0.6875rem] font-semibold text-muted-foreground tabular-nums"
          >
            1
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 text-[0.6875rem] font-semibold text-muted-foreground tabular-nums"
          >
            {totalPages}
          </span>
        </div>
      </div>
    </div>
  );
}

type PaginationPageScrubberProps = {
  currentPage: number;
  totalPages: number;
  disabled?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
  onScrubbingChange?: (isScrubbing: boolean) => void;
};

function PaginationPageScrubber({
  currentPage,
  totalPages,
  disabled = false,
  onPageChange,
  onScrubbingChange,
  className,
}: PaginationPageScrubberProps): React.JSX.Element {
  const scrub = usePaginationPageScrub({
    currentPage,
    totalPages,
    disabled,
    onPageChange,
    onScrubbingChange,
  });

  return (
    <div className="contents">
      <PaginationPageScrubTrigger
        {...scrub.triggerProps}
        displayValue={scrub.displayValue}
        displayPage={scrub.displayPage}
        totalPages={totalPages}
        isScrubbing={scrub.isScrubbing}
        showTapHint={scrub.showTapHint}
        className={className}
      />
      {scrub.isScrubbing ? (
        <PaginationPageScrubOverlay {...scrub.overlayProps} />
      ) : null}
    </div>
  );
}

export {
  PAGINATION_BAR_ROW_HEIGHT_CLASS,
  PaginationPageScrubber,
  PaginationPageScrubOverlay,
  PaginationPageScrubTrigger,
  usePaginationPageScrub,
};
