import {
  GOURMET_BINARY_FILTER_KEYS,
  type GourmetBinaryFilterKey,
} from "@/lib/hotpepper/gourmet-search";

export function parseCoord(
  value: string | null,
  label: "lat" | "lng",
): number | null {
  if (value === null || value.trim() === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (label === "lat" && (num < -90 || num > 90)) return null;
  if (label === "lng" && (num < -180 || num > 180)) return null;
  return num;
}

export function optionalParam(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed : null;
}

const ALLOWED_BINARY = new Set(["0", "1"]);

/** クエリから設備・サービス絞り込み (0/1) を抽出 */
export function parseGourmetBinaryFilters(
  searchParams: URLSearchParams,
): Partial<Record<GourmetBinaryFilterKey, "0" | "1">> {
  const filters: Partial<Record<GourmetBinaryFilterKey, "0" | "1">> = {};

  for (const key of GOURMET_BINARY_FILTER_KEYS) {
    const value = searchParams.get(key);
    if (value && ALLOWED_BINARY.has(value)) {
      filters[key] = value as "0" | "1";
    }
  }

  return filters;
}

const MIN_PARTY_CAPACITY = 1;
const MAX_PARTY_CAPACITY = 9999;

export function parsePartyCapacity(
  value: string | null,
): number | null {
  if (!value?.trim()) return null;
  const num = Number(value);
  if (
    !Number.isInteger(num) ||
    num < MIN_PARTY_CAPACITY ||
    num > MAX_PARTY_CAPACITY
  ) {
    return null;
  }
  return num;
}
