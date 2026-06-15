"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  CategoryBento,
  GenreGrid,
  HomeHero,
  RecommendationSections,
} from "@/components/coco";
import { BottomNav, type BottomNavTab } from "@/components/ui/bottom-nav";
import { Typography, TypographyMuted } from "@/components/ui/typography";
import { TEXT } from "@/constants/text";
import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import {
  type SearchOption,
  type ShopSearchConditions,
} from "@/lib/search/filter-shops";
import { scrollContainerToTop } from "@/lib/search/scroll-list-top";
import {
  readSearchMastersCache,
  writeSearchMastersCache,
} from "@/lib/search/search-masters-cache";
import {
  sortBudgetOptions,
  sortGenreOptions,
} from "@/lib/search/sort-search-options";
import {
  RANGE_OPTIONS,
  type SearchUrlState,
} from "@/lib/search/search-url";
import type { RecommendationSection } from "@/types/recommendation";

/** 位置取得前のおすすめ用（東京駅付近） */
const DEFAULT_BROWSE_COORDS = {
  lat: 35.6812,
  lng: 139.7671,
} as const;

type ViewMode = "search" | "genres";

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

type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

/**
 * Issue 6 最小版: ホームタブ（ヒーロー・ジャンル・おすすめ）のみ。
 * 検索結果・詳細・他タブは後続 issue で拡張する。
 */
export function HomeContent({
  initialUrlState,
}: HomeContentProps): React.JSX.Element {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<BottomNavTab>("home");
  const [viewMode, setViewMode] = useState<ViewMode>("search");
  const [searchConditions, setSearchConditions] =
    useState<ShopSearchConditions>(initialUrlState.conditions);
  const [genreOptions, setGenreOptions] = useState<SearchOption[]>([]);
  const [isLoadingMasters, setIsLoadingMasters] = useState(true);
  const [mastersErrorMessage, setMastersErrorMessage] = useState<string | null>(
    null,
  );
  const [recommendationSections, setRecommendationSections] = useState<
    RecommendationSection[]
  >([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(true);

  useLayoutEffect(() => {
    const cached = readSearchMastersCache();
    if (!cached) return;

    setGenreOptions(sortGenreOptions(cached.genres));
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
    if (activeTab !== "home" || viewMode !== "search") {
      return undefined;
    }

    let active = true;

    const fetchRecommendations = async (): Promise<void> => {
      setIsLoadingRecommendations(true);

      try {
        const params = new URLSearchParams({
          lat: String(DEFAULT_BROWSE_COORDS.lat),
          lng: String(DEFAULT_BROWSE_COORDS.lng),
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
  }, [activeTab, searchConditions.range, viewMode]);

  const handleTabChange = (tab: BottomNavTab): void => {
    if (tab === activeTab) {
      scrollContainerToTop(scrollContainerRef.current);
      return;
    }

    if (tab === "home") {
      setViewMode("search");
    }

    setActiveTab(tab);
    scrollContainerToTop(scrollContainerRef.current);
  };

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="app-scroll-root relative mx-auto w-full min-w-0 max-w-[28rem]"
      >
        <main className="page-shell page-shell--flush-top mx-auto min-h-full w-full min-w-0">
          {activeTab === "home" && viewMode === "search" ? (
            <div className="min-w-0 space-y-10">
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
                  /* Issue 7 で検索フローを接続 */
                }}
              />

              <CategoryBento
                categories={genreOptions}
                isLoading={isLoadingMasters}
                onShowAll={() => {
                  setViewMode("genres");
                  scrollContainerToTop(scrollContainerRef.current);
                }}
                onSelect={() => {
                  /* Issue 7 でジャンル検索を接続 */
                }}
              />

              <RecommendationSections
                sections={recommendationSections}
                title={TEXT.recommendations.recommendationsNearby}
                hint={TEXT.recommendations.recommendationsApproxHint}
                isLoading={isLoadingRecommendations}
                showLocationAction
                locationActionLabel={TEXT.location.usePreciseLocationButton}
                onLocationAction={() => {
                  /* Issue 11 で位置取得を接続 */
                }}
                onShowSection={() => {
                  /* Issue 7 で特集検索を接続 */
                }}
                onSelectShop={() => {
                  /* Issue 10 で詳細を接続 */
                }}
              />

              {mastersErrorMessage ? (
                <p
                  role="alert"
                  className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
                >
                  {mastersErrorMessage}
                </p>
              ) : null}
            </div>
          ) : null}

          {activeTab === "home" && viewMode === "genres" ? (
            <GenreGrid
              categories={genreOptions}
              isLoading={isLoadingMasters}
              onBack={() => {
                setViewMode("search");
                scrollContainerToTop(scrollContainerRef.current);
              }}
              onSelect={() => {
                /* Issue 7 でジャンル検索を接続 */
              }}
            />
          ) : null}

          {activeTab !== "home" ? (
            <section className="space-y-3 px-1 pt-4">
              <Typography as="h1" variant="headline-md" className="font-brand">
                {activeTab === "search"
                  ? TEXT.common.navSearch
                  : activeTab === "history"
                    ? TEXT.saved.historyTitle
                    : TEXT.saved.favoritesTitle}
              </Typography>
              <TypographyMuted>
                {activeTab === "search"
                  ? TEXT.search.searchTabEmptyDescription
                  : activeTab === "history"
                    ? TEXT.saved.historyEmptyDescription
                    : TEXT.saved.favoritesEmptyDescription}
              </TypographyMuted>
            </section>
          ) : null}
        </main>
      </div>

      <BottomNav active={activeTab} onChange={handleTabChange} />
    </>
  );
}
