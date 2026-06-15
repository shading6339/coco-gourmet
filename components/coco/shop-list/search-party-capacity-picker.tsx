import type { JSX } from "react";

import { SearchFilterChip } from "@/components/coco/shop-list/search-filter-chip";
import { PARTY_CAPACITY_PRESETS } from "@/constants/search-popular";
import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";

type SearchPartyCapacityPickerProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
};

export function SearchPartyCapacityPicker({
  value,
  onChange,
  className,
}: SearchPartyCapacityPickerProps): JSX.Element {
  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-none pb-0.5", className)}>
      {PARTY_CAPACITY_PRESETS.map((preset) => {
        const active = value === preset;
        return (
          <SearchFilterChip
            key={preset}
            label={`${preset}${TEXT.search.partyCapacitySuffix}`}
            mode="single"
            active={active}
            onToggle={() => {
              onChange(active ? null : preset);
            }}
            className="shrink-0"
          />
        );
      })}
    </div>
  );
}
