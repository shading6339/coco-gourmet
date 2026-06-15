import type { Shop } from "@/types/shop";

export type RecommendationShop = Shop;

export type RecommendationSection = {
  code: string;
  title: string;
  shops: RecommendationShop[];
};
