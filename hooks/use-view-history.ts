"use client";

import { useSyncExternalStore } from "react";

import { historyStore, recordShopView } from "@/lib/history/history-store";
import type { Shop } from "@/types/shop";

const EMPTY_SHOPS: Shop[] = [];

function getServerSnapshot(): Shop[] {
  return EMPTY_SHOPS;
}

export function useViewHistory(): {
  history: Shop[];
  recordView: (shop: Shop) => void;
} {
  const history = useSyncExternalStore(
    historyStore.subscribe,
    historyStore.getSnapshot,
    getServerSnapshot,
  );

  return { history, recordView: recordShopView };
}
