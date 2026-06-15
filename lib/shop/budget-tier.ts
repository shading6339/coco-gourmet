/** 予算レンジ文字列から料金帯タグ（￥〜￥￥￥￥）を生成 */
export function formatBudgetTierTag(
  nightRange: string | null,
  dayRange: string | null,
): string | null {
  const source = nightRange ?? dayRange;
  if (!source) return null;

  const amounts: number[] = [];
  const pattern = /(\d{1,3}(?:,\d{3})*|\d+)/g;
  for (const match of source.matchAll(pattern)) {
    const value = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) {
      amounts.push(value);
    }
  }

  if (amounts.length === 0) return null;

  const mid = (Math.min(...amounts) + Math.max(...amounts)) / 2;
  const tier = Math.min(4, Math.max(1, Math.ceil(mid / 3500)));
  return "￥".repeat(tier);
}
