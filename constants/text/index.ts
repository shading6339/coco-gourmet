import { COMMON_TEXT } from "@/constants/text/common";
import { HERO_TEXT } from "@/constants/text/hero";
import { LOCATION_TEXT } from "@/constants/text/location";
import { PAGINATION_TEXT } from "@/constants/text/pagination";
import { RECOMMENDATIONS_TEXT } from "@/constants/text/recommendations";
import { SAVED_TEXT } from "@/constants/text/saved";
import { SEARCH_TEXT } from "@/constants/text/search";
import { SHOP_TEXT } from "@/constants/text/shop";

export const TEXT = {
  common: COMMON_TEXT,
  hero: HERO_TEXT,
  search: SEARCH_TEXT,
  location: LOCATION_TEXT,
  recommendations: RECOMMENDATIONS_TEXT,
  pagination: PAGINATION_TEXT,
  shop: SHOP_TEXT,
  saved: SAVED_TEXT,
} as const;
