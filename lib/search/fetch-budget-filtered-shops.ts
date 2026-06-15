import { HOTPEPPER_BUDGET_TIERS } from "@/constants/budget-range";
import { HOTPEPPER_MAX_PAGE_SIZE } from "@/constants/pagination";
import {
  buildInternalSearchParams,
  fetchSearchApi,
} from "@/lib/search/fetch-search-api";
import {
  readBudgetTierCache,
  writeBudgetTierCache,
  type BudgetSearchBaseParams,
} from "@/lib/search/budget-tier-cache";
import {
  filterShopsByBudgetRange,
  resolveOverlappingBudgetCodes,
} from "@/lib/search/budget-range";
import type { ShopSortKey } from "@/lib/search/filter-shops";
import type { Shop } from "@/types/shop";

/** 複数帯プレビュー時の並列リクエスト上限 */
const MULTI_TIER_FETCH_CONCURRENCY = 4;

export type { BudgetSearchBaseParams };

export type MultiTierBudgetPreview = {
  shops: Shop[];
  /** 各予算帯 API が返す total の合計（1リクエスト/帯で取得） */
  estimatedTotal: number;
};

async function fetchSearchPage(
  base: BudgetSearchBaseParams,
  start: number,
  options: { budgetCode?: string; count?: number } = {},
): Promise<{ total: number; shops: Shop[] }> {
  const searchParams = buildInternalSearchParams(
    { lat: base.lat, lng: base.lng },
    base.conditions,
    start,
    base.order,
    options,
  );
  const data = await fetchSearchApi(searchParams);
  return {
    total: data.total,
    shops: data.shops,
  };
}

async function fetchTierPreviewWithCache(
  base: BudgetSearchBaseParams,
  budgetCode: string,
): Promise<{ total: number; shops: Shop[] }> {
  const cached = readBudgetTierCache(base, budgetCode);
  if (cached) {
    return {
      total: cached.total,
      shops: cached.shops,
    };
  }

  const page = await fetchSearchPage(base, 1, {
    budgetCode,
    count: HOTPEPPER_MAX_PAGE_SIZE,
  });

  writeBudgetTierCache(base, budgetCode, {
    total: page.total,
    shops: page.shops,
  });

  return page;
}

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

/** 帯ごとの先頭ページを交互に合成（帯の安い順連結を避ける） */
function interleaveTierShops(tierShops: readonly (readonly Shop[])[]): Shop[] {
  const result: Shop[] = [];
  let index = 0;
  let hasMore = true;

  while (hasMore) {
    hasMore = false;
    for (const tier of tierShops) {
      const shop = tier[index];
      if (shop) {
        result.push(shop);
        hasMore = true;
      }
    }
    index += 1;
  }

  return result;
}

function mergeTierPreviewShops(
  tierShops: readonly (readonly Shop[])[],
  sort: ShopSortKey,
): Shop[] {
  const merged =
    sort === "distance"
      ? tierShops.flat()
      : interleaveTierShops(tierShops);

  return dedupeShops(merged);
}

function sortMergedShops(shops: Shop[], sort: ShopSortKey): Shop[] {
  if (sort !== "distance") {
    return shops;
  }

  return [...shops].sort((left, right) => {
    const leftDistance = left.distanceMeters ?? Number.POSITIVE_INFINITY;
    const rightDistance = right.distanceMeters ?? Number.POSITIVE_INFINITY;
    return leftDistance - rightDistance;
  });
}

/**
 * 複数予算帯: 各帯の先頭1リクエストを合成（キャッシュ済み帯は再取得しない）
 */
export async function fetchMultiTierBudgetPreview(
  base: BudgetSearchBaseParams,
): Promise<MultiTierBudgetPreview> {
  const { budgetMin, budgetMax } = base.conditions;
  const budgetCodes = resolveOverlappingBudgetCodes(budgetMin, budgetMax);

  if (budgetCodes.length === 0) {
    return { shops: [], estimatedTotal: 0 };
  }

  const pageBatches: Shop[][] = [];
  let estimatedTotal = 0;

  for (
    let index = 0;
    index < budgetCodes.length;
    index += MULTI_TIER_FETCH_CONCURRENCY
  ) {
    const batchCodes = budgetCodes.slice(
      index,
      index + MULTI_TIER_FETCH_CONCURRENCY,
    );
    const pages = await Promise.all(
      batchCodes.map((code) => fetchTierPreviewWithCache(base, code)),
    );

    for (const page of pages) {
      estimatedTotal += page.total;
      pageBatches.push(page.shops);
    }
  }

  const merged = mergeTierPreviewShops(pageBatches, base.conditions.sort);
  const filtered = filterShopsByBudgetRange(merged, budgetMin, budgetMax);

  return {
    shops: sortMergedShops(filtered, base.conditions.sort),
    estimatedTotal,
  };
}

/**
 * 予算フィルタなしの分布（各帯 API total）をヒストグラム用に取得
 */
export async function fetchBudgetHistogramCounts(
  base: BudgetSearchBaseParams,
): Promise<number[]> {
  const budgetCodes = HOTPEPPER_BUDGET_TIERS.map((tier) => tier.code);
  const counts = Array.from({ length: budgetCodes.length }, () => 0);

  for (
    let index = 0;
    index < budgetCodes.length;
    index += MULTI_TIER_FETCH_CONCURRENCY
  ) {
    const batchCodes = budgetCodes.slice(
      index,
      index + MULTI_TIER_FETCH_CONCURRENCY,
    );
    const pages = await Promise.all(
      batchCodes.map((code) => fetchTierPreviewWithCache(base, code)),
    );

    for (let offset = 0; offset < pages.length; offset += 1) {
      counts[index + offset] = pages[offset]?.total ?? 0;
    }
  }

  return counts;
}
