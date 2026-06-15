import { createLocalKeyValueStore } from "@/lib/storage/key-value-store";
import type { Shop } from "@/types/shop";

export type ShopListStore = {
  getSnapshot: () => Shop[];
  subscribe: (listener: () => void) => () => void;
  /** 先頭に追加（同 id は先頭へ移動）。maxItems 超過分は末尾を切詰め */
  upsertToFront: (shop: Shop) => void;
  removeById: (shopId: string) => void;
  has: (shopId: string) => boolean;
};

const EMPTY_SHOPS: Shop[] = [];

/**
 * Shop スナップショットのリスト永続化（favorites / history 共通基盤）。
 * useSyncExternalStore 前提で snapshot 参照を安定させている。
 */
export function createShopListStore(
  storageKey: string,
  maxItems: number,
): ShopListStore {
  const store = createLocalKeyValueStore();
  let cache: Shop[] | null = null;

  function read(): Shop[] {
    if (cache === null) {
      cache = store.get<Shop[]>(storageKey) ?? EMPTY_SHOPS;
    }
    return cache;
  }

  function write(next: Shop[]): void {
    cache = next;
    store.set(storageKey, next);
  }

  return {
    getSnapshot: read,
    subscribe(listener) {
      return store.subscribe(storageKey, () => {
        // 他タブ更新時はキャッシュを捨てて再読込
        cache = null;
        listener();
      });
    },
    upsertToFront(shop) {
      const rest = read().filter((item) => item.id !== shop.id);
      write([shop, ...rest].slice(0, maxItems));
    },
    removeById(shopId) {
      const current = read();
      const next = current.filter((item) => item.id !== shopId);
      if (next.length !== current.length) write(next);
    },
    has(shopId) {
      return read().some((item) => item.id === shopId);
    },
  };
}
