"use client";

import { useCallback, useSyncExternalStore } from "react";

import { favoritesStore, toggleFavoriteShop } from "@/lib/favorites/favorites-store";
import type { Shop } from "@/types/shop";

const EMPTY_SHOPS: Shop[] = [];

function getServerSnapshot(): Shop[] {
  return EMPTY_SHOPS;
}

export function useFavorites(): {
  favorites: Shop[];
  isFavorite: (shopId: string) => boolean;
  toggleFavorite: (shop: Shop) => void;
} {
  const favorites = useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    getServerSnapshot,
  );

  const isFavorite = useCallback(
    (shopId: string) => favorites.some((item) => item.id === shopId),
    [favorites],
  );

  return { favorites, isFavorite, toggleFavorite: toggleFavoriteShop };
}
