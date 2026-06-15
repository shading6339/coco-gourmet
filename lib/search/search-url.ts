import { TEXT } from "@/constants/text";
import {
  budgetCodeToRange,
  isBudgetRangeActive,
  parseBudgetRangeParams,
} from "@/lib/search/budget-range";
import {
  appendFeatureFiltersToParams,
  parseFeatureFiltersFromParams,
} from "@/lib/search/feature-filters";
import {
  DEFAULT_SHOP_SEARCH_CONDITIONS,
  parseGenreCodesParam,
  serializeGenreCodes,
  type LunchFilter,
  type SearchOption,
  type ShopSearchConditions,
  type ShopSortKey,
} from "@/lib/search/filter-shops";
import type { GeoCoords } from "@/lib/search/geo-defaults";
import type { SearchRangeOption } from "@/types/search-range";

export type SearchUrlState = {
  conditions: ShopSearchConditions;
  page: number;
  hasConditions: boolean;
  /** 共有ディープリンク `?shop=<id>`。コールド起動で詳細を直接開く */
  shopId: string | null;
};

export const RANGE_OPTIONS: readonly SearchRangeOption[] = [
  { label: `300${TEXT.common.rangeUnit}`, value: "1", meters: 300 },
  { label: `500${TEXT.common.rangeUnit}`, value: "2", meters: 500 },
  { label: `1000${TEXT.common.rangeUnit}`, value: "3", meters: 1000 },
  { label: `2000${TEXT.common.rangeUnit}`, value: "4", meters: 2000 },
  { label: `3000${TEXT.common.rangeUnit}`, value: "5", meters: 3000 },
] as const;

export const HOME_CURRENT_LOCATION_RANGE = "1";

export const HOME_SEARCH_CONDITIONS: ShopSearchConditions = {
  ...DEFAULT_SHOP_SEARCH_CONDITIONS,
  range: HOME_CURRENT_LOCATION_RANGE,
};

const SORT_VALUES = new Set<ShopSortKey>(["recommended", "distance"]);
const RANGE_VALUES = new Set(RANGE_OPTIONS.map((option) => option.value));

function parseLunchFilter(searchParams: URLSearchParams): LunchFilter {
  const lunchParam = searchParams.get("lunch");
  if (lunchParam === "1") return "yes";
  if (lunchParam === "0") return "no";

  // 旧 URL: budgetMode=day はランチありにマップ
  if (searchParams.get("budgetMode") === "day") return "yes";

  return DEFAULT_SHOP_SEARCH_CONDITIONS.lunchFilter;
}

export function resetConditionsForHomeSearch(
  conditions: ShopSearchConditions,
): ShopSearchConditions {
  return {
    ...DEFAULT_SHOP_SEARCH_CONDITIONS,
    range: conditions.range,
  };
}

export function parseSearchUrl(
  searchParams: URLSearchParams,
  budgets: SearchOption[] = [],
): SearchUrlState {
  const rangeParam = searchParams.get("range");
  const sortParam = searchParams.get("sort");
  const pageParam = Number(searchParams.get("page") ?? "1");
  const range = RANGE_VALUES.has(rangeParam ?? "")
    ? (rangeParam ?? DEFAULT_SHOP_SEARCH_CONDITIONS.range)
    : DEFAULT_SHOP_SEARCH_CONDITIONS.range;
  const sort = SORT_VALUES.has(sortParam as ShopSortKey)
    ? (sortParam as ShopSortKey)
    : DEFAULT_SHOP_SEARCH_CONDITIONS.sort;
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;

  const legacyBudgetCode = searchParams.get("budget")?.trim() ?? "";
  const legacyRange = legacyBudgetCode
    ? budgetCodeToRange(legacyBudgetCode, budgets)
    : null;
  const budgetRange = legacyRange
    ? legacyRange
    : parseBudgetRangeParams(
        searchParams.get("budgetMin"),
        searchParams.get("budgetMax"),
      );

  const partyCapacityRaw = searchParams.get("party_capacity");
  const partyCapacityParsed = partyCapacityRaw
    ? Number(partyCapacityRaw)
    : Number.NaN;
  const partyCapacity =
    Number.isInteger(partyCapacityParsed) && partyCapacityParsed > 0
      ? partyCapacityParsed
      : null;

  const shopId = searchParams.get("shop")?.trim() || null;

  // shop 単体パラメータは検索条件ではないので hasConditions 判定から除外する
  const conditionParams = new URLSearchParams(searchParams);
  conditionParams.delete("shop");

  return {
    hasConditions: conditionParams.toString().length > 0,
    shopId,
    page,
    conditions: {
      keyword: searchParams.get("keyword")?.trim() ?? "",
      range,
      genreCodes: parseGenreCodesParam(searchParams.get("genre")),
      lunchFilter: parseLunchFilter(searchParams),
      budgetMin: budgetRange.min,
      budgetMax: budgetRange.max,
      specialCode: searchParams.get("special")?.trim() ?? "",
      featureFilters: parseFeatureFiltersFromParams(searchParams),
      partyCapacity,
      sort,
    },
  };
}

export function buildSearchUrl(
  conditions: ShopSearchConditions,
  page: number,
): string {
  const params = new URLSearchParams({
    range: conditions.range,
  });

  if (conditions.keyword.trim()) {
    params.set("keyword", conditions.keyword.trim());
  }
  if (conditions.genreCodes.length > 0) {
    params.set("genre", serializeGenreCodes(conditions.genreCodes));
  }
  if (conditions.lunchFilter === "yes") {
    params.set("lunch", "1");
  } else if (conditions.lunchFilter === "no") {
    params.set("lunch", "0");
  }
  if (isBudgetRangeActive(conditions.budgetMin, conditions.budgetMax)) {
    params.set("budgetMin", String(conditions.budgetMin));
    params.set("budgetMax", String(conditions.budgetMax));
  }
  if (conditions.specialCode) params.set("special", conditions.specialCode);
  appendFeatureFiltersToParams(params, conditions.featureFilters);
  if (conditions.partyCapacity !== null) {
    params.set("party_capacity", String(conditions.partyCapacity));
  }
  if (conditions.sort !== DEFAULT_SHOP_SEARCH_CONDITIONS.sort) {
    params.set("sort", conditions.sort);
  }
  if (page > 1) params.set("page", String(page));

  return `/?${params.toString()}`;
}

export function buildBudgetCatalogKey(
  coords: GeoCoords,
  conditions: ShopSearchConditions,
): string {
  return JSON.stringify({
    lat: coords.lat,
    lng: coords.lng,
    keyword: conditions.keyword,
    range: conditions.range,
    genreCodes: serializeGenreCodes(conditions.genreCodes),
    lunchFilter: conditions.lunchFilter,
    budgetMin: conditions.budgetMin,
    budgetMax: conditions.budgetMax,
    specialCode: conditions.specialCode,
    featureFilters: conditions.featureFilters,
    partyCapacity: conditions.partyCapacity,
    sort: conditions.sort,
  });
}
