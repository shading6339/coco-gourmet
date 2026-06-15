import { UI_FEATURE_FILTER_KEYS } from "@/constants/search-features";
import type { GourmetBinaryFilterKey } from "@/lib/hotpepper/gourmet-search";

/** 有効な設備フィルタ（キーが存在 = 絞り込み ON） */
export type ShopFeatureFilters = Partial<
  Record<GourmetBinaryFilterKey, true>
>;

export const EMPTY_FEATURE_FILTERS: ShopFeatureFilters = {};

export function countFeatureFilters(
  filters: ShopFeatureFilters,
): number {
  return UI_FEATURE_FILTER_KEYS.filter((key) => filters[key]).length;
}

export function isFeatureFilterActive(
  filters: ShopFeatureFilters,
  key: GourmetBinaryFilterKey,
): boolean {
  return filters[key] === true;
}

export function toggleFeatureFilter(
  filters: ShopFeatureFilters,
  key: GourmetBinaryFilterKey,
): ShopFeatureFilters {
  if (filters[key]) {
    const next = { ...filters };
    delete next[key];
    return next;
  }
  return { ...filters, [key]: true };
}

export function clearFeatureFilters(): ShopFeatureFilters {
  return EMPTY_FEATURE_FILTERS;
}

/** URL クエリから設備フィルタを復元（lunch は lunchFilter 側で扱う） */
export function parseFeatureFiltersFromParams(
  searchParams: URLSearchParams,
): ShopFeatureFilters {
  const filters: ShopFeatureFilters = {};

  for (const key of UI_FEATURE_FILTER_KEYS) {
    if (searchParams.get(key) === "1") {
      filters[key] = true;
    }
  }

  return filters;
}

/** `/api/search` 向けに設備フィルタを付与 */
export function appendFeatureFiltersToParams(
  params: URLSearchParams,
  filters: ShopFeatureFilters,
): void {
  for (const key of UI_FEATURE_FILTER_KEYS) {
    if (filters[key]) {
      params.set(key, "1");
    }
  }
}

/** キャッシュキー用の安定した JSON 表現 */
export function serializeFeatureFiltersForCache(
  filters: ShopFeatureFilters,
): string {
  const active = UI_FEATURE_FILTER_KEYS.filter((key) => filters[key]).sort();
  return active.join(",");
}
