"use client";

import {
  useCallback,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { TEXT } from "@/constants/text";
import { SHOP_PAGE_SIZE } from "@/constants/pagination";
import {
  buildInternalSearchParams,
  fetchSearchApi,
  ORDER_BY_SORT,
  type SearchApiResponse,
} from "@/lib/search/fetch-search-api";
import {
  isBudgetRangeActive,
  resolveBudgetFetchStrategy,
  resolveSingleBudgetCode,
  type BudgetFetchStrategy,
} from "@/lib/search/budget-range";
import {
  buildBudgetHistogramKey,
  readBudgetHistogramCache,
  writeBudgetHistogramCache,
} from "@/lib/search/budget-tier-cache";
import {
  fetchBudgetHistogramCounts,
  fetchMultiTierBudgetPreview,
} from "@/lib/search/fetch-budget-filtered-shops";
import type { ShopSearchConditions } from "@/lib/search/filter-shops";
import type { GeoCoords } from "@/lib/search/geolocation";
import {
  buildBudgetCatalogKey,
  HOME_SEARCH_CONDITIONS,
} from "@/lib/search/search-url";
import { startIndexToPage } from "@/lib/pagination/pagination-items";
import type { Shop } from "@/types/shop";

type UseShopSearchOptions = {
  onSetErrorMessage: (message: string | null) => void;
  initialConditions?: ShopSearchConditions;
  initialIsSearching?: boolean;
};

type UseShopSearchResult = {
  shops: Shop[];
  total: number;
  start: number;
  isSearching: boolean;
  budgetHistogramCounts: number[];
  budgetFetchStrategy: BudgetFetchStrategy;
  budgetEstimatedTotal: number | null;
  budgetVisibleCount: number;
  scrollAfterLoadRef: RefObject<boolean>;
  setIsSearching: (value: boolean) => void;
  fetchShops: (
    nextStart: number,
    coords: GeoCoords,
    conditions?: ShopSearchConditions,
    options?: { scrollAfterLoad?: boolean },
  ) => Promise<void>;
  beginListLoading: () => void;
  resetSearchListState: () => void;
  setSearchConditions: Dispatch<SetStateAction<ShopSearchConditions>>;
  searchConditions: ShopSearchConditions;
};

export function useShopSearch({
  onSetErrorMessage,
  initialConditions,
  initialIsSearching = false,
}: UseShopSearchOptions): UseShopSearchResult {
  const [searchConditions, setSearchConditions] =
    useState<ShopSearchConditions>(
      () => initialConditions ?? HOME_SEARCH_CONDITIONS,
    );
  const [isSearching, setIsSearching] = useState(initialIsSearching);
  const [shops, setShops] = useState<Shop[]>([]);
  const [budgetHistogramCounts, setBudgetHistogramCounts] = useState<number[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [start, setStart] = useState(1);
  const [budgetFetchStrategy, setBudgetFetchStrategy] =
    useState<BudgetFetchStrategy>("none");
  const [budgetEstimatedTotal, setBudgetEstimatedTotal] = useState<number | null>(
    null,
  );
  const [budgetVisibleCount, setBudgetVisibleCount] = useState(0);

  const scrollAfterLoadRef = useRef(false);
  const budgetCatalogRef = useRef<Shop[]>([]);
  const budgetCatalogKeyRef = useRef("");
  const budgetHistogramKeyRef = useRef("");
  const histogramRequestIdRef = useRef(0);
  const searchRequestIdRef = useRef(0);

  const refreshBudgetHistogram = useCallback(
    async (
      coords: GeoCoords,
      conditions: ShopSearchConditions,
    ): Promise<void> => {
      const requestId = ++histogramRequestIdRef.current;

      if (isBudgetRangeActive(conditions.budgetMin, conditions.budgetMax)) {
        return;
      }
      const histogramKey = buildBudgetHistogramKey({
        lat: coords.lat,
        lng: coords.lng,
        conditions,
      });

      if (budgetHistogramKeyRef.current === histogramKey) {
        return;
      }

      const cached = readBudgetHistogramCache(histogramKey);
      if (cached) {
        if (requestId !== histogramRequestIdRef.current) return;
        budgetHistogramKeyRef.current = histogramKey;
        setBudgetHistogramCounts(cached);
        return;
      }

      const counts = await fetchBudgetHistogramCounts({
        lat: coords.lat,
        lng: coords.lng,
        conditions,
        order: ORDER_BY_SORT[conditions.sort],
      });

      if (requestId !== histogramRequestIdRef.current) return;
      budgetHistogramKeyRef.current = histogramKey;
      writeBudgetHistogramCache(histogramKey, counts);
      setBudgetHistogramCounts(counts);
    },
    [],
  );

  const resetSearchListState = useCallback((): void => {
      setIsSearching(false);
      onSetErrorMessage(null);
      setShops([]);
      setBudgetHistogramCounts([]);
      budgetCatalogRef.current = [];
      budgetCatalogKeyRef.current = "";
      budgetHistogramKeyRef.current = "";
      histogramRequestIdRef.current += 1;
      searchRequestIdRef.current += 1;
      setTotal(0);
      setStart(1);
      setSearchConditions(HOME_SEARCH_CONDITIONS);
      setBudgetFetchStrategy("none");
      setBudgetEstimatedTotal(null);
      setBudgetVisibleCount(0);
      scrollAfterLoadRef.current = false;
    }, [onSetErrorMessage]);

  const beginListLoading = useCallback((): void => {
    setShops([]);
    setBudgetHistogramCounts([]);
    budgetCatalogRef.current = [];
    budgetCatalogKeyRef.current = "";
    budgetHistogramKeyRef.current = "";
    histogramRequestIdRef.current += 1;
    searchRequestIdRef.current += 1;
    setTotal(0);
    setStart(1);
  }, []);

  const fetchShops = useCallback(
    async (
      nextStart: number,
      coords: GeoCoords,
      conditions: ShopSearchConditions = searchConditions,
      options: { scrollAfterLoad?: boolean } = {},
    ): Promise<void> => {
      const requestId = ++searchRequestIdRef.current;
      const isCurrentRequest = (): boolean =>
        requestId === searchRequestIdRef.current;
      const shouldScrollAfterLoad = options.scrollAfterLoad ?? true;

      setIsSearching(true);
      onSetErrorMessage(null);

      try {
        void refreshBudgetHistogram(coords, conditions);
        const strategy = resolveBudgetFetchStrategy(
          conditions.budgetMin,
          conditions.budgetMax,
        );
        if (!isCurrentRequest()) return;

        setBudgetFetchStrategy(strategy);
        const page = startIndexToPage(nextStart, SHOP_PAGE_SIZE);

        if (strategy === "multi-tier-preview") {
          const catalogKey = buildBudgetCatalogKey(coords, conditions);
          const shouldRebuildCatalog =
            nextStart === 1 || budgetCatalogKeyRef.current !== catalogKey;

          if (shouldRebuildCatalog) {
            const preview = await fetchMultiTierBudgetPreview({
              lat: coords.lat,
              lng: coords.lng,
              conditions,
              order: ORDER_BY_SORT[conditions.sort],
            });
            if (!isCurrentRequest()) return;

            budgetCatalogRef.current = preview.shops;
            budgetCatalogKeyRef.current = catalogKey;
            setBudgetEstimatedTotal(preview.estimatedTotal);
            setBudgetVisibleCount(preview.shops.length);
          }

          const sliceStart = (page - 1) * SHOP_PAGE_SIZE;
          setShops(
            budgetCatalogRef.current.slice(
              sliceStart,
              sliceStart + SHOP_PAGE_SIZE,
            ),
          );
          setTotal(budgetCatalogRef.current.length);
          setStart(nextStart);
          scrollAfterLoadRef.current = shouldScrollAfterLoad;
          return;
        }

        if (!isCurrentRequest()) return;

        budgetCatalogRef.current = [];
        budgetCatalogKeyRef.current = "";
        setBudgetEstimatedTotal(null);
        setBudgetVisibleCount(0);

        const searchParams = buildInternalSearchParams(
          coords,
          conditions,
          nextStart,
          ORDER_BY_SORT[conditions.sort],
          {
            budgetCode:
              resolveSingleBudgetCode(
                conditions.budgetMin,
                conditions.budgetMax,
              ) ?? undefined,
          },
        );

        let data: SearchApiResponse;
        try {
          data = await fetchSearchApi(searchParams, TEXT.search.fetchError);
        } catch (error: unknown) {
          if (!isCurrentRequest()) return;
          onSetErrorMessage(
            error instanceof Error ? error.message : TEXT.search.fetchError,
          );
          return;
        }

        if (!isCurrentRequest()) return;

        setShops(data.shops);
        setTotal(data.total);
        setStart(nextStart);
        scrollAfterLoadRef.current = shouldScrollAfterLoad;
      } catch {
        if (!isCurrentRequest()) return;
        onSetErrorMessage(TEXT.search.fetchError);
      } finally {
        if (isCurrentRequest()) {
          setIsSearching(false);
        }
      }
    },
    [onSetErrorMessage, refreshBudgetHistogram, searchConditions],
  );

  return {
    shops,
    total,
    start,
    isSearching,
    budgetHistogramCounts,
    budgetFetchStrategy,
    budgetEstimatedTotal,
    budgetVisibleCount,
    scrollAfterLoadRef,
    fetchShops,
    beginListLoading,
    resetSearchListState,
    setIsSearching,
    setSearchConditions,
    searchConditions,
  };
}
