/**
 * 永続化の抽象化レイヤ。
 * 現状は localStorage 実装のみだが、将来サーバー API 化する際は
 * この interface の実装差替えだけで favorites / history を移行できる。
 */
export type KeyValueStore = {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  /** 他タブ更新（storage イベント）を含む変更通知 */
  subscribe(key: string, listener: () => void): () => void;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function createLocalKeyValueStore(): KeyValueStore {
  const listenersByKey = new Map<string, Set<() => void>>();

  function emit(key: string): void {
    listenersByKey.get(key)?.forEach((listener) => {
      listener();
    });
  }

  if (isBrowser()) {
    window.addEventListener("storage", (event) => {
      if (event.key) emit(event.key);
    });
  }

  return {
    get<T>(key: string): T | null {
      if (!isBrowser()) return null;
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return null;
      }
    },
    set<T>(key: string, value: T): void {
      if (!isBrowser()) return;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // 容量超過などは黙殺（スパイクでは致命的でない）
      }
      emit(key);
    },
    remove(key: string): void {
      if (!isBrowser()) return;
      try {
        window.localStorage.removeItem(key);
      } catch {
        // noop
      }
      emit(key);
    },
    subscribe(key: string, listener: () => void): () => void {
      let set = listenersByKey.get(key);
      if (!set) {
        set = new Set();
        listenersByKey.set(key, set);
      }
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },
  };
}
