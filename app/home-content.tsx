"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence } from "motion/react";
import { MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";

import {
  CategoryBento,
  GenreGrid,
  HomeHero,
  PullNextPageBounceShell,
  PullNextPageRefreshFooter,
  RecommendationSections,
  RestaurantCard,
  RestaurantDetail,
  SearchConditionOverlay,
  SearchResultMeta,
  SkeletonCard,
} from "@/components/coco";
import { SearchActiveChips } from "@/components/coco/shop-list/search-active-chips";
import { AppBar } from "@/components/ui/app-bar";
import { BottomNav, type BottomNavTab } from "@/components/ui/bottom-nav";
import { Button } from "@/components/ui/button";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { PaginationBar } from "@/components/ui/pagination";
import { Typography, TypographyMuted } from "@/components/ui/typography";
import { SHOP_PAGE_SIZE } from "@/constants/pagination";
import { TEXT } from "@/constants/text";
import { useFavorites } from "@/hooks/use-favorites";
import { useLocationState } from "@/hooks/use-location-state";
import { usePullNextPage } from "@/hooks/use-pull-next-page";
import { useViewHistory } from "@/hooks/use-view-history";
import { useSearchUrlState } from "@/hooks/use-search-url-state";
import { useShopSearch } from "@/hooks/use-shop-search";
import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import { pageToStartIndex, startIndexToPage } from "@/lib/pagination/pagination-items";
import { serializeFeatureFiltersForCache } from "@/lib/search/feature-filters";
import { formatSearchConditionPlaceholder } from "@/lib/search/format-search-condition";
import {
  countActiveSearchConditions,
  DEFAULT_SHOP_SEARCH_CONDITIONS,
  serializeGenreCodes,
  type SearchOption,
  type ShopSearchConditions,
} from "@/lib/search/filter-shops";
import type { GeoCoords } from "@/lib/search/geolocation";
import { scrollContainerToTop } from "@/lib/search/scroll-list-top";
import {
  buildSearchConditionChips,
  removeSearchConditionChip,
} from "@/lib/search/search-condition-utils";
import {
  readSearchMastersCache,
  writeSearchMastersCache,
} from "@/lib/search/search-masters-cache";
import {
  RANGE_OPTIONS,
  resetConditionsForHomeSearch,
  type SearchUrlState,
} from "@/lib/search/search-url";
import {
  sortBudgetOptions,
  sortGenreOptions,
} from "@/lib/search/sort-search-options";
import { cn } from "@/lib/utils";
import type { RecommendationSection } from "@/types/recommendation";
import type { Shop } from "@/types/shop";

type ViewMode = "search" | "genres" | "list" | "detail";
type DetailReturnTarget = "home" | "search" | "history" | "favorites";
type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];
type ResultLoadingFeedback = "skeleton" | "quiet";

type SearchMastersResponse = {
  genres: SearchOption[];
  budgets: SearchOption[];
  specials?: SpecialSearchOption[];
  message?: string;
};

type RecommendationsResponse = {
  sections: RecommendationSection[];
  message?: string;
};

type HomeContentProps = {
  initialUrlState: SearchUrlState;
};

const SKELETON_DELAY_MS = 450;
const SLOW_RANGE_VALUES = new Set(["4", "5"]);

function areFeatureFiltersEqual(
  current: ShopSearchConditions,
  next: ShopSearchConditions,
): boolean {
  return (
    serializeFeatureFiltersForCache(current.featureFilters) ===
    serializeFeatureFiltersForCache(next.featureFilters)
  );
}

function areGenreCodesEqual(
  current: ShopSearchConditions,
  next: ShopSearchConditions,
): boolean {
  return (
    serializeGenreCodes(current.genreCodes) ===
    serializeGenreCodes(next.genreCodes)
  );
}

function getConditionChangeLoadingFeedback(
  current: ShopSearchConditions,
  next: ShopSearchConditions,
): ResultLoadingFeedback {
  const budgetOnlyChanged =
    current.keyword === next.keyword &&
    current.range === next.range &&
    areGenreCodesEqual(current, next) &&
    current.specialCode === next.specialCode &&
    areFeatureFiltersEqual(current, next) &&
    current.partyCapacity === next.partyCapacity &&
    current.sort === next.sort &&
    current.lunchFilter === next.lunchFilter &&
    (current.budgetMin !== next.budgetMin ||
      current.budgetMax !== next.budgetMax);

  if (budgetOnlyChanged) return "quiet";

  const sortOnlyChanged =
    current.keyword === next.keyword &&
    current.range === next.range &&
    areGenreCodesEqual(current, next) &&
    current.lunchFilter === next.lunchFilter &&
    current.budgetMin === next.budgetMin &&
    current.budgetMax === next.budgetMax &&
    current.specialCode === next.specialCode &&
    areFeatureFiltersEqual(current, next) &&
    current.partyCapacity === next.partyCapacity &&
    current.sort !== next.sort;

  if (sortOnlyChanged) return "quiet";

  if (current.range !== next.range) {
    return SLOW_RANGE_VALUES.has(next.range) ? "skeleton" : "quiet";
  }

  if (
    current.keyword !== next.keyword ||
    !areGenreCodesEqual(current, next) ||
    current.specialCode !== next.specialCode ||
    !areFeatureFiltersEqual(current, next) ||
    current.partyCapacity !== next.partyCapacity
  ) {
    return "skeleton";
  }

  return "quiet";
}

/** Issue 6–7: ホーム + 検索フロー（結果リストの店舗カードは Issue 8） */
export function HomeContent({
  initialUrlState,
}: HomeContentProps): React.JSX.Element {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.toString();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const skeletonTimerRef = useRef<number | null>(null);
  const didInitialUrlFetchRef = useRef(false);
  const pendingHomeScrollTopRef = useRef<number | null>(null);
  const viewModeBeforeDetailRef = useRef<ViewMode>("search");
  const distanceBackfilledRef = useRef<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    initialUrlState.hasConditions ? "list" : "search",
  );
  const [searchOrigin, setSearchOrigin] = useState<GeoCoords | null>(null);
  const [searchInput, setSearchInput] = useState(
    () => initialUrlState.conditions.keyword,
  );
  const [searchExpanded, setSearchExpanded] = useState(
    () => initialUrlState.hasConditions,
  );
  const [activeTab, setActiveTab] = useState<BottomNavTab>("home");
  const [conditionPanelOpen, setConditionPanelOpen] = useState(false);
  const [showSearchSkeleton, setShowSearchSkeleton] = useState(false);
  const [genreOptions, setGenreOptions] = useState<SearchOption[]>([]);
  const [budgetOptions, setBudgetOptions] = useState<SearchOption[]>([]);
  const [specialOptions, setSpecialOptions] = useState<SpecialSearchOption[]>(
    [],
  );
  const [isLoadingMasters, setIsLoadingMasters] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [recommendationSections, setRecommendationSections] = useState<
    RecommendationSection[]
  >([]);
  const [mastersErrorMessage, setMastersErrorMessage] = useState<string | null>(
    null,
  );
  /** Issue 10: 詳細ビュー用の選択店舗 */
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [detailReturnTarget, setDetailReturnTarget] =
    useState<DetailReturnTarget>("search");

  const { isFavorite, toggleFavorite } = useFavorites();
  const { recordView } = useViewHistory();

  const {
    lat,
    lng,
    locationSource,
    locationLabel,
    isResolvingInitialGeo,
    isLocating,
    resolveBrowseCoords,
    resolvePreciseCoords,
    resetLocating,
  } = useLocationState({ onSetErrorMessage: setErrorMessage });

  const {
    shops,
    total,
    start,
    isSearching,
    budgetHistogramCounts,
    scrollAfterLoadRef,
    fetchShops,
    beginListLoading,
    resetSearchListState,
    setIsSearching,
    setSearchConditions,
    searchConditions,
  } = useShopSearch({
    onSetErrorMessage: setErrorMessage,
    initialConditions: initialUrlState.hasConditions
      ? initialUrlState.conditions
      : undefined,
    initialIsSearching: initialUrlState.hasConditions,
  });

  const fetchShopsRef = useRef(fetchShops);
  fetchShopsRef.current = fetchShops;
  const resolveBrowseCoordsRef = useRef(resolveBrowseCoords);
  resolveBrowseCoordsRef.current = resolveBrowseCoords;

  const clearSkeletonTimer = useCallback((): void => {
    if (skeletonTimerRef.current === null) return;
    window.clearTimeout(skeletonTimerRef.current);
    skeletonTimerRef.current = null;
  }, []);

  const beginResultLoadingFeedback = useCallback(
    (feedback: ResultLoadingFeedback): void => {
      clearSkeletonTimer();
      setShowSearchSkeleton(false);

      if (feedback !== "skeleton") return;

      skeletonTimerRef.current = window.setTimeout(() => {
        skeletonTimerRef.current = null;
        setShowSearchSkeleton(true);
      }, SKELETON_DELAY_MS);
    },
    [clearSkeletonTimer],
  );

  const resetToHome = useCallback((): void => {
    setActiveTab("home");
    setViewMode("search");
    resetLocating();
    resetSearchListState();
    setSearchExpanded(false);
    setSearchInput("");
    setConditionPanelOpen(false);
    clearSkeletonTimer();
    setShowSearchSkeleton(false);
  }, [clearSkeletonTimer, resetLocating, resetSearchListState]);

  const onSyncFromUrl = useCallback(
    async (urlState: SearchUrlState): Promise<void> => {
      setSearchConditions(urlState.conditions);
      setSearchInput(urlState.conditions.keyword);
      setActiveTab("search");
      setViewMode("list");
      setSearchExpanded(true);
      setIsSearching(true);
      setErrorMessage(null);
      beginResultLoadingFeedback(
        SLOW_RANGE_VALUES.has(urlState.conditions.range) ? "skeleton" : "quiet",
      );

      const coords = await resolveBrowseCoordsRef.current({ tryPrecise: true });
      if (!coords) {
        setIsSearching(false);
        return;
      }

      setSearchOrigin(coords);
      await fetchShopsRef.current(
        pageToStartIndex(urlState.page, SHOP_PAGE_SIZE),
        coords,
        urlState.conditions,
      );
    },
    [beginResultLoadingFeedback, setIsSearching, setSearchConditions],
  );

  const { pushSearchUrl, replaceSearchUrl, pushHomeUrl, parseCurrentUrl } =
    useSearchUrlState({
      urlQuery,
      budgetOptions,
      bootstrapUrlState: initialUrlState.hasConditions ? initialUrlState : null,
      onResetHome: resetToHome,
      onSyncFromUrl,
    });

  useLayoutEffect(() => {
    if (!initialUrlState.hasConditions) return;
    beginResultLoadingFeedback(
      SLOW_RANGE_VALUES.has(initialUrlState.conditions.range)
        ? "skeleton"
        : "quiet",
    );
  }, [beginResultLoadingFeedback, initialUrlState]);

  useEffect(() => {
    if (!initialUrlState.hasConditions || didInitialUrlFetchRef.current) return;
    didInitialUrlFetchRef.current = true;
    void onSyncFromUrl(initialUrlState);
  }, [initialUrlState, onSyncFromUrl]);

  const currentPage = useMemo(
    () => startIndexToPage(start, SHOP_PAGE_SIZE),
    [start],
  );
  const totalPages = useMemo(
    () => (total > 0 ? Math.ceil(total / SHOP_PAGE_SIZE) : 0),
    [total],
  );

  const searchConditionPlaceholder = useMemo(
    () =>
      formatSearchConditionPlaceholder(
        searchConditions,
        RANGE_OPTIONS,
        genreOptions,
        { specials: specialOptions },
      ),
    [genreOptions, searchConditions, specialOptions],
  );
  const activeConditionCount = useMemo(
    () => countActiveSearchConditions(searchConditions),
    [searchConditions],
  );
  const activeConditionChips = useMemo(() => {
    const rangeLabel =
      RANGE_OPTIONS.find((option) => option.value === searchConditions.range)
        ?.label ?? RANGE_OPTIONS[0].label;
    return buildSearchConditionChips(searchConditions, {
      genres: genreOptions,
      specials: specialOptions,
      rangeLabel,
    });
  }, [genreOptions, searchConditions, specialOptions]);
  const recommendationTitle = useMemo(() => {
    if (locationSource === "precise") {
      return TEXT.recommendations.recommendationsNearby;
    }
    if (locationLabel) {
      return `${locationLabel}のおすすめ`;
    }
    return TEXT.recommendations.recommendationsTitle;
  }, [locationLabel, locationSource]);
  const recommendationHint = useMemo(() => {
    if (locationSource !== "approximate") return null;
    return TEXT.recommendations.recommendationsApproxHint;
  }, [locationSource]);

  const isHomeTab = activeTab === "home";
  const isSearchTab = activeTab === "search";
  const isSearchListView = isSearchTab && viewMode === "list";
  const hasSearched = searchOrigin !== null;
  const showAppBar = isSearchListView;
  const needsLocationForList =
    viewMode === "list" &&
    lat === null &&
    lng === null &&
    !isSearching &&
    !isLocating;
  const showResultSkeleton =
    showSearchSkeleton && (isSearching || isLocating) && !needsLocationForList;
  const hasNextPage =
    viewMode === "list" &&
    totalPages > 1 &&
    currentPage < totalPages &&
    lat !== null &&
    lng !== null;

  const pullNextPage = usePullNextPage({
    containerRef: scrollContainerRef,
    enabled:
      isSearchListView &&
      viewMode === "list" &&
      shops.length > 0 &&
      !isSearching &&
      !isLocating,
    hasNextPage,
    resetSignal: start,
    onLoadNext: async () => {
      if (lat === null || lng === null || currentPage >= totalPages) return;
      const nextPage = currentPage + 1;
      scrollAfterLoadRef.current = false;
      scrollContainerToTop(scrollContainerRef.current);
      pushSearchUrl(searchConditions, nextPage);
      await fetchShops(
        pageToStartIndex(nextPage, SHOP_PAGE_SIZE),
        searchOrigin ?? { lat, lng },
        searchConditions,
      );
    },
  });

  useLayoutEffect(() => {
    if (isSearching || !scrollAfterLoadRef.current) return;

    scrollAfterLoadRef.current = false;
    scrollContainerToTop(scrollContainerRef.current);
  }, [isSearching, scrollAfterLoadRef, shops]);

  useEffect(() => {
    if (isSearching || isLocating) return;

    clearSkeletonTimer();
    setShowSearchSkeleton(false);
  }, [clearSkeletonTimer, isLocating, isSearching]);

  useEffect(() => {
    return () => {
      clearSkeletonTimer();
    };
  }, [clearSkeletonTimer]);

  useLayoutEffect(() => {
    if (viewMode !== "detail" || !selectedShop) return;

    scrollContainerToTop(scrollContainerRef.current);
  }, [selectedShop, viewMode]);

  useLayoutEffect(() => {
    if (viewMode !== "search") return;

    const scrollTop = pendingHomeScrollTopRef.current;
    if (scrollTop === null) return;

    pendingHomeScrollTopRef.current = null;
    const container = scrollContainerRef.current;
    if (!container) return;

    const restore = (): void => {
      container.scrollTop = scrollTop;
    };

    restore();
    requestAnimationFrame(() => {
      restore();
      requestAnimationFrame(restore);
    });
    window.setTimeout(restore, 100);
  }, [viewMode]);

  // 共有ディープリンク `?shop=<id>`: コールド起動で fetch-by-id → 詳細を直接開く
  useEffect(() => {
    const shopId = initialUrlState.shopId;
    if (!shopId) return;

    let active = true;

    const loadSharedShop = async (): Promise<void> => {
      try {
        const response = await fetch(`/api/shop/${encodeURIComponent(shopId)}`, {
          method: "GET",
        });
        const data = (await response.json()) as { shop?: Shop; message?: string };
        if (!active) return;
        if (!response.ok || !data.shop) {
          setErrorMessage(data.message ?? TEXT.shop.sharedShopNotFound);
          return;
        }
        recordView(data.shop);
        viewModeBeforeDetailRef.current = "search";
        setSelectedShop(data.shop);
        setDetailReturnTarget("home");
        setViewMode("detail");
      } catch {
        if (active) setErrorMessage(TEXT.shop.sharedShopNotFound);
      }
    };

    void loadSharedShop();

    return () => {
      active = false;
    };
    // 初回 URL の shopId のみ対象（マウント時1回）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // コールド復元した詳細の距離を、位置取得後に補完する（1店舗1回まで）
  useEffect(() => {
    if (viewMode !== "detail" || !selectedShop) return;
    if (selectedShop.distanceMeters !== null) return;
    if (lat === null || lng === null) return;
    if (distanceBackfilledRef.current === selectedShop.id) return;

    distanceBackfilledRef.current = selectedShop.id;
    const targetId = selectedShop.id;
    let active = true;

    void (async () => {
      try {
        const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
        const response = await fetch(
          `/api/shop/${encodeURIComponent(targetId)}?${params}`,
          { method: "GET" },
        );
        const data = (await response.json()) as { shop?: Shop };
        if (!active || !response.ok || !data.shop) return;
        setSelectedShop((current) =>
          current && current.id === targetId ? data.shop! : current,
        );
      } catch {
        // 補完失敗は無視（距離欄は非表示のまま）
      }
    })();

    return () => {
      active = false;
    };
  }, [lat, lng, selectedShop, viewMode]);

  useLayoutEffect(() => {
    const cached = readSearchMastersCache();
    if (!cached) return;

    setGenreOptions(sortGenreOptions(cached.genres));
    setBudgetOptions(sortBudgetOptions(cached.budgets));
    setSpecialOptions(cached.specials);
    setIsLoadingMasters(false);
  }, []);

  useEffect(() => {
    let active = true;

    const fetchMasters = async (): Promise<void> => {
      const cached = readSearchMastersCache();
      if (cached) {
        setIsLoadingMasters(false);
        return;
      }

      try {
        const response = await fetch("/api/search/masters", { method: "GET" });
        const data = (await response.json()) as SearchMastersResponse;

        if (!active) return;

        if (!response.ok) {
          setMastersErrorMessage(
            data.message ?? "検索条件マスターの取得に失敗しました。",
          );
          return;
        }

        const genres = sortGenreOptions(data.genres ?? []);
        const budgets = sortBudgetOptions(data.budgets ?? []);
        const specials = data.specials ?? [];
        writeSearchMastersCache(genres, budgets, specials);
        setGenreOptions(genres);
        setBudgetOptions(budgets);
        setSpecialOptions(specials);
        setMastersErrorMessage(null);
      } catch {
        if (active) {
          setMastersErrorMessage("検索条件マスターの取得に失敗しました。");
        }
      } finally {
        if (active) {
          setIsLoadingMasters(false);
        }
      }
    };

    void fetchMasters();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHomeTab || viewMode !== "search") {
      return undefined;
    }

    let active = true;

    const fetchRecommendations = async (): Promise<void> => {
      if (lat === null || lng === null) {
        if (!isResolvingInitialGeo) {
          setRecommendationSections([]);
        }
        return;
      }

      setIsLoadingRecommendations(true);

      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
          range: searchConditions.range,
        });
        const response = await fetch(`/api/search/recommendations?${params}`, {
          method: "GET",
        });
        const data = (await response.json()) as RecommendationsResponse;

        if (!active) return;
        if (!response.ok) {
          setRecommendationSections([]);
          return;
        }

        setRecommendationSections(data.sections ?? []);
      } catch {
        if (active) {
          setRecommendationSections([]);
        }
      } finally {
        if (active) {
          setIsLoadingRecommendations(false);
        }
      }
    };

    void fetchRecommendations();

    return () => {
      active = false;
    };
  }, [
    isHomeTab,
    isResolvingInitialGeo,
    lat,
    lng,
    searchConditions.range,
    viewMode,
  ]);

  const startListWithConditions = (conditions: ShopSearchConditions): void => {
    setSearchConditions(conditions);
    pushSearchUrl(conditions);
    setActiveTab("search");
    setViewMode("list");
    setSearchInput(conditions.keyword);
    setSearchExpanded(true);
    beginListLoading();
  };

  const handleRecommendationLocationAction = async (): Promise<void> => {
    setErrorMessage(null);
    await resolvePreciseCoords();
  };

  const handleListLocationResolve = async (): Promise<void> => {
    setErrorMessage(null);
    const coords = await resolvePreciseCoords();
    if (!coords) return;

    const urlState = parseCurrentUrl();
    if (!urlState.hasConditions) return;

    beginResultLoadingFeedback("skeleton");
    setSearchOrigin(coords);
    await fetchShops(
      pageToStartIndex(urlState.page, SHOP_PAGE_SIZE),
      coords,
      urlState.conditions,
    );
  };

  const handleSearchFromHere = async (): Promise<void> => {
    setErrorMessage(null);

    const coords = await resolvePreciseCoords();
    if (!coords) return;

    const nextConditions =
      viewMode === "search"
        ? resetConditionsForHomeSearch(searchConditions)
        : searchConditions;

    setSearchOrigin(coords);
    startListWithConditions(nextConditions);
    beginResultLoadingFeedback("skeleton");
    await fetchShops(1, coords, nextConditions);
  };

  const searchFromHomeWithConditions = async (
    conditions: ShopSearchConditions,
  ): Promise<void> => {
    setErrorMessage(null);

    let coords = await resolveBrowseCoords();
    if (!coords) {
      coords = await resolvePreciseCoords();
    }
    if (!coords) return;

    setSearchOrigin(coords);
    startListWithConditions(conditions);
    beginResultLoadingFeedback("skeleton");
    await fetchShops(1, coords, conditions);
  };

  const handleCategorySearch = (category: SearchOption): void => {
    void searchFromHomeWithConditions({
      ...DEFAULT_SHOP_SEARCH_CONDITIONS,
      genreCodes: [category.code],
    });
  };

  const handleSpecialSearch = (special: Pick<SearchOption, "code">): void => {
    void searchFromHomeWithConditions({
      ...DEFAULT_SHOP_SEARCH_CONDITIONS,
      specialCode: special.code,
    });
  };

  const applySearchConditions = useCallback(
    (
      conditions: ShopSearchConditions,
      options: { closePanel?: boolean } = {},
    ): void => {
      if (options.closePanel) {
        setConditionPanelOpen(false);
      }
      setSearchConditions(conditions);
      const origin =
        searchOrigin ?? (lat !== null && lng !== null ? { lat, lng } : null);
      if (origin === null) return;
      if (viewMode !== "list") setViewMode("list");

      beginResultLoadingFeedback(
        getConditionChangeLoadingFeedback(searchConditions, conditions),
      );
      replaceSearchUrl(conditions);
      void fetchShops(1, origin, conditions);
    },
    [
      beginResultLoadingFeedback,
      fetchShops,
      lat,
      lng,
      replaceSearchUrl,
      searchConditions,
      searchOrigin,
      setSearchConditions,
      viewMode,
    ],
  );

  const handleConditionApply = (conditions: ShopSearchConditions): void => {
    applySearchConditions(conditions, { closePanel: true });
  };

  const handleSearchSubmit = (): void => {
    if (viewMode === "search") {
      void handleSearchFromHere();
      return;
    }
    if (viewMode === "list" && lat !== null && lng !== null) {
      const nextConditions = {
        ...searchConditions,
        keyword: searchInput.trim(),
      };
      setSearchConditions(nextConditions);
      beginResultLoadingFeedback(
        getConditionChangeLoadingFeedback(searchConditions, nextConditions),
      );
      replaceSearchUrl(nextConditions);
      void fetchShops(1, searchOrigin ?? { lat, lng }, nextConditions);
    }
  };

  const handleTabChange = (tab: BottomNavTab): void => {
    if (tab === activeTab) {
      scrollContainerToTop(scrollContainerRef.current);
      return;
    }

    if (tab === "home") {
      if (viewMode === "list" || viewMode === "detail") setViewMode("search");
    } else if (tab === "search") {
      setViewMode("list");
    }

    setActiveTab(tab);
    scrollContainerToTop(scrollContainerRef.current);
  };

  const handleAppBarBack = (): void => {
    if (viewMode === "list") {
      resetToHome();
      pushHomeUrl();
    }
  };

  const handleSelectShop = (
    shop: Shop,
    returnTarget: DetailReturnTarget = "search",
  ): void => {
    if (returnTarget === "home") {
      pendingHomeScrollTopRef.current = scrollContainerRef.current?.scrollTop ?? 0;
    }
    if (viewMode !== "detail") {
      viewModeBeforeDetailRef.current = viewMode;
    }
    recordView(shop);
    setSelectedShop(shop);
    setDetailReturnTarget(returnTarget);
    setViewMode("detail");
  };

  const handleDetailBack = (): void => {
    setSelectedShop(null);

    if (detailReturnTarget === "home") {
      setActiveTab("home");
      setViewMode("search");
      return;
    }
    if (detailReturnTarget === "search") {
      setActiveTab("search");
      setViewMode("list");
      return;
    }
    setActiveTab(detailReturnTarget);
    setViewMode(viewModeBeforeDetailRef.current);
  };

  return (
    <>
      {showAppBar ? (
        <AppBar
          mode="results"
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearchSubmit}
          placeholder={searchConditionPlaceholder}
          showBack
          onBack={handleAppBarBack}
          searchExpanded={searchExpanded}
          onSearchExpandedChange={setSearchExpanded}
          showFilter
          filterActiveCount={activeConditionCount}
          filterExpanded={conditionPanelOpen}
          onFilterClick={() => {
            setConditionPanelOpen((current) => !current);
          }}
        />
      ) : null}

      <AnimatePresence>
        {isSearchTab && viewMode !== "detail" && conditionPanelOpen ? (
          <SearchConditionOverlay
            key="filter-overlay"
            open={conditionPanelOpen}
            coords={
              searchOrigin ??
              (lat !== null && lng !== null ? { lat, lng } : null)
            }
            conditions={searchConditions}
            rangeOptions={RANGE_OPTIONS}
            genres={genreOptions}
            specials={specialOptions}
            budgetHistogramCounts={budgetHistogramCounts}
            mastersErrorMessage={mastersErrorMessage}
            initialTotal={total}
            onApply={handleConditionApply}
            onClose={() => {
              setConditionPanelOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>

      <div
        ref={scrollContainerRef}
        className="app-scroll-root relative mx-auto w-full min-w-0 max-w-[28rem]"
      >
        {showAppBar ? <div aria-hidden className="app-bar-spacer" /> : null}
        <main
          className={cn(
            "page-shell mx-auto min-h-full w-full min-w-0",
            showAppBar && "page-shell--under-app-bar",
            (viewMode === "detail" ||
              viewMode === "search" ||
              viewMode === "genres") &&
              "page-shell--flush-top",
          )}
        >
          <div className="min-w-0 space-y-10">
            {isHomeTab && viewMode === "search" ? (
              <>
                <HomeHero
                  range={searchConditions.range}
                  onRangeChange={(value) => {
                    setSearchConditions((current) => ({
                      ...current,
                      range: value as RangeValue,
                    }));
                  }}
                  rangeOptions={RANGE_OPTIONS}
                  onSearchFromHere={() => {
                    void handleSearchFromHere();
                  }}
                />

                <CategoryBento
                  categories={genreOptions}
                  isLoading={isLoadingMasters}
                  onShowAll={() => {
                    setViewMode("genres");
                    scrollContainerToTop(scrollContainerRef.current);
                  }}
                  onSelect={handleCategorySearch}
                />

                <RecommendationSections
                  sections={recommendationSections}
                  title={recommendationTitle}
                  hint={recommendationHint}
                  emptyMessage={
                    lat === null && lng === null && !isResolvingInitialGeo
                      ? TEXT.recommendations.recommendationsEmpty
                      : null
                  }
                  isLoading={isResolvingInitialGeo || isLoadingRecommendations}
                  showLocationAction={locationSource !== "precise"}
                  locationActionLabel={TEXT.location.usePreciseLocationButton}
                  isLocating={isLocating}
                  onLocationAction={() => {
                    void handleRecommendationLocationAction();
                  }}
                  onShowSection={handleSpecialSearch}
                  onSelectShop={(shop) => {
                    handleSelectShop(shop, "home");
                  }}
                />

                {errorMessage ? (
                  <p
                    role="alert"
                    className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
                  >
                    {errorMessage}
                  </p>
                ) : null}

                {mastersErrorMessage ? (
                  <p
                    role="alert"
                    className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
                  >
                    {mastersErrorMessage}
                  </p>
                ) : null}
              </>
            ) : null}

            {isHomeTab && viewMode === "genres" ? (
              <GenreGrid
                categories={genreOptions}
                isLoading={isLoadingMasters}
                onBack={() => {
                  setViewMode("search");
                  scrollContainerToTop(scrollContainerRef.current);
                }}
                onSelect={handleCategorySearch}
              />
            ) : null}

            {errorMessage &&
            isSearchListView &&
            !needsLocationForList ? (
              <p
                role="alert"
                className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
              >
                {errorMessage}
              </p>
            ) : null}

            {isSearchListView ? (
              <PullNextPageBounceShell
                pullOffset={pullNextPage.pullOffset}
                isPulling={pullNextPage.isPulling}
                snapBack={pullNextPage.snapBack}
              >
              <section className="relative min-w-0 space-y-3">
                {!hasSearched && !isSearching && !isLocating ? (
                  <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
                    <Typography as="h2" variant="headline-md" className="font-brand">
                      {TEXT.search.searchTabEmptyTitle}
                    </Typography>
                    <TypographyMuted>
                      {TEXT.search.searchTabEmptyDescription}
                    </TypographyMuted>
                    <LiquidGlassButton
                      variant="primary"
                      className="mt-2 h-12 gap-2 px-6"
                      disabled={isLocating}
                      onClick={() => {
                        void handleSearchFromHere();
                      }}
                    >
                      <MapPin className="size-5" aria-hidden />
                      {TEXT.hero.searchFromHereButton}
                    </LiquidGlassButton>
                  </div>
                ) : null}

                {hasSearched && !isLocating && !needsLocationForList ? (
                  <div className="space-y-3 pt-2">
                    <SearchResultMeta
                      total={total}
                      sort={searchConditions.sort}
                      onSortChange={(sort) => {
                        applySearchConditions({ ...searchConditions, sort });
                      }}
                    />
                    {activeConditionChips.length > 0 ? (
                      <SearchActiveChips
                        chips={activeConditionChips}
                        onRemove={(chip) => {
                          applySearchConditions(
                            removeSearchConditionChip(searchConditions, chip),
                          );
                        }}
                        onClearAll={() => {
                          applySearchConditions(DEFAULT_SHOP_SEARCH_CONDITIONS);
                        }}
                      />
                    ) : null}
                  </div>
                ) : null}

                {showResultSkeleton ? (
                  <div className="space-y-3" aria-busy="true" aria-live="polite">
                    {Array.from({ length: SHOP_PAGE_SIZE }, (_, index) => (
                      <SkeletonCard key={index} delayMs={index * 120} />
                    ))}
                  </div>
                ) : null}

                {hasSearched && needsLocationForList ? (
                  <div className="space-y-3 rounded-lg border border-border bg-surface-muted px-4 py-4 pt-2">
                    <p className="text-sm text-foreground">
                      {TEXT.location.locationMissingList}
                    </p>
                    <Button
                      type="button"
                      onClick={() => {
                        void handleListLocationResolve();
                      }}
                      disabled={isLocating}
                    >
                      {isLocating
                        ? TEXT.location.locationLoading
                        : TEXT.location.locationMissingListAction}
                    </Button>
                  </div>
                ) : null}

                {hasSearched &&
                !needsLocationForList &&
                !isSearching &&
                !isLocating &&
                !errorMessage &&
                shops.length === 0 ? (
                  <TypographyMuted>{TEXT.search.noResults}</TypographyMuted>
                ) : null}

                {!showResultSkeleton && !isLocating && shops.length > 0 ? (
                  <div className="min-w-0 space-y-3">
                    {shops.map((shop) => (
                      <RestaurantCard
                        key={shop.id}
                        shop={shop}
                        isFavorite={isFavorite(shop.id)}
                        onToggleFavorite={toggleFavorite}
                        onShowDetail={() => {
                          handleSelectShop(shop, "search");
                        }}
                      />
                    ))}
                  </div>
                ) : null}

                {!showResultSkeleton && !isLocating ? (
                  <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    disabled={isSearching || lat === null || lng === null}
                    onPageChange={(page) => {
                      const origin =
                        searchOrigin ??
                        (lat !== null && lng !== null ? { lat, lng } : null);
                      if (!origin) return;
                      pushSearchUrl(searchConditions, page);
                      void fetchShops(
                        pageToStartIndex(page, SHOP_PAGE_SIZE),
                        origin,
                        searchConditions,
                      );
                    }}
                  />
                ) : null}

                <PullNextPageRefreshFooter
                  pullOffset={pullNextPage.pullOffset}
                  pullDistance={pullNextPage.pullDistance}
                  isCommitted={pullNextPage.isCommitted}
                  isRefreshing={pullNextPage.isRefreshing}
                  hasNextPage={hasNextPage}
                />
              </section>
              </PullNextPageBounceShell>
            ) : null}

            {activeTab !== "home" && activeTab !== "search" ? (
              <section className="space-y-3 px-1 pt-4">
                <Typography as="h1" variant="headline-md" className="font-brand">
                  {activeTab === "history"
                    ? TEXT.saved.historyTitle
                    : TEXT.saved.favoritesTitle}
                </Typography>
                <TypographyMuted>
                  {activeTab === "history"
                    ? TEXT.saved.historyEmptyDescription
                    : TEXT.saved.favoritesEmptyDescription}
                </TypographyMuted>
              </section>
            ) : null}

            {viewMode === "detail" && selectedShop ? (
              <RestaurantDetail
                shop={selectedShop}
                onBack={handleDetailBack}
                isFavorite={isFavorite(selectedShop.id)}
                onToggleFavorite={() => {
                  toggleFavorite(selectedShop);
                }}
              />
            ) : null}
          </div>
        </main>
      </div>

      <BottomNav
        active={activeTab}
        onChange={handleTabChange}
        hidden={viewMode === "detail" || conditionPanelOpen}
      />
    </>
  );
}
