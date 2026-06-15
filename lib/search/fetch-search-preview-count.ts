import {
  resolveBudgetFetchStrategy,
  resolveSingleBudgetCode,
} from "@/lib/search/budget-range";
import { fetchMultiTierBudgetPreview } from "@/lib/search/fetch-budget-filtered-shops";
import {
  buildInternalSearchParams,
  ORDER_BY_SORT,
} from "@/lib/search/fetch-search-api";
import type { ShopSearchConditions } from "@/lib/search/filter-shops";
import type { GeoCoords } from "@/lib/search/geo-defaults";

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Aborted", "AbortError");
  }
}

/**
 * 条件設定プレビューと一覧で同じ件数になるよう、検索と同じ取得戦略で数える。
 * - 単一予算帯 / 予算なし: API の results_available
 * - 複数予算帯: 各帯先頭ページを合成したうえでレンジフィルタ後の件数
 */
export async function fetchSearchPreviewCount(
  coords: GeoCoords,
  conditions: ShopSearchConditions,
  signal?: AbortSignal,
): Promise<number> {
  const strategy = resolveBudgetFetchStrategy(
    conditions.budgetMin,
    conditions.budgetMax,
  );

  if (strategy === "multi-tier-preview") {
    throwIfAborted(signal);
    const preview = await fetchMultiTierBudgetPreview({
      lat: coords.lat,
      lng: coords.lng,
      conditions,
      order: ORDER_BY_SORT[conditions.sort],
    });
    throwIfAborted(signal);
    return preview.shops.length;
  }

  const budgetCode = resolveSingleBudgetCode(
    conditions.budgetMin,
    conditions.budgetMax,
  );
  const searchParams = buildInternalSearchParams(
    coords,
    conditions,
    1,
    ORDER_BY_SORT[conditions.sort],
    { count: 1, budgetCode: budgetCode ?? undefined },
  );

  const response = await fetch(`/api/search?${searchParams.toString()}`, {
    method: "GET",
    signal,
  });
  const data = (await response.json()) as { total?: number; message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? "件数の取得に失敗しました。");
  }

  return data.total ?? 0;
}
