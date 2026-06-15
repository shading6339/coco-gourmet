/** pull-to-refresh 相当の閾値（指の移動量 px） */
export const OVERSCROLL_NEXT_KEYPOINT = 72;

/** @deprecated OVERSCROLL_NEXT_KEYPOINT を使用 */
export const PULL_NEXT_PAGE_KEYPOINT = OVERSCROLL_NEXT_KEYPOINT;

/** ゴム紐の最大移動量（px） */
export const OVERSCROLL_NEXT_MAX_OFFSET = 160;

/** @deprecated OVERSCROLL_NEXT_MAX_OFFSET を使用 */
export const PULL_NEXT_PAGE_MAX_OFFSET = OVERSCROLL_NEXT_MAX_OFFSET;

/** 下端とみなすスクロール余白（px） — iOS の subpixel / アドレスバー余白を許容 */
export const OVERSCROLL_NEXT_BOTTOM_EPSILON = 28;

/** @deprecated OVERSCROLL_NEXT_BOTTOM_EPSILON を使用 */
export const PULL_NEXT_PAGE_BOTTOM_EPSILON = OVERSCROLL_NEXT_BOTTOM_EPSILON;

/** 引っ張り検知の最小移動量（px） */
export const OVERSCROLL_NEXT_ARM_DELTA = 8;

/** 慣性スクロールが止まったとみなす待ち時間（ms） */
export const OVERSCROLL_NEXT_SCROLL_SETTLE_MS = 160;

/** scrollTop の慣性ゆらぎ許容（px） */
export const OVERSCROLL_NEXT_SCROLL_JUMP_EPSILON = 2;

/** 離してキャンセル時のスナップバック（ms） */
export const OVERSCROLL_NEXT_SNAP_BACK_MS = 280;

/** スクラブ・ページネーション操作と競合させないセレクタ */
const OVERSCROLL_EXCLUDED_SELECTOR =
  '[data-slot="page-scrub-trigger"], [role="slider"], [data-slot="pagination"]';

export type OverscrollNextPhase = "idle" | "ready" | "pulling";

export type OverscrollNextSession = {
  phase: OverscrollNextPhase;
  pointerId: number | null;
  anchorY: number;
  pullDistance: number;
  scrollTopAtStart: number;
};

export function createOverscrollNextSession(): OverscrollNextSession {
  return {
    phase: "idle",
    pointerId: null,
    anchorY: 0,
    pullDistance: 0,
    scrollTopAtStart: 0,
  };
}

export type ScrollSettleTracker = {
  isSettled: () => boolean;
  onScroll: () => void;
  onScrollEnd: () => void;
  destroy: () => void;
};

/** 慣性スクロール終了を検知（scrollend + debounce） */
export function createScrollSettleTracker(
  container: HTMLElement,
  settleMs: number = OVERSCROLL_NEXT_SCROLL_SETTLE_MS,
): ScrollSettleTracker {
  let lastScrollTop = container.scrollTop;
  let scrolling = false;
  let settleTimer: number | null = null;

  const finishScrolling = (): void => {
    scrolling = false;
  };

  const markScrolling = (): void => {
    scrolling = true;
    if (settleTimer !== null) {
      window.clearTimeout(settleTimer);
    }
    settleTimer = window.setTimeout(() => {
      settleTimer = null;
      finishScrolling();
    }, settleMs);
  };

  const onScroll = (): void => {
    const nextScrollTop = container.scrollTop;
    if (nextScrollTop === lastScrollTop) return;

    lastScrollTop = nextScrollTop;
    markScrolling();
  };

  const onScrollEnd = (): void => {
    if (settleTimer !== null) {
      window.clearTimeout(settleTimer);
      settleTimer = null;
    }
    lastScrollTop = container.scrollTop;
    finishScrolling();
  };

  return {
    isSettled: () => !scrolling,
    onScroll,
    destroy: () => {
      if (settleTimer !== null) {
        window.clearTimeout(settleTimer);
      }
    },
    onScrollEnd,
  };
}

export function hasOverscrollScrollJumped(
  container: HTMLElement,
  scrollTopAtStart: number,
): boolean {
  return (
    Math.abs(container.scrollTop - scrollTopAtStart) >
    OVERSCROLL_NEXT_SCROLL_JUMP_EPSILON
  );
}

export function getScrollBottomRemaining(container: HTMLElement): number {
  return container.scrollHeight - container.scrollTop - container.clientHeight;
}

export function isScrollAtBottom(container: HTMLElement): boolean {
  return getScrollBottomRemaining(container) <= OVERSCROLL_NEXT_BOTTOM_EPSILON;
}

/** マウス操作（PC / DevTools）かどうか */
export function usesFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: fine)").matches;
}

export function isOverscrollExcludedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(OVERSCROLL_EXCLUDED_SELECTOR) !== null;
}

export function computeOverscrollPullDistance(
  anchorY: number,
  currentY: number,
): number {
  return Math.max(0, anchorY - currentY);
}

export function shouldArmOverscrollPull(pullDistance: number): boolean {
  return pullDistance >= OVERSCROLL_NEXT_ARM_DELTA;
}

export function isOverscrollNextCommitted(pullDistance: number): boolean {
  return pullDistance >= OVERSCROLL_NEXT_KEYPOINT;
}

/** 離したときに次ページへ（pull-to-refresh と同じ: 閾値超えで離す） */
export function canReleaseToOverscrollNext(input: {
  phase: OverscrollNextPhase;
  releasePull: number;
  atBottom: boolean;
}): boolean {
  return (
    input.phase === "pulling" &&
    input.atBottom &&
    input.releasePull >= OVERSCROLL_NEXT_KEYPOINT
  );
}

export function triggerOverscrollNextHaptic(): void {
  navigator.vibrate?.(10);
}

/**
 * pull-to-refresh 風の表示オフセット
 * 閾値までは指に近い線形、以降は抵抗を増やす
 */
export function rubberBandOverscrollOffset(distance: number): number {
  if (distance <= 0) return 0;

  const linearCap = OVERSCROLL_NEXT_KEYPOINT * 0.68;
  if (distance <= OVERSCROLL_NEXT_KEYPOINT) {
    return distance * 0.68;
  }

  const extra = distance - OVERSCROLL_NEXT_KEYPOINT;
  return Math.min(linearCap + extra * 0.22, OVERSCROLL_NEXT_MAX_OFFSET);
}

/** @deprecated rubberBandOverscrollOffset を使用 */
export const rubberBandPullOffset = rubberBandOverscrollOffset;

export function overscrollNextKeypointOffset(): number {
  return rubberBandOverscrollOffset(OVERSCROLL_NEXT_KEYPOINT);
}

/** @deprecated overscrollNextKeypointOffset を使用 */
export const pullNextPageKeypointOffset = overscrollNextKeypointOffset;

/** スピナー回転用 0–1 */
export function overscrollNextProgress(distance: number): number {
  if (distance <= 0) return 0;
  return Math.min(distance / OVERSCROLL_NEXT_KEYPOINT, 1);
}

/** @deprecated overscrollNextProgress を使用 */
export const pullNextPageProgress = overscrollNextProgress;

/** @deprecated isOverscrollNextCommitted を使用 */
export const isPullNextPageCommitted = isOverscrollNextCommitted;

/** @deprecated isOverscrollExcludedTarget を使用 */
export const isPullNextPageExcludedTarget = isOverscrollExcludedTarget;
