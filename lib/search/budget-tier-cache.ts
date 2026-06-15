import { HOTPEPPER_MAX_PAGE_SIZE } from "@/constants/pagination";
import { serializeFeatureFiltersForCache } from "@/lib/search/feature-filters";
import {
  serializeGenreCodes,
  type ShopSearchConditions,
} from "@/lib/search/filter-shops";
import type { Shop } from "@/types/shop";

export type BudgetSearchBaseParams = {
  lat: number;
  lng: number;
  conditions: ShopSearchConditions;
  order: string;
};

const STORAGE_KEY = "coco:budget-tier-cache:v1";
const HISTOGRAM_STORAGE_KEY = "coco:budget-histogram-cache:v1";
const CACHE_TTL_MS = 60 * 60 * 1000;

export type BudgetTierCacheEntry = {
  total: number;
  shops: Shop[];
  fetchedAt: number;
};

type BudgetTierCacheStore = Record<string, BudgetTierCacheEntry>;

const memoryCache = new Map<string, BudgetTierCacheEntry>();

type BudgetHistogramCacheEntry = {
  counts: number[];
  fetchedAt: number;
};

type BudgetHistogramCacheStore = Record<string, BudgetHistogramCacheEntry>;

const histogramMemoryCache = new Map<string, BudgetHistogramCacheEntry>();

function roundCoord(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

function isValidEntry(value: unknown): value is BudgetTierCacheEntry {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<BudgetTierCacheEntry>;
  return (
    typeof record.total === "number" &&
    Array.isArray(record.shops) &&
    typeof record.fetchedAt === "number"
  );
}

function isFreshEntry(entry: { fetchedAt: number }): boolean {
  return Date.now() - entry.fetchedAt <= CACHE_TTL_MS;
}

function readStorageStore(): BudgetTierCacheStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as BudgetTierCacheStore;
  } catch {
    return {};
  }
}

function writeStorageStore(store: BudgetTierCacheStore): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // sessionStorage が使えない環境では無視する
  }
}

function isValidHistogramEntry(value: unknown): value is BudgetHistogramCacheEntry {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<BudgetHistogramCacheEntry>;
  return (
    Array.isArray(record.counts) &&
    record.counts.every((count) => typeof count === "number") &&
    typeof record.fetchedAt === "number"
  );
}

function readHistogramStorageStore(): BudgetHistogramCacheStore {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(HISTOGRAM_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as BudgetHistogramCacheStore;
  } catch {
    return {};
  }
}

function writeHistogramStorageStore(store: BudgetHistogramCacheStore): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(HISTOGRAM_STORAGE_KEY, JSON.stringify(store));
  } catch {
    // sessionStorage が使えない環境では無視する
  }
}

export function readBudgetHistogramCache(key: string): number[] | null {
  const fromMemory = histogramMemoryCache.get(key);
  if (fromMemory && isFreshEntry(fromMemory)) {
    return fromMemory.counts;
  }

  const store = readHistogramStorageStore();
  const fromStorage = store[key];
  if (
    !fromStorage ||
    !isValidHistogramEntry(fromStorage) ||
    !isFreshEntry(fromStorage)
  ) {
    return null;
  }

  histogramMemoryCache.set(key, fromStorage);
  return fromStorage.counts;
}

export function writeBudgetHistogramCache(
  key: string,
  counts: readonly number[],
): void {
  const payload: BudgetHistogramCacheEntry = {
    counts: [...counts],
    fetchedAt: Date.now(),
  };

  histogramMemoryCache.set(key, payload);

  const store = readHistogramStorageStore();
  store[key] = payload;
  writeHistogramStorageStore(store);
}

/** ヒストグラム用キー（予算レンジ・並び順は含めない） */
export function buildBudgetHistogramKey(
  base: Pick<BudgetSearchBaseParams, "lat" | "lng" | "conditions">,
): string {
  return JSON.stringify({
    lat: roundCoord(base.lat),
    lng: roundCoord(base.lng),
    range: base.conditions.range,
    keyword: base.conditions.keyword.trim(),
    genreCodes: serializeGenreCodes(base.conditions.genreCodes),
    lunchFilter: base.conditions.lunchFilter,
    specialCode: base.conditions.specialCode,
    featureFilters: serializeFeatureFiltersForCache(
      base.conditions.featureFilters,
    ),
    partyCapacity: base.conditions.partyCapacity,
  });
}

/** 位置・検索条件・予算帯コードでキャッシュキーを生成 */
export function buildBudgetTierCacheKey(
  base: BudgetSearchBaseParams,
  budgetCode: string,
): string {
  return JSON.stringify({
    lat: roundCoord(base.lat),
    lng: roundCoord(base.lng),
    range: base.conditions.range,
    keyword: base.conditions.keyword.trim(),
    genreCodes: serializeGenreCodes(base.conditions.genreCodes),
    lunchFilter: base.conditions.lunchFilter,
    specialCode: base.conditions.specialCode,
    featureFilters: serializeFeatureFiltersForCache(
      base.conditions.featureFilters,
    ),
    partyCapacity: base.conditions.partyCapacity,
    order: base.order,
    budgetCode,
    count: HOTPEPPER_MAX_PAGE_SIZE,
  });
}

export function readBudgetTierCache(
  base: BudgetSearchBaseParams,
  budgetCode: string,
): BudgetTierCacheEntry | null {
  const key = buildBudgetTierCacheKey(base, budgetCode);
  const fromMemory = memoryCache.get(key);
  if (fromMemory && isFreshEntry(fromMemory)) {
    return fromMemory;
  }

  const store = readStorageStore();
  const fromStorage = store[key];
  if (!fromStorage || !isValidEntry(fromStorage) || !isFreshEntry(fromStorage)) {
    return null;
  }

  memoryCache.set(key, fromStorage);
  return fromStorage;
}

export function writeBudgetTierCache(
  base: BudgetSearchBaseParams,
  budgetCode: string,
  entry: Pick<BudgetTierCacheEntry, "total" | "shops">,
): void {
  const key = buildBudgetTierCacheKey(base, budgetCode);
  const payload: BudgetTierCacheEntry = {
    ...entry,
    fetchedAt: Date.now(),
  };

  memoryCache.set(key, payload);

  const store = readStorageStore();
  store[key] = payload;
  writeStorageStore(store);
}
