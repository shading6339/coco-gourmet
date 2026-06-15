/** Hot Pepper API の photo フィールド（一覧・詳細で解像度を切り替える） */
export type HotpepperShopPhoto = {
  pc?: { l?: string; m?: string; s?: string };
  mobile?: { l?: string; s?: string };
};

/** 一覧サムネ用（中サイズを優先。s は Retina で粗くなりやすい） */
export function pickListImageUrl(
  photo: HotpepperShopPhoto | undefined,
  logoImage?: string,
): string {
  return (
    photo?.pc?.m ??
    photo?.mobile?.l ??
    photo?.pc?.s ??
    photo?.mobile?.s ??
    photo?.pc?.l ??
    logoImage ??
    ""
  );
}

/** 詳細ヒーロー用（大きい URL を優先） */
export function pickHeroImageUrl(
  photo: HotpepperShopPhoto | undefined,
  logoImage?: string,
): string {
  return (
    photo?.pc?.l ??
    photo?.pc?.m ??
    photo?.mobile?.l ??
    photo?.pc?.s ??
    photo?.mobile?.s ??
    logoImage ??
    ""
  );
}
