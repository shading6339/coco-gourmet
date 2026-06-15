import { formatBudgetTierTag } from "@/lib/shop/budget-tier";
import { formatDistance } from "@/lib/map/distance";
import type { Shop } from "@/types/shop";

/** 詳細ヘッダー下: カテゴリ・料金帯・距離のタグ文言 */
export function buildDetailMetaTags(shop: Shop): string[] {
  const tags: string[] = [];

  if (shop.genreName.trim()) {
    tags.push(shop.genreName.trim());
  }

  const budgetTag = formatBudgetTierTag(shop.budgetNightRange, shop.budgetDayRange);
  if (budgetTag) {
    tags.push(budgetTag);
  }

  if (shop.distanceMeters !== null && Number.isFinite(shop.distanceMeters)) {
    tags.push(formatDistance(shop.distanceMeters));
  }

  return tags;
}
