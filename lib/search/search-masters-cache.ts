import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import type { SearchOption } from "@/lib/search/filter-shops";

const CACHE_KEY = "coco:search-masters:v5";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type SearchMastersCache = {
  genres: SearchOption[];
  budgets: SearchOption[];
  specials: SpecialSearchOption[];
  fetchedAt: number;
};

function isValidCache(value: unknown): value is SearchMastersCache {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<SearchMastersCache>;
  return (
    Array.isArray(record.genres) &&
    Array.isArray(record.budgets) &&
    Array.isArray(record.specials) &&
    typeof record.fetchedAt === "number"
  );
}

export function readSearchMastersCache(): SearchMastersCache | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidCache(parsed)) return null;

    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) {
      window.sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeSearchMastersCache(
  genres: SearchOption[],
  budgets: SearchOption[],
  specials: SpecialSearchOption[],
): void {
  if (typeof window === "undefined") return;

  const payload: SearchMastersCache = {
    genres,
    budgets,
    specials,
    fetchedAt: Date.now(),
  };

  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage が使えない環境では無視する
  }
}
