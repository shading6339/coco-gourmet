import {
  DEFAULT_BUDGET_MAX,
  DEFAULT_BUDGET_MIN,
} from "@/constants/budget-range";
import { isBudgetRangeActive } from "@/lib/search/budget-range";
import {
  countFeatureFilters,
  EMPTY_FEATURE_FILTERS,
  type ShopFeatureFilters,
} from "@/lib/search/feature-filters";

export type ShopSortKey = "recommended" | "distance";
export type LunchFilter = "any" | "yes" | "no";

export type ShopSearchConditions = {
  keyword: string;
  range: string;
  /** ジャンルコード（複数選択可・OR 検索。HotPepper API はカンマ区切りで受ける） */
  genreCodes: string[];
  lunchFilter: LunchFilter;
  budgetMin: number;
  budgetMax: number;
  specialCode: string;
  /** 設備・サービス絞り込み（Hot Pepper 0/1 パラメータ） */
  featureFilters: ShopFeatureFilters;
  /** 宴会収容人数（指定数以上の店舗を検索） */
  partyCapacity: number | null;
  sort: ShopSortKey;
};

export const DEFAULT_SHOP_SEARCH_CONDITIONS: ShopSearchConditions = {
  keyword: "",
  range: "3",
  genreCodes: [],
  lunchFilter: "any",
  budgetMin: DEFAULT_BUDGET_MIN,
  budgetMax: DEFAULT_BUDGET_MAX,
  specialCode: "",
  featureFilters: EMPTY_FEATURE_FILTERS,
  partyCapacity: null,
  sort: "recommended",
};

export type SearchOption = {
  code: string;
  label: string;
};

/** 等価判定・キャッシュキー・URL の正規形（ソート済カンマ区切り） */
export function serializeGenreCodes(codes: readonly string[]): string {
  return [...codes].sort().join(",");
}

export function parseGenreCodesParam(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return [...new Set(raw.split(",").map((code) => code.trim()).filter(Boolean))];
}

export function countActiveSearchConditions(
  conditions: ShopSearchConditions,
): number {
  return [
    conditions.keyword.trim(),
    conditions.range !== DEFAULT_SHOP_SEARCH_CONDITIONS.range,
    conditions.genreCodes.length,
    isBudgetRangeActive(conditions.budgetMin, conditions.budgetMax),
    conditions.lunchFilter !== DEFAULT_SHOP_SEARCH_CONDITIONS.lunchFilter,
    conditions.specialCode,
    countFeatureFilters(conditions.featureFilters),
    conditions.partyCapacity !== null,
    conditions.sort !== DEFAULT_SHOP_SEARCH_CONDITIONS.sort,
  ].filter(Boolean).length;
}
