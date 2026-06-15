import type { HotpepperError } from "@/lib/hotpepper/types";

export const HOTPEPPER_API_BASE = "https://webservice.recruit.co.jp/hotpepper";

export function getHotpepperApiKey(): string | null {
  const apiKey = process.env.HOTPEPPER_API_KEY?.trim();
  return apiKey ? apiKey : null;
}

/** 上流 API の error.code を HTTP ステータスへ変換 */
export function statusFromUpstreamError(code: number | string): number {
  const n = Number(code);
  if (n === 2000 || n === 1000) return 502;
  return 400;
}

export function isHotpepperError(
  value: unknown,
): value is HotpepperError {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<HotpepperError>;
  return (
    typeof record.message === "string" &&
    (typeof record.code === "number" || typeof record.code === "string")
  );
}

type FetchHotpepperOptions = {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

export async function fetchHotpepperJson<T>(
  endpoint: string,
  params: URLSearchParams,
  options: FetchHotpepperOptions = {},
): Promise<T> {
  const url = `${HOTPEPPER_API_BASE}/${endpoint}/?${params.toString()}`;
  const response = await fetch(url, {
    method: "GET",
    cache: options.cache,
    next: options.next,
  });

  const data = (await response.json()) as T;
  return data;
}
