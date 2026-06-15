"use client";

import * as React from "react";

import {
  canReleaseToOverscrollNext,
  computeOverscrollPullDistance,
  createOverscrollNextSession,
  createScrollSettleTracker,
  hasOverscrollScrollJumped,
  isOverscrollExcludedTarget,
  isOverscrollNextCommitted,
  isScrollAtBottom,
  OVERSCROLL_NEXT_KEYPOINT,
  OVERSCROLL_NEXT_SNAP_BACK_MS,
  overscrollNextKeypointOffset,
  rubberBandOverscrollOffset,
  shouldArmOverscrollPull,
  triggerOverscrollNextHaptic,
  usesFinePointer,
  type OverscrollNextSession,
} from "@/lib/pagination/overscroll-next-page";

type UsePullNextPageOptions = {
  containerRef: React.RefObject<HTMLElement | null>;
  enabled: boolean;
  hasNextPage: boolean;
  /** ページ切替時に pull 状態をリセットするシグナル */
  resetSignal: number;
  onLoadNext: () => void | Promise<void>;
};

type UsePullNextPageResult = {
  pullDistance: number;
  pullOffset: number;
  isPulling: boolean;
  isCommitted: boolean;
  isRefreshing: boolean;
  snapBack: boolean;
  keypoint: number;
};

type PendingPointer = {
  pointerId: number;
  anchorY: number;
  pointerType: string;
};

function capturePointer(
  container: HTMLElement,
  pointerId: number,
): void {
  if (!container.setPointerCapture) return;

  try {
    container.setPointerCapture(pointerId);
  } catch {
    // DevTools / 一部環境では失敗する
  }
}

function releasePointer(container: HTMLElement, pointerId: number): void {
  if (!container.hasPointerCapture?.(pointerId)) return;

  try {
    container.releasePointerCapture(pointerId);
  } catch {
    // noop
  }
}

function shouldIgnoreScrollJump(): boolean {
  return usesFinePointer();
}

function usePullNextPage({
  containerRef,
  enabled,
  hasNextPage,
  resetSignal,
  onLoadNext,
}: UsePullNextPageOptions): UsePullNextPageResult {
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isPulling, setIsPulling] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [snapBack, setSnapBack] = React.useState(false);

  const sessionRef = React.useRef<OverscrollNextSession>(
    createOverscrollNextSession(),
  );
  const loadingRef = React.useRef(false);
  const snapTimerRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const pendingPullRef = React.useRef(0);
  const crossedKeypointRef = React.useRef(false);

  const onLoadNextRef = React.useRef(onLoadNext);
  onLoadNextRef.current = onLoadNext;

  const flushPullDistance = React.useCallback((distance: number): void => {
    pendingPullRef.current = distance;
    if (rafRef.current !== null) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = null;
      setPullDistance(pendingPullRef.current);
    });
  }, []);

  const clearSnapTimer = (): void => {
    if (snapTimerRef.current !== null) {
      window.clearTimeout(snapTimerRef.current);
      snapTimerRef.current = null;
    }
  };

  const resetPullVisualState = React.useCallback((): void => {
    sessionRef.current = createOverscrollNextSession();
    loadingRef.current = false;
    pendingPullRef.current = 0;
    crossedKeypointRef.current = false;
    clearSnapTimer();

    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    setIsPulling(false);
    setIsRefreshing(false);
    setSnapBack(false);
    setPullDistance(0);
  }, []);

  React.useEffect(() => {
    if (loadingRef.current) return;
    resetPullVisualState();
  }, [enabled, resetSignal, resetPullVisualState]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const scrollSettle = createScrollSettleTracker(container);
    const finePointer = usesFinePointer();
    let pendingPointer: PendingPointer | null = null;

    const syncPullingDataset = (): void => {
      container.dataset.overscrollPulling =
        sessionRef.current.phase === "pulling" ? "true" : "false";
    };

    const resetSession = (): void => {
      const pointerId = sessionRef.current.pointerId;
      if (pointerId !== null) {
        releasePointer(container, pointerId);
      }

      sessionRef.current = createOverscrollNextSession();
      flushPullDistance(0);
      setIsPulling(false);
      syncPullingDataset();
    };

    const beginSnapBack = (): void => {
      setSnapBack(true);
      flushPullDistance(0);
      setIsPulling(false);
      syncPullingDataset();
      clearSnapTimer();
      snapTimerRef.current = window.setTimeout(() => {
        snapTimerRef.current = null;
        setSnapBack(false);
      }, OVERSCROLL_NEXT_SNAP_BACK_MS);
    };

    const updatePull = (session: OverscrollNextSession, pull: number): void => {
      session.pullDistance = pull;

      if (
        !crossedKeypointRef.current &&
        isOverscrollNextCommitted(pull)
      ) {
        crossedKeypointRef.current = true;
        triggerOverscrollNextHaptic();
      }

      flushPullDistance(pull);
    };

    const commitLoadNext = (): void => {
      if (!hasNextPage || loadingRef.current) return;

      loadingRef.current = true;
      setIsRefreshing(true);
      setSnapBack(false);
      flushPullDistance(OVERSCROLL_NEXT_KEYPOINT);

      void Promise.resolve(onLoadNextRef.current())
        .catch(() => {
          // fetch 側でエラー表示する
        })
        .finally(() => {
          loadingRef.current = false;
          setIsRefreshing(false);
          beginSnapBack();
        });
    };

    const canBeginPull = (): boolean => {
      if (!hasNextPage || loadingRef.current) return false;
      if (!isScrollAtBottom(container)) return false;
      if (!finePointer && !scrollSettle.isSettled()) return false;
      return true;
    };

    const beginReadySession = (
      pointerId: number,
      clientY: number,
      pointerType: string,
    ): boolean => {
      if (sessionRef.current.phase !== "idle") {
        return sessionRef.current.pointerId === pointerId;
      }
      if (!canBeginPull()) return false;

      crossedKeypointRef.current = false;
      setSnapBack(false);
      sessionRef.current = {
        phase: "ready",
        pointerId,
        anchorY: clientY,
        pullDistance: 0,
        scrollTopAtStart: container.scrollTop,
      };

      if (pointerType === "mouse" || pointerType === "pen") {
        capturePointer(container, pointerId);
      }

      return true;
    };

    const tryPromotePendingPointer = (pointerId: number): void => {
      if (sessionRef.current.phase !== "idle" || pendingPointer === null) {
        return;
      }
      if (pendingPointer.pointerId !== pointerId) return;

      beginReadySession(
        pendingPointer.pointerId,
        pendingPointer.anchorY,
        pendingPointer.pointerType,
      );
    };

    const moveGesture = (
      pointerId: number,
      clientY: number,
      preventDefault: () => void,
    ): void => {
      tryPromotePendingPointer(pointerId);

      const session = sessionRef.current;
      if (session.phase === "idle") return;
      if (session.pointerId !== pointerId) return;
      if (!hasNextPage || loadingRef.current) {
        resetSession();
        return;
      }

      const pulling = session.phase === "pulling";

      if (!pulling && !isScrollAtBottom(container)) {
        resetSession();
        return;
      }

      if (
        session.phase === "ready" &&
        !shouldIgnoreScrollJump() &&
        hasOverscrollScrollJumped(container, session.scrollTopAtStart)
      ) {
        resetSession();
        return;
      }

      const pull = computeOverscrollPullDistance(session.anchorY, clientY);

      if (session.phase === "ready") {
        if (pull <= 0) {
          session.anchorY = clientY;
          return;
        }

        if (!shouldArmOverscrollPull(pull)) return;

        session.phase = "pulling";
        capturePointer(container, pointerId);
        setIsPulling(true);
        syncPullingDataset();
        updatePull(session, pull);
        return;
      }

      if (session.phase === "pulling") {
        preventDefault();
        updatePull(session, pull);
      }
    };

    const endGesture = (pointerId: number): void => {
      pendingPointer = null;

      const session = sessionRef.current;
      if (session.phase === "idle") return;
      if (session.pointerId !== pointerId) return;

      releasePointer(container, pointerId);

      const releasePull = session.pullDistance;
      const releasePhase = session.phase;
      const shouldLoad = canReleaseToOverscrollNext({
        phase: releasePhase,
        releasePull,
        atBottom: isScrollAtBottom(container) || releasePhase === "pulling",
      });

      resetSession();

      if (shouldLoad) {
        commitLoadNext();
        return;
      }

      if (releasePull > 0) {
        beginSnapBack();
      }
    };

    const handlePointerDown = (event: PointerEvent): void => {
      if (event.button !== 0) return;
      if (!event.isPrimary) return;
      if (isOverscrollExcludedTarget(event.target)) return;

      pendingPointer = {
        pointerId: event.pointerId,
        anchorY: event.clientY,
        pointerType: event.pointerType,
      };

      beginReadySession(event.pointerId, event.clientY, event.pointerType);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      moveGesture(event.pointerId, event.clientY, () => {
        event.preventDefault();
      });
    };

    const handlePointerEnd = (event: PointerEvent): void => {
      endGesture(event.pointerId);
    };

    const handleTouchMove = (event: TouchEvent): void => {
      if (finePointer) return;

      const session = sessionRef.current;
      if (session.phase === "idle") return;

      const touch =
        event.touches.length === 1
          ? event.touches[0]
          : event.touches.item(0);
      if (!touch) return;

      if (session.phase !== "pulling") return;

      event.preventDefault();
    };

    const handleScroll = (): void => {
      scrollSettle.onScroll();

      const session = sessionRef.current;
      if (
        session.phase === "ready" &&
        !shouldIgnoreScrollJump() &&
        hasOverscrollScrollJumped(container, session.scrollTopAtStart)
      ) {
        resetSession();
      }
    };

    const handleScrollEnd = (): void => {
      scrollSettle.onScrollEnd();
    };

    syncPullingDataset();
    container.addEventListener("scroll", handleScroll, { passive: true });
    if ("onscrollend" in container) {
      container.addEventListener("scrollend", handleScrollEnd, { passive: true });
    }
    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointermove", handlePointerMove, { passive: false });
    container.addEventListener("pointerup", handlePointerEnd);
    container.addEventListener("pointercancel", handlePointerEnd);
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if ("onscrollend" in container) {
        container.removeEventListener("scrollend", handleScrollEnd);
      }
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerup", handlePointerEnd);
      container.removeEventListener("pointercancel", handlePointerEnd);
      container.removeEventListener("touchmove", handleTouchMove);
      container.dataset.overscrollPulling = "false";
      scrollSettle.destroy();
      clearSnapTimer();
      pendingPointer = null;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [containerRef, enabled, flushPullDistance, hasNextPage]);

  const effectiveDistance = isRefreshing
    ? OVERSCROLL_NEXT_KEYPOINT
    : pullDistance;
  const pullOffset = isRefreshing
    ? overscrollNextKeypointOffset()
    : rubberBandOverscrollOffset(pullDistance);
  const isCommitted = isOverscrollNextCommitted(effectiveDistance);

  return {
    pullDistance: effectiveDistance,
    pullOffset,
    isPulling,
    isCommitted,
    isRefreshing,
    snapBack,
    keypoint: OVERSCROLL_NEXT_KEYPOINT,
  };
}

export { usePullNextPage };
