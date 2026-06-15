import type { JSX } from "react";

import { SearchFilterChip } from "@/components/coco/shop-list/search-filter-chip";
import { Button } from "@/components/ui/button";
import { TEXT } from "@/constants/text";
import type { SearchConditionChip } from "@/lib/search/search-condition-utils";
import { cn } from "@/lib/utils";

type SearchActiveChipsProps = {
  chips: readonly SearchConditionChip[];
  onRemove: (chip: SearchConditionChip) => void;
  onClearAll?: () => void;
  className?: string;
};

/** 選択中の条件を一覧表示し、個別に外せる */
export function SearchActiveChips({
  chips,
  onRemove,
  onClearAll,
  className,
}: SearchActiveChipsProps): JSX.Element | null {
  if (chips.length === 0) return null;

  return (
    <div
      className={cn(
        "grid min-w-0 gap-2 rounded-xl bg-surface-muted/80 px-3 py-2.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {chips.length}
          {TEXT.search.activeFilterCount}
        </p>
        {onClearAll ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={onClearAll}
          >
            {TEXT.search.clearAllSelections}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => (
          <SearchFilterChip
            key={chip.id}
            label={chip.label}
            onRemove={() => {
              onRemove(chip);
            }}
          />
        ))}
      </div>
    </div>
  );
}
