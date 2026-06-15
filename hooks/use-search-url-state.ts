"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import type { SearchOption, ShopSearchConditions } from "@/lib/search/filter-shops";
import {
  buildSearchUrl,
  parseSearchUrl,
  type SearchUrlState,
} from "@/lib/search/search-url";

type UseSearchUrlStateOptions = {
  urlQuery: string;
  budgetOptions: SearchOption[];
  /** Server / 初回描画で既に UI へ反映済みの URL 状態（二重同期を防ぐ） */
  bootstrapUrlState?: SearchUrlState | null;
  onResetHome: () => void;
  onSyncFromUrl: (urlState: SearchUrlState) => Promise<void>;
};

type UseSearchUrlStateResult = {
  pushSearchUrl: (conditions: ShopSearchConditions, page?: number) => void;
  replaceSearchUrl: (conditions: ShopSearchConditions, page?: number) => void;
  pushHomeUrl: () => void;
  parseCurrentUrl: () => SearchUrlState;
};

export function useSearchUrlState({
  urlQuery,
  budgetOptions,
  bootstrapUrlState = null,
  onResetHome,
  onSyncFromUrl,
}: UseSearchUrlStateOptions): UseSearchUrlStateResult {
  const router = useRouter();
  const skippedUrlSyncRef = useRef<string | null>(null);
  const syncedUrlQueryRef = useRef<string | null>(null);
  const syncedConditionsKeyRef = useRef<string | null>(null);
  const bootstrapUrlStateRef = useRef(bootstrapUrlState);
  const onResetHomeRef = useRef(onResetHome);
  const onSyncFromUrlRef = useRef(onSyncFromUrl);

  onResetHomeRef.current = onResetHome;
  onSyncFromUrlRef.current = onSyncFromUrl;

  const markSkippedUrlSync = useCallback((nextUrl: string): void => {
    const queryIndex = nextUrl.indexOf("?");
    skippedUrlSyncRef.current =
      queryIndex === -1 ? "" : nextUrl.slice(queryIndex + 1);
  }, []);

  const pushSearchUrl = useCallback(
    (conditions: ShopSearchConditions, page = 1): void => {
      const nextUrl = buildSearchUrl(conditions, page);
      markSkippedUrlSync(nextUrl);
      router.push(nextUrl);
    },
    [markSkippedUrlSync, router],
  );

  const replaceSearchUrl = useCallback(
    (conditions: ShopSearchConditions, page = 1): void => {
      const nextUrl = buildSearchUrl(conditions, page);
      markSkippedUrlSync(nextUrl);
      router.replace(nextUrl);
    },
    [markSkippedUrlSync, router],
  );

  const pushHomeUrl = useCallback((): void => {
    skippedUrlSyncRef.current = "";
    router.push("/");
  }, [router]);

  const parseCurrentUrl = useCallback((): SearchUrlState => {
    return parseSearchUrl(new URLSearchParams(urlQuery), budgetOptions);
  }, [budgetOptions, urlQuery]);

  useEffect(() => {
    const urlState = parseSearchUrl(
      new URLSearchParams(urlQuery),
      budgetOptions,
    );
    const conditionsKey = JSON.stringify(urlState.conditions);

    if (skippedUrlSyncRef.current === urlQuery) {
      skippedUrlSyncRef.current = null;
      if (urlState.hasConditions) {
        syncedUrlQueryRef.current = urlQuery;
        syncedConditionsKeyRef.current = conditionsKey;
      } else {
        syncedUrlQueryRef.current = null;
        syncedConditionsKeyRef.current = null;
      }
      return;
    }

    if (!urlState.hasConditions) {
      const wasSearchUrl = syncedUrlQueryRef.current !== null;
      syncedUrlQueryRef.current = null;
      syncedConditionsKeyRef.current = null;
      bootstrapUrlStateRef.current = null;
      if (wasSearchUrl) {
        onResetHomeRef.current();
      }
      return;
    }

    const bootstrap = bootstrapUrlStateRef.current;
    if (bootstrap?.hasConditions) {
      const bootstrapKey = JSON.stringify(bootstrap.conditions);
      if (
        urlState.page === bootstrap.page &&
        conditionsKey === bootstrapKey
      ) {
        syncedUrlQueryRef.current = urlQuery;
        syncedConditionsKeyRef.current = conditionsKey;
        bootstrapUrlStateRef.current = null;
        return;
      }
    }

    if (
      syncedUrlQueryRef.current === urlQuery &&
      syncedConditionsKeyRef.current === conditionsKey
    ) {
      return;
    }

    syncedUrlQueryRef.current = urlQuery;
    syncedConditionsKeyRef.current = conditionsKey;
    void onSyncFromUrlRef.current(urlState);
  }, [urlQuery, budgetOptions]);

  return {
    pushSearchUrl,
    replaceSearchUrl,
    pushHomeUrl,
    parseCurrentUrl,
  };
}
