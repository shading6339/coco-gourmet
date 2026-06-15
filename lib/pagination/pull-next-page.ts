/** @deprecated `@/lib/pagination/overscroll-next-page` へ移行 */
export {
  computeOverscrollPullDistance,
  createOverscrollNextSession,
  isOverscrollExcludedTarget as isPullNextPageExcludedTarget,
  isOverscrollNextCommitted as isPullNextPageCommitted,
  isScrollAtBottom,
  overscrollNextKeypointOffset as pullNextPageKeypointOffset,
  overscrollNextProgress as pullNextPageProgress,
  OVERSCROLL_NEXT_KEYPOINT as PULL_NEXT_PAGE_KEYPOINT,
  OVERSCROLL_NEXT_MAX_OFFSET as PULL_NEXT_PAGE_MAX_OFFSET,
  OVERSCROLL_NEXT_BOTTOM_EPSILON as PULL_NEXT_PAGE_BOTTOM_EPSILON,
  rubberBandOverscrollOffset as rubberBandPullOffset,
  OVERSCROLL_NEXT_KEYPOINT as PULL_NEXT_PAGE_THRESHOLD,
} from "@/lib/pagination/overscroll-next-page";
