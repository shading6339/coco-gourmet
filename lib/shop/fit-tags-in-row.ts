const TAG_GAP_PX = 6;

/** 1行に収まるタグ数（はみ出し分は +N 用幅を確保） */
export function fitTagsInRowWidth(
  tagWidths: readonly number[],
  containerWidth: number,
  overflowChipWidth: (hiddenCount: number) => number,
): { visibleCount: number; showOverflowChip: boolean } {
  if (tagWidths.length === 0 || containerWidth <= 0) {
    return { visibleCount: 0, showOverflowChip: false };
  }

  let used = 0;
  let fit = 0;

  for (let i = 0; i < tagWidths.length; i++) {
    const tagW = tagWidths[i];
    const gap = fit > 0 ? TAG_GAP_PX : 0;
    const hidden = tagWidths.length - i - 1;
    const overflowReserve =
      hidden > 0 ? TAG_GAP_PX + overflowChipWidth(hidden) : 0;

    if (used + gap + tagW + overflowReserve > containerWidth) {
      break;
    }
    used += gap + tagW;
    fit++;
  }

  if (fit > 0) {
    return {
      visibleCount: fit,
      showOverflowChip: fit < tagWidths.length,
    };
  }

  const firstW = tagWidths[0];
  const hiddenAll = tagWidths.length - 1;
  if (hiddenAll === 0) {
    return { visibleCount: 1, showOverflowChip: false };
  }

  const chipW = TAG_GAP_PX + overflowChipWidth(hiddenAll);
  if (firstW + chipW <= containerWidth) {
    return { visibleCount: 1, showOverflowChip: true };
  }

  return { visibleCount: 1, showOverflowChip: false };
}
