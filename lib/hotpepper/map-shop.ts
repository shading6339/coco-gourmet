import { distanceMeters } from "@/lib/map/distance";
import type { HotpepperShop } from "@/lib/hotpepper/types";
import { parseBudgetRanges } from "@/lib/shop/budget-display";
import {
  pickHeroImageUrl,
  pickListImageUrl,
} from "@/lib/shop/pick-shop-image-url";
import { extractShopTags } from "@/lib/shop/shop-tags";
import type { Shop } from "@/types/shop";

export function toShopArray(
  shop: HotpepperShop | HotpepperShop[] | undefined,
): HotpepperShop[] {
  if (!shop) return [];
  return Array.isArray(shop) ? shop : [shop];
}

function formatBudgetLabel(
  budget: HotpepperShop["budget"],
): string {
  if (budget?.average) return budget.average;
  if (budget?.name) return budget.name;
  return "";
}

function parseShopCoord(value: string | undefined): number | null {
  if (value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function resolveDistanceMeters(
  shop: HotpepperShop,
  originLat: number,
  originLng: number,
): number | null {
  const shopLat = Number(shop.lat);
  const shopLng = Number(shop.lng);
  if (!Number.isFinite(shopLat) || !Number.isFinite(shopLng)) return null;
  return Math.round(distanceMeters(originLat, originLng, shopLat, shopLng));
}

/** Hot Pepper の店舗レスポンスをアプリ内 Shop 型へ変換 */
export function mapHotpepperShopToShop(
  shop: HotpepperShop,
  originLat: number,
  originLng: number,
): Shop {
  const budgetRanges = parseBudgetRanges(
    shop.budget?.average,
    shop.budget?.name,
  );

  return {
    id: shop.id,
    name: shop.name,
    address: shop.address ?? "",
    open: shop.open ?? "",
    close: shop.close ?? "",
    access: shop.access ?? "",
    imageUrl: pickListImageUrl(shop.photo, shop.logo_image),
    heroImageUrl: pickHeroImageUrl(shop.photo, shop.logo_image),
    genreCode: shop.genre?.code ?? "",
    genreName: shop.genre?.name ?? "",
    budgetCode: shop.budget?.code ?? "",
    description: shop.catch?.trim() ?? "",
    lat: parseShopCoord(shop.lat),
    lng: parseShopCoord(shop.lng),
    budgetLabel: formatBudgetLabel(shop.budget),
    budgetDayRange: budgetRanges.day,
    budgetNightRange: budgetRanges.night,
    distanceMeters: resolveDistanceMeters(shop, originLat, originLng),
    hotpepperUrl: shop.urls?.pc ?? "",
    tags: extractShopTags(shop),
  };
}
