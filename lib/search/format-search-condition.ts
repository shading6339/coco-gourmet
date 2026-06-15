import {
  getFeatureLabel,
  UI_FEATURE_FILTER_KEYS,
} from "@/constants/search-features";
import { TEXT } from "@/constants/text";
import { formatBudgetRangeLabel, isBudgetRangeActive } from "@/lib/search/budget-range";
import type { SearchOption, ShopSearchConditions } from "@/lib/search/filter-shops";
import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import type { SearchRangeOption } from "@/types/search-range";

/** 一覧 AppBar に表示する検索条件ラベル（半径 + 現在地） */
export function formatSearchConditionLabel(
  range: string,
  rangeOptions: readonly SearchRangeOption[],
): string {
  const option = rangeOptions.find((item) => item.value === range);
  const radius = option?.label ?? "";
  if (!radius) return TEXT.search.searchNearCurrentLocation;
  return `${radius}${TEXT.search.searchWithinRadius}`;
}

/** 検索ボックスの placeholder 用に、選択中の条件ラベルを連結 */
export function formatSearchConditionPlaceholder(
  conditions: ShopSearchConditions,
  rangeOptions: readonly SearchRangeOption[],
  genres: SearchOption[],
  options: {
    specials?: readonly SpecialSearchOption[];
  } = {},
): string {
  const parts: string[] = [];

  if (conditions.genreCodes.length > 0) {
    const labels = conditions.genreCodes
      .map((code) => genres.find((item) => item.code === code)?.label)
      .filter((label): label is string => Boolean(label));
    if (labels.length > 0) {
      parts.push(labels.join("・"));
    }
  }

  parts.push(formatSearchConditionLabel(conditions.range, rangeOptions));

  if (isBudgetRangeActive(conditions.budgetMin, conditions.budgetMax)) {
    parts.push(
      `${TEXT.search.nightBudget} ${formatBudgetRangeLabel(
        conditions.budgetMin,
        conditions.budgetMax,
      )}`,
    );
  }

  if (conditions.lunchFilter === "yes") {
    parts.push(TEXT.search.lunchAvailable);
  } else if (conditions.lunchFilter === "no") {
    parts.push(TEXT.search.lunchUnavailable);
  }

  if (conditions.specialCode) {
    const special = options.specials?.find(
      (item) => item.code === conditions.specialCode,
    );
    parts.push(special?.label ?? TEXT.search.specialLabel);
  }

  const activeFeatures = UI_FEATURE_FILTER_KEYS.filter(
    (key) => conditions.featureFilters[key],
  );
  if (activeFeatures.length === 1) {
    parts.push(getFeatureLabel(activeFeatures[0]));
  } else if (activeFeatures.length > 1) {
    parts.push(`${activeFeatures.length}件の設備条件`);
  }

  if (conditions.partyCapacity !== null) {
    parts.push(
      `${TEXT.search.partyCapacityLabel}${conditions.partyCapacity}${TEXT.search.partyCapacitySuffix}`,
    );
  }

  return parts.join(" · ");
}
