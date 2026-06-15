import {
  MAP_PLOT_BATCH_SIZE,
  MAP_PLOT_REQUEST_COUNT,
  MAP_PLOT_SHOP_LIMIT,
} from "@/constants/pagination";
import { TEXT } from "@/constants/text";
import { fetchMultiTierBudgetPreview } from "@/lib/search/fetch-budget-filtered-shops";
import {
  buildInternalSearchParams,
  fetchSearchApi,
  ORDER_BY_SORT,
} from "@/lib/search/fetch-search-api";
import {
  resolveBudgetFetchStrategy,
  resolveSingleBudgetCode,
} from "@/lib/search/budget-range";
import type { ShopSearchConditions } from "@/lib/search/filter-shops";
import type { GeoCoords } from "@/lib/search/geolocation";
import type { Shop } from "@/types/shop";

function dedupeShops(shops: Shop[]): Shop[] {
  const seen = new Set<string>();
  return shops.filter((shop) => {
    if (seen.has(shop.id)) {
      return false;
    }
    seen.add(shop.id);
    return true;
  });
}

function withMappableCoords(shops: Shop[]): Shop[] {
  return shops.filter((shop) => shop.lat !== null && shop.lng !== null);
}

/** 地図表示専用: 2リクエスト分（最大40件）を取得してプロット密度を上げる */
export async function fetchMapPlotShops(
  coords: GeoCoords,
  conditions: ShopSearchConditions,
): Promise<Shop[]> {
  const order = ORDER_BY_SORT[conditions.sort];
  const strategy = resolveBudgetFetchStrategy(
    conditions.budgetMin,
    conditions.budgetMax,
  );

  if (strategy === "multi-tier-preview") {
    const preview = await fetchMultiTierBudgetPreview({
      lat: coords.lat,
      lng: coords.lng,
      conditions,
      order,
    });

    return withMappableCoords(
      dedupeShops(preview.shops).slice(0, MAP_PLOT_SHOP_LIMIT),
    );
  }

  const budgetCode =
    resolveSingleBudgetCode(conditions.budgetMin, conditions.budgetMax) ??
    undefined;

  const starts = Array.from(
    { length: MAP_PLOT_REQUEST_COUNT },
    (_, index) => 1 + index * MAP_PLOT_BATCH_SIZE,
  );

  const pages = await Promise.all(
    starts.map((start) =>
      fetchSearchApi(
        buildInternalSearchParams(coords, conditions, start, order, {
          count: MAP_PLOT_BATCH_SIZE,
          budgetCode,
        }),
        TEXT.search.fetchError,
      ),
    ),
  );

  return withMappableCoords(
    dedupeShops(pages.flatMap((page) => page.shops)).slice(
      0,
      MAP_PLOT_SHOP_LIMIT,
    ),
  );
}
