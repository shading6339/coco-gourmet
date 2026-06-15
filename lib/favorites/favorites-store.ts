import { createShopListStore } from "@/lib/storage/shop-list-store";
import type { Shop } from "@/types/shop";

const FAVORITES_KEY = "coco:favorites:v1";
const MAX_FAVORITES = 200;

export const favoritesStore = createShopListStore(
  FAVORITES_KEY,
  MAX_FAVORITES,
);

export function toggleFavoriteShop(shop: Shop): void {
  if (favoritesStore.has(shop.id)) {
    favoritesStore.removeById(shop.id);
  } else {
    favoritesStore.upsertToFront(shop);
  }
}
