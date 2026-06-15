import { appendFeatureFiltersToParams } from "@/lib/search/feature-filters";
import {
  serializeGenreCodes,
  type ShopSearchConditions,
  type ShopSortKey,
} from "@/lib/search/filter-shops";
import type { GeoCoords } from "@/lib/search/geo-defaults";
import type { Shop } from "@/types/shop";

export type SearchApiResponse = {
  total: number;
  start: number;
  returned: number;
  shops: Shop[];
};

export const ORDER_BY_SORT: Record<ShopSortKey, string> = {
  recommended: "4",
  distance: "1",
};

type FetchSearchApiOptions = {
  count?: number;
  budgetCode?: string;
};

/** `/api/search` 向けのクエリを組み立てる */
export function buildInternalSearchParams(
  coords: GeoCoords,
  conditions: ShopSearchConditions,
  start: number,
  order: string,
  options: FetchSearchApiOptions = {},
): URLSearchParams {
  const searchParams = new URLSearchParams({
    lat: String(coords.lat),
    lng: String(coords.lng),
    range: conditions.range,
    start: String(start),
    order,
  });

  if (options.count) {
    searchParams.set("count", String(options.count));
  }
  if (conditions.keyword.trim()) {
    searchParams.set("keyword", conditions.keyword.trim());
  }
  if (conditions.genreCodes.length > 0) {
    searchParams.set("genre", serializeGenreCodes(conditions.genreCodes));
  }
  if (conditions.specialCode) {
    searchParams.set("special", conditions.specialCode);
  }
  if (conditions.lunchFilter === "yes") {
    searchParams.set("lunch", "1");
  } else if (conditions.lunchFilter === "no") {
    searchParams.set("lunch", "0");
  }
  appendFeatureFiltersToParams(searchParams, conditions.featureFilters);
  if (conditions.partyCapacity !== null) {
    searchParams.set("party_capacity", String(conditions.partyCapacity));
  }
  if (options.budgetCode) {
    searchParams.set("budget", options.budgetCode);
  }

  return searchParams;
}

export async function fetchSearchApi(
  searchParams: URLSearchParams,
  errorMessage = "検索に失敗しました。",
): Promise<SearchApiResponse> {
  const response = await fetch(`/api/search?${searchParams.toString()}`, {
    method: "GET",
  });
  const data = (await response.json()) as Partial<SearchApiResponse> & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? errorMessage);
  }

  return {
    total: data.total ?? 0,
    start: data.start ?? Number(searchParams.get("start") ?? "1"),
    returned: data.returned ?? 0,
    shops: data.shops ?? [],
  };
}
