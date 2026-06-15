import {
  fetchHotpepperJson,
  getHotpepperApiKey,
} from "@/lib/hotpepper/client";
import type { HotpepperGourmetResponse } from "@/lib/hotpepper/types";

/** グルメサーチ API で 0/1 指定できる設備・サービス絞り込み */
export const GOURMET_BINARY_FILTER_KEYS = [
  "wifi",
  "wedding",
  "course",
  "free_drink",
  "free_food",
  "private_room",
  "horigotatsu",
  "tatami",
  "cocktail",
  "shochu",
  "sake",
  "wine",
  "card",
  "non_smoking",
  "charter",
  "ktai",
  "parking",
  "barrier_free",
  "sommelier",
  "night_view",
  "open_air",
  "show",
  "equipment",
  "karaoke",
  "band",
  "tv",
  "english",
  "pet",
  "child",
  "lunch",
  "midnight",
  "midnight_meal",
] as const;

export type GourmetBinaryFilterKey =
  (typeof GOURMET_BINARY_FILTER_KEYS)[number];

export type GourmetSearchParams = {
  lat: number;
  lng: number;
  range: string;
  start: number;
  count: number;
  order?: string;
  datum?: "world" | "tokyo";
  keyword?: string;
  genre?: string;
  budget?: string;
  special?: string;
  partyCapacity?: number;
  creditCard?: string;
  binaryFilters?: Partial<Record<GourmetBinaryFilterKey, "0" | "1">>;
};

/** 店舗 ID 単一取得（lat/lng/range 不要。共有ディープリンクのコールド復元用） */
export type GourmetShopByIdParams = {
  id: string;
  datum?: "world" | "tokyo";
};

export function buildGourmetShopByIdParams(
  apiKey: string,
  params: GourmetShopByIdParams,
): URLSearchParams {
  return new URLSearchParams({
    key: apiKey,
    id: params.id,
    format: "json",
    datum: params.datum ?? "world",
  });
}

export async function fetchGourmetShopById(
  params: GourmetShopByIdParams,
): Promise<HotpepperGourmetResponse> {
  const apiKey = getHotpepperApiKey();
  if (!apiKey) {
    throw new Error("APIキーが設定されていません。");
  }

  const upstreamParams = buildGourmetShopByIdParams(apiKey, params);
  return fetchHotpepperJson<HotpepperGourmetResponse>(
    "gourmet/v1",
    upstreamParams,
    { cache: "no-store" },
  );
}

export function buildGourmetSearchParams(
  apiKey: string,
  params: GourmetSearchParams,
): URLSearchParams {
  const upstream = new URLSearchParams({
    key: apiKey,
    lat: String(params.lat),
    lng: String(params.lng),
    range: params.range,
    start: String(params.start),
    count: String(params.count),
    format: "json",
    datum: params.datum ?? "world",
    order: params.order ?? "4",
  });

  if (params.keyword) upstream.set("keyword", params.keyword);
  if (params.genre) upstream.set("genre", params.genre);
  if (params.budget) upstream.set("budget", params.budget);
  if (params.special) upstream.set("special", params.special);
  if (params.partyCapacity !== undefined) {
    upstream.set("party_capacity", String(params.partyCapacity));
  }
  if (params.creditCard) upstream.set("credit_card", params.creditCard);

  if (params.binaryFilters) {
    for (const key of GOURMET_BINARY_FILTER_KEYS) {
      const value = params.binaryFilters[key];
      if (value === "0" || value === "1") {
        upstream.set(key, value);
      }
    }
  }

  return upstream;
}

export async function fetchGourmetSearch(
  params: GourmetSearchParams,
): Promise<HotpepperGourmetResponse> {
  const apiKey = getHotpepperApiKey();
  if (!apiKey) {
    throw new Error("APIキーが設定されていません。");
  }

  const upstreamParams = buildGourmetSearchParams(apiKey, params);
  return fetchHotpepperJson<HotpepperGourmetResponse>(
    "gourmet/v1",
    upstreamParams,
    { cache: "no-store" },
  );
}
