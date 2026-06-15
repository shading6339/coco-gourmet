import type { JSX } from "react";
import { RotateCcw } from "lucide-react";

import { BudgetRangeSlider } from "@/components/coco/shop-list/budget-range-slider";
import { SearchFeatureFilters } from "@/components/coco/shop-list/search-feature-filters";
import { SearchFieldGroup } from "@/components/coco/shop-list/search-field-group";
import { SearchFilterChip } from "@/components/coco/shop-list/search-filter-chip";
import { SearchPartyCapacityPicker } from "@/components/coco/shop-list/search-party-capacity-picker";
import { SearchSpecialPicker } from "@/components/coco/shop-list/search-special-picker";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_BUDGET_MAX,
  DEFAULT_BUDGET_MIN,
} from "@/constants/budget-range";
import { TEXT } from "@/constants/text";
import { isBudgetRangeActive } from "@/lib/search/budget-range";
import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import { cn } from "@/lib/utils";
import type { SearchOption, ShopSearchConditions } from "@/lib/search/filter-shops";
import type { SearchRangeOption } from "@/types/search-range";

type SearchConditionPanelProps = {
  conditions: ShopSearchConditions;
  rangeOptions: readonly SearchRangeOption[];
  genres: SearchOption[];
  specials?: SpecialSearchOption[];

  budgetHistogramCounts?: readonly number[];
  onChange: (conditions: ShopSearchConditions) => void;
  className?: string;
};


const SECTION_DIVIDER = "border-t border-border/40";

export function SearchConditionPanel({
  conditions,
  rangeOptions,
  genres,
  specials = [],

  budgetHistogramCounts,
  onChange,
  className,
}: SearchConditionPanelProps): JSX.Element {
  const isBudgetFiltered = isBudgetRangeActive(
    conditions.budgetMin,
    conditions.budgetMax,
  );

  return (
    <section
      className={cn(
        "box-border grid w-full max-w-full min-w-0 gap-0 bg-surface",
        className,
      )}
      aria-label={TEXT.search.filterDialogTitle}
    >
      {/* ジャンル */}
      <div className="px-4 py-4">
        <SearchFieldGroup label={TEXT.search.genreLabel}>
          <div className="flex flex-wrap gap-2">
            <SearchFilterChip
              label="指定なし"
              mode="single"
              active={conditions.genreCodes.length === 0}
              onToggle={() => {
                onChange({ ...conditions, genreCodes: [] });
              }}
            />
            {genres.map((genre) => {
              const isActive = conditions.genreCodes.includes(genre.code);
              return (
                <SearchFilterChip
                  key={genre.code}
                  label={genre.label}
                  mode="multiple"
                  active={isActive}
                  onToggle={() => {
                    onChange({
                      ...conditions,
                      genreCodes: isActive
                        ? conditions.genreCodes.filter(
                            (code) => code !== genre.code,
                          )
                        : [...conditions.genreCodes, genre.code],
                    });
                  }}
                />
              );
            })}
          </div>
        </SearchFieldGroup>
      </div>

      {/* 距離 */}
      <div className={cn("px-4 py-4", SECTION_DIVIDER)}>
        <SearchFieldGroup label={TEXT.search.radiusLabel}>
          <div className="flex flex-wrap gap-2">
            {rangeOptions.map((option) => (
              <SearchFilterChip
                key={option.value}
                label={`${option.label}以内`}
                mode="single"
                active={conditions.range === option.value}
                onToggle={() => {
                  onChange({ ...conditions, range: option.value });
                }}
              />
            ))}
          </div>
        </SearchFieldGroup>
      </div>

      {/* 予算 */}
      <div className={cn("px-4 py-4", SECTION_DIVIDER)}>
        <SearchFieldGroup label={TEXT.search.budgetLabel}>
          <BudgetRangeSlider
            min={conditions.budgetMin}
            max={conditions.budgetMax}
            histogramCounts={budgetHistogramCounts}
            onChange={(budgetMin, budgetMax) => {
              onChange({ ...conditions, budgetMin, budgetMax });
            }}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!isBudgetFiltered}
              onClick={() => {
                onChange({
                  ...conditions,
                  budgetMin: DEFAULT_BUDGET_MIN,
                  budgetMax: DEFAULT_BUDGET_MAX,
                });
              }}
            >
              <RotateCcw className="size-4" aria-hidden />
              予算をリセット
            </Button>
          </div>
        </SearchFieldGroup>
      </div>

      {/* 特集 */}
      {specials.length > 0 ? (
        <div className={cn("px-4 py-4", SECTION_DIVIDER)}>
          <SearchFieldGroup label={TEXT.search.specialLabel}>
            <SearchSpecialPicker
              value={conditions.specialCode}
              specials={specials}
              onChange={(specialCode) => {
                onChange({ ...conditions, specialCode });
              }}
            />
          </SearchFieldGroup>
        </div>
      ) : null}

      {/* 宴会人数 */}
      <div className={cn("px-4 py-4", SECTION_DIVIDER)}>
        <SearchFieldGroup label={TEXT.search.partyCapacityLabel}>
          <SearchPartyCapacityPicker
            value={conditions.partyCapacity}
            onChange={(partyCapacity) => {
              onChange({ ...conditions, partyCapacity });
            }}
          />
        </SearchFieldGroup>
      </div>

      {/* 設備・サービス */}
      <div className={cn("px-4 py-4", SECTION_DIVIDER)}>
        <SearchFieldGroup label={TEXT.search.featureFiltersLabel}>
          <SearchFeatureFilters
            filters={conditions.featureFilters}
            lunchFilter={conditions.lunchFilter}
            onChange={(featureFilters) => {
              onChange({ ...conditions, featureFilters });
            }}
            onLunchFilterChange={(lunchFilter) => {
              onChange({ ...conditions, lunchFilter });
            }}
          />
        </SearchFieldGroup>
      </div>

    </section>
  );
}
