import { useState, type JSX } from "react";
import { ChevronDown } from "lucide-react";

import { SearchFilterChip } from "@/components/coco/shop-list/search-filter-chip";
import {
  getFeatureLabel,
  SEARCH_FEATURE_GROUPS,
} from "@/constants/search-features";
import { POPULAR_FEATURE_KEYS } from "@/constants/search-popular";
import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";
import type { LunchFilter } from "@/lib/search/filter-shops";
import {
  isFeatureFilterActive,
  toggleFeatureFilter,
  type ShopFeatureFilters,
} from "@/lib/search/feature-filters";

type SearchFeatureFiltersProps = {
  filters: ShopFeatureFilters;
  lunchFilter: LunchFilter;
  onChange: (filters: ShopFeatureFilters) => void;
  onLunchFilterChange: (lunchFilter: LunchFilter) => void;
  className?: string;
};

function toggleLunchFilter(
  current: LunchFilter,
  target: "yes" | "no",
): LunchFilter {
  return current === target ? "any" : target;
}

export function SearchFeatureFilters({
  filters,
  lunchFilter,
  onChange,
  onLunchFilterChange,
  className,
}: SearchFeatureFiltersProps): JSX.Element {
  const advancedCount =
    Object.keys(filters).filter(
      (key) =>
        !POPULAR_FEATURE_KEYS.includes(
          key as (typeof POPULAR_FEATURE_KEYS)[number],
        ),
    ).length + (lunchFilter !== "any" ? 1 : 0);
  const [showAll, setShowAll] = useState(advancedCount > 0);

  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      <div className="flex flex-wrap gap-2">
        {POPULAR_FEATURE_KEYS.map((key) => (
          <SearchFilterChip
            key={key}
            label={getFeatureLabel(key)}
            mode="multiple"
            active={isFeatureFilterActive(filters, key)}
            onToggle={() => {
              onChange(toggleFeatureFilter(filters, key));
            }}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          setShowAll((current) => !current);
        }}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-left text-xs font-medium text-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        <span>
          {TEXT.search.showMoreFeatures}
          {advancedCount > 0 ? ` (${advancedCount})` : ""}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            showAll && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {showAll ? (
        <div className="grid min-w-0 gap-4 rounded-lg bg-surface-muted/50 p-3">
          {SEARCH_FEATURE_GROUPS.map((group) => (
            <div key={group.key} className="grid min-w-0 gap-2">
              <p className="text-[11px] font-medium text-muted-foreground">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.key === "scene" ? (
                  <>
                    <SearchFilterChip
                      label={TEXT.search.lunchAvailable}
                      mode="single"
                      active={lunchFilter === "yes"}
                      onToggle={() => {
                        onLunchFilterChange(toggleLunchFilter(lunchFilter, "yes"));
                      }}
                    />
                    <SearchFilterChip
                      label={TEXT.search.lunchUnavailable}
                      mode="single"
                      active={lunchFilter === "no"}
                      onToggle={() => {
                        onLunchFilterChange(toggleLunchFilter(lunchFilter, "no"));
                      }}
                    />
                  </>
                ) : null}
                {group.features.map((feature) => (
                  <SearchFilterChip
                    key={feature.key}
                    label={feature.label}
                    mode="multiple"
                    active={isFeatureFilterActive(filters, feature.key)}
                    onToggle={() => {
                      onChange(toggleFeatureFilter(filters, feature.key));
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
