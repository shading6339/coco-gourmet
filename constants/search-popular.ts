import type { GourmetBinaryFilterKey } from "@/lib/hotpepper/gourmet-search";

/** 詳細検索で最初に見せる設備チップ */
export const POPULAR_FEATURE_KEYS: readonly GourmetBinaryFilterKey[] = [
  "private_room",
  "free_drink",
  "non_smoking",
  "card",
  "wifi",
  "child",
  "course",
  "parking",
] as const;

/** 宴会人数のクイック選択（名以上） */
export const PARTY_CAPACITY_PRESETS: readonly number[] = [
  10, 20, 30, 50, 100,
] as const;

/**
 * ホームおすすめと同系統の特集コード（マスタに存在するものだけ UI に出す）
 */
export const POPULAR_SPECIAL_CODES: readonly string[] = [
  "LT0086",
  "LZ0045",
  "LU0024",
  "LU0029",
  "LY0088",
  "LU0012",
  "LY0093",
  "LZ0044",
] as const;
