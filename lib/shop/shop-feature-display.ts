import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  Baby,
  Car,
  CreditCard,
  CigaretteOff,
  Dog,
  LayoutGrid,
  Sparkles,
  Sun,
  UtensilsCrossed,
  Wifi,
  Wine,
} from "lucide-react";

export type ShopFeatureDisplay = {
  icon: LucideIcon;
  label: string;
};

const FEATURE_BY_TAG: Record<string, ShopFeatureDisplay> = {
  個室: { icon: Armchair, label: "個室あり" },
  飲み放題: { icon: Wine, label: "飲み放題" },
  食べ放題: { icon: UtensilsCrossed, label: "食べ放題" },
  ランチ: { icon: Sun, label: "ランチあり" },
  禁煙: { icon: CigaretteOff, label: "禁煙席" },
  カード可: { icon: CreditCard, label: "カード可" },
  駐車場: { icon: Car, label: "駐車場あり" },
  WiFi: { icon: Wifi, label: "Wi-Fi" },
  掘りごたつ: { icon: LayoutGrid, label: "掘りごたつ" },
  座敷: { icon: Armchair, label: "座敷あり" },
  お子様連れOK: { icon: Baby, label: "お子様OK" },
  ペット可: { icon: Dog, label: "ペット可" },
};

/** 詳細の特徴グリッド用（最大4件） */
export const SHOP_FEATURE_GRID_MAX = 4;

export function toShopFeatureDisplay(tag: string): ShopFeatureDisplay {
  return FEATURE_BY_TAG[tag] ?? { icon: Sparkles, label: tag };
}

export type ShopFeatureItem = ShopFeatureDisplay & { tag: string };

export function buildShopFeatureDisplays(tags: string[]): ShopFeatureItem[] {
  return tags.slice(0, SHOP_FEATURE_GRID_MAX).map((tag) => ({
    tag,
    ...toShopFeatureDisplay(tag),
  }));
}
