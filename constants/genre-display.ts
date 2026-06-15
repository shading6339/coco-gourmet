/** トップ bento に出す人気ジャンル（表示順） */
export const POPULAR_GENRE_CODES = ["G001", "G006", "G014"] as const;

/** 画像未用意ジャンル向けの共通フォールバック */
export const GENRE_FALLBACK_IMAGE = "/genre/hero.webp";

/** ジャンルコード → 画像パス（Hotpepper ジャンルマスタ準拠） */
export const GENRE_IMAGE_BY_CODE: Partial<Record<string, string>> = {
  G001: "/genre/japanese_izakaya.webp",
  G002: "/genre/bal.webp",
  G003: "/genre/fusion.webp",
  G004: "/genre/washoku.webp",
  G005: "/genre/yoshoku.webp",
  G006: "/genre/italian_dining.webp",
  G007: "/genre/chinese.webp",
  G008: "/genre/yakiniku.webp",
  G009: "/genre/ethnic.webp",
  G010: "/genre/international.webp",
  G011: "/genre/karaoke.webp",
  G012: "/genre/bar.webp",
  G013: "/genre/ramen.webp",
  G014: "/genre/cafe.webp",
  G016: "/genre/okonomiyaki.webp",
  G017: "/genre/korean.webp",
};

/** トップ bento 用の短い表示名 */
export const GENRE_LABEL_OVERRIDES: Partial<Record<string, string>> = {
  G014: "カフェ",
};

export function getGenreImage(code: string): string {
  return GENRE_IMAGE_BY_CODE[code] ?? GENRE_FALLBACK_IMAGE;
}

export function getGenreDisplayLabel(
  code: string,
  fallbackLabel: string,
): string {
  return GENRE_LABEL_OVERRIDES[code] ?? fallbackLabel;
}
