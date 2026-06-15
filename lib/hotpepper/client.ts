import type { HotpepperError } from "@/lib/hotpepper/types";

export const HOTPEPPER_API_BASE = "https://webservice.recruit.co.jp/hotpepper";
const HOTPEPPER_FETCH_TIMEOUT_MS = 15_000;

export class HotpepperFetchError extends Error {
  readonly httpStatus?: number;

  constructor(message: string, httpStatus?: number) {
    super(message);
    this.name = "HotpepperFetchError";
    this.httpStatus = httpStatus;
  }
}

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

/** 上流エラーをクライアント向けメッセージへ丸める */
export function toPublicUpstreamErrorMessage(code: number | string): string {
  if (statusFromUpstreamError(code) >= 500) {
    return "一時的に検索できません。時間をおいて再試行してください。";
  }
  return "検索条件を変更してお試しください。";
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
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      cache: options.cache,
      next: options.next,
      signal: AbortSignal.timeout(HOTPEPPER_FETCH_TIMEOUT_MS),
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new HotpepperFetchError("Hotpepper API request timed out");
    }
    throw new HotpepperFetchError("Hotpepper API request failed");
  }

  if (!response.ok) {
    throw new HotpepperFetchError(
      `Hotpepper API HTTP ${response.status}`,
      response.status,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const looksLikeJson =
    contentType.length === 0 ||
    contentType.includes("json") ||
    contentType.includes("javascript");
  if (!looksLikeJson) {
    throw new HotpepperFetchError(
      `Hotpepper API returned non-JSON response (${contentType || "no content-type"})`,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new HotpepperFetchError("Hotpepper API returned invalid JSON");
  }

  return data as T;
}
