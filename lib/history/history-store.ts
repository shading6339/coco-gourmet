import { createShopListStore } from "@/lib/storage/shop-list-store";
import type { Shop } from "@/types/shop";

const HISTORY_KEY = "coco:history:v1";
const MAX_HISTORY = 50;

export const historyStore = createShopListStore(HISTORY_KEY, MAX_HISTORY);

/** 詳細表示時に呼ぶ。重複は先頭へ移動 */
export function recordShopView(shop: Shop): void {
  historyStore.upsertToFront(shop);
}
