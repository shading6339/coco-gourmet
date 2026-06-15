"use client";

import { useEffect, useState } from "react";

import { fetchSearchPreviewCount } from "@/lib/search/fetch-search-preview-count";
import type { ShopSearchConditions } from "@/lib/search/filter-shops";
import type { GeoCoords } from "@/lib/search/geolocation";
import { buildBudgetCatalogKey } from "@/lib/search/search-url";

const PREVIEW_DEBOUNCE_MS = 400;

export type SearchPreviewCountState = {
  total: number | null;
  isLoading: boolean;
  error: boolean;
};

const INITIAL_STATE: SearchPreviewCountState = {
  total: null,
  isLoading: false,
  error: false,
};

export function useSearchPreviewCount(
  open: boolean,
  coords: GeoCoords | null,
  conditions: ShopSearchConditions,
): SearchPreviewCountState {
  const [state, setState] = useState<SearchPreviewCountState>(INITIAL_STATE);

  const conditionsKey = buildBudgetCatalogKey(coords ?? { lat: 0, lng: 0 }, conditions);

  useEffect(() => {
    if (!open || coords === null) {
      setState(INITIAL_STATE);
      return undefined;
    }

    const controller = new AbortController();

    setState((current) => ({
      ...current,
      isLoading: true,
      error: false,
    }));

    const timerId = window.setTimeout(() => {
      void fetchSearchPreviewCount(coords, conditions, controller.signal)
        .then((total) => {
          if (controller.signal.aborted) return;
          setState({
            total,
            isLoading: false,
            error: false,
          });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setState({
            total: null,
            isLoading: false,
            error: true,
          });
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timerId);
    };
  }, [open, coords, conditions, conditionsKey]);

  return state;
}
