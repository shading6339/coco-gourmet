import type { SearchOption } from "@/lib/search/filter-shops";

function extractGenreCodeNumber(code: string): number {
  const num = Number.parseInt(code.replace(/\D/g, ""), 10);
  return Number.isFinite(num) ? num : Number.MAX_SAFE_INTEGER;
}

/** 予算ラベル（例: ～500円 / 501～1000円）からソート用の下限金額を取得 */
function extractBudgetSortMin(label: string): number {
  const normalized = label.replace(/,/g, "");
  if (/^[～〜]/.test(normalized)) {
    return 0;
  }

  const match = normalized.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

export function sortGenreOptions(options: SearchOption[]): SearchOption[] {
  return [...options].sort((a, b) => {
    const numA = extractGenreCodeNumber(a.code);
    const numB = extractGenreCodeNumber(b.code);
    if (numA !== numB) return numA - numB;
    return a.code.localeCompare(b.code);
  });
}

export function sortBudgetOptions(options: SearchOption[]): SearchOption[] {
  return [...options].sort((a, b) => {
    const minA = extractBudgetSortMin(a.label);
    const minB = extractBudgetSortMin(b.label);
    if (minA !== minB) return minA - minB;
    return a.code.localeCompare(b.code);
  });
}
