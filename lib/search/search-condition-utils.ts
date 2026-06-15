import {
  DEFAULT_BUDGET_MAX,
  DEFAULT_BUDGET_MIN,
} from "@/constants/budget-range";
import {
  getFeatureLabel,
  UI_FEATURE_FILTER_KEYS,
} from "@/constants/search-features";
import {
  formatBudgetRangeLabel,
  isBudgetRangeActive,
} from "@/lib/search/budget-range";
import type { GourmetBinaryFilterKey } from "@/lib/hotpepper/gourmet-search";
import {
  EMPTY_FEATURE_FILTERS,
  serializeFeatureFiltersForCache,
} from "@/lib/search/feature-filters";
import {
  DEFAULT_SHOP_SEARCH_CONDITIONS,
  serializeGenreCodes,
  type SearchOption,
  type ShopSearchConditions,
} from "@/lib/search/filter-shops";
import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import { TEXT } from "@/constants/text";

export type SearchConditionChip = {
  id: string;
  label: string;
  kind:
    | "genre"
    | "range"
    | "budget"
    | "lunchFilter"
    | "special"
    | "feature"
    | "partyCapacity"

    | "sort";
};

export function areSearchConditionsEqual(
  left: ShopSearchConditions,
  right: ShopSearchConditions,
): boolean {
  return (
    left.keyword === right.keyword &&
    left.range === right.range &&
    serializeGenreCodes(left.genreCodes) ===
      serializeGenreCodes(right.genreCodes) &&
    left.lunchFilter === right.lunchFilter &&
    left.budgetMin === right.budgetMin &&
    left.budgetMax === right.budgetMax &&
    left.specialCode === right.specialCode &&
    left.partyCapacity === right.partyCapacity &&
    left.sort === right.sort &&
    serializeFeatureFiltersForCache(left.featureFilters) ===
      serializeFeatureFiltersForCache(right.featureFilters)
  );
}

/** 詳細検索のみクリア（基本のジャンル・距離・予算は維持） */
export function clearAdvancedSearchConditions(
  conditions: ShopSearchConditions,
): ShopSearchConditions {
  return {
    ...conditions,
    specialCode: "",
    featureFilters: EMPTY_FEATURE_FILTERS,
    lunchFilter: DEFAULT_SHOP_SEARCH_CONDITIONS.lunchFilter,
    partyCapacity: null,
    };
}

export function countAdvancedSearchConditions(
  conditions: ShopSearchConditions,
): number {
  let count = 0;
  if (conditions.specialCode) count += 1;
  if (conditions.partyCapacity !== null) count += 1;
  count += Object.keys(conditions.featureFilters).length;
  if (conditions.lunchFilter !== DEFAULT_SHOP_SEARCH_CONDITIONS.lunchFilter) {
    count += 1;
  }
  return count;
}

export function buildSearchConditionChips(
  conditions: ShopSearchConditions,
  options: {
    genres: readonly SearchOption[];
    rangeLabel: string;
    specials?: readonly SpecialSearchOption[];
  },
): SearchConditionChip[] {
  const chips: SearchConditionChip[] = [];

  for (const code of conditions.genreCodes) {
    const genre = options.genres.find((item) => item.code === code);
    chips.push({
      id: `genre:${code}`,
      kind: "genre",
      label: genre?.label ?? TEXT.search.genreLabel,
    });
  }

  if (
    conditions.range &&
    conditions.range !== DEFAULT_SHOP_SEARCH_CONDITIONS.range
  ) {
    chips.push({
      id: `range:${conditions.range}`,
      kind: "range",
      label: `${options.rangeLabel}以内`,
    });
  }

  if (conditions.lunchFilter === "yes") {
    chips.push({
      id: "lunchFilter:yes",
      kind: "lunchFilter",
      label: TEXT.search.lunchAvailable,
    });
  } else if (conditions.lunchFilter === "no") {
    chips.push({
      id: "lunchFilter:no",
      kind: "lunchFilter",
      label: TEXT.search.lunchUnavailable,
    });
  }

  if (isBudgetRangeActive(conditions.budgetMin, conditions.budgetMax)) {
    chips.push({
      id: `budget:${conditions.budgetMin}-${conditions.budgetMax}`,
      kind: "budget",
      label: formatBudgetRangeLabel(
        conditions.budgetMin,
        conditions.budgetMax,
      ),
    });
  }

  if (conditions.specialCode) {
    const special = options.specials?.find(
      (item) => item.code === conditions.specialCode,
    );
    chips.push({
      id: `special:${conditions.specialCode}`,
      kind: "special",
      label: special?.label ?? TEXT.search.specialLabel,
    });
  }

  if (conditions.partyCapacity !== null) {
    chips.push({
      id: `party:${conditions.partyCapacity}`,
      kind: "partyCapacity",
      label: `${conditions.partyCapacity}${TEXT.search.partyCapacitySuffix}`,
    });
  }

  for (const key of UI_FEATURE_FILTER_KEYS) {
    if (!conditions.featureFilters[key]) continue;
    chips.push({
      id: `feature:${key}`,
      kind: "feature",
      label: getFeatureLabel(key),
    });
  }

  return chips;
}

export function removeSearchConditionChip(
  conditions: ShopSearchConditions,
  chip: SearchConditionChip,
): ShopSearchConditions {
  switch (chip.kind) {
    case "genre": {
      const code = chip.id.replace("genre:", "");
      return {
        ...conditions,
        genreCodes: conditions.genreCodes.filter((item) => item !== code),
      };
    }
    case "range":
      return {
        ...conditions,
        range: DEFAULT_SHOP_SEARCH_CONDITIONS.range,
      };
    case "lunchFilter":
      return {
        ...conditions,
        lunchFilter: DEFAULT_SHOP_SEARCH_CONDITIONS.lunchFilter,
      };
    case "budget":
      return {
        ...conditions,
        budgetMin: DEFAULT_BUDGET_MIN,
        budgetMax: DEFAULT_BUDGET_MAX,
      };
    case "special":
      return { ...conditions, specialCode: "" };
    case "partyCapacity":
      return { ...conditions, partyCapacity: null };
    case "feature": {
      const key = chip.id.replace(
        "feature:",
        "",
      ) as GourmetBinaryFilterKey;
      const nextFilters = { ...conditions.featureFilters };
      delete nextFilters[key];
      return { ...conditions, featureFilters: nextFilters };
    }
    default:
      return conditions;
  }
}
