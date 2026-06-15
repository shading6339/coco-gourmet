import { useMemo, useState, type JSX } from "react";
import { ChevronDown } from "lucide-react";

import { SearchFilterChip } from "@/components/coco/shop-list/search-filter-chip";
import { Input } from "@/components/ui/input";
import { POPULAR_SPECIAL_CODES } from "@/constants/search-popular";
import { TEXT } from "@/constants/text";
import type { SpecialSearchOption } from "@/lib/hotpepper/masters";
import { cn } from "@/lib/utils";

type SearchSpecialPickerProps = {
  value: string;
  specials: readonly SpecialSearchOption[];
  onChange: (code: string) => void;
  className?: string;
};

function groupSpecialsByCategory(
  specials: readonly SpecialSearchOption[],
): Map<string, SpecialSearchOption[]> {
  const groups = new Map<string, SpecialSearchOption[]>();

  for (const special of specials) {
    const key = special.categoryLabel || "その他";
    const current = groups.get(key) ?? [];
    current.push(special);
    groups.set(key, current);
  }

  return groups;
}

export function SearchSpecialPicker({
  value,
  specials,
  onChange,
  className,
}: SearchSpecialPickerProps): JSX.Element {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(
    () =>
      Boolean(value) &&
      !POPULAR_SPECIAL_CODES.includes(
        value as (typeof POPULAR_SPECIAL_CODES)[number],
      ),
  );

  const popularSpecials = useMemo(() => {
    const byCode = new Map(specials.map((special) => [special.code, special]));
    return POPULAR_SPECIAL_CODES.flatMap((code) => {
      const special = byCode.get(code);
      return special ? [special] : [];
    });
  }, [specials]);

  const filteredSpecials = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return specials;
    return specials.filter((special) =>
      special.label.toLowerCase().includes(normalized),
    );
  }, [query, specials]);

  const groupedFiltered = useMemo(
    () => groupSpecialsByCategory(filteredSpecials),
    [filteredSpecials],
  );

  return (
    <div className={cn("grid min-w-0 gap-2", className)}>
      {popularSpecials.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {popularSpecials.map((special) => (
            <SearchFilterChip
              key={special.code}
              label={special.label}
              mode="single"
              active={value === special.code}
              onToggle={() => {
                onChange(value === special.code ? "" : special.code);
              }}
            />
          ))}
        </div>
      ) : null}

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
        <span>{TEXT.search.showMoreSpecials}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            showAll && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {showAll ? (
        <div className="grid min-w-0 gap-3 rounded-lg bg-surface-muted/50 p-3">
          <Input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={TEXT.search.specialSearchPlaceholder}
            className="h-9"
          />
          <div className="grid max-h-48 min-w-0 gap-3 overflow-y-auto">
            {groupedFiltered.size === 0 ? (
              <p className="text-xs text-muted-foreground">
                {TEXT.search.noMatchingSpecials}
              </p>
            ) : (
              [...groupedFiltered.entries()].map(([categoryLabel, items]) => (
                <div key={categoryLabel} className="grid min-w-0 gap-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    {categoryLabel}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {items.map((special) => (
                      <SearchFilterChip
                        key={special.code}
                        label={special.label}
                        mode="single"
                        active={value === special.code}
                        onToggle={() => {
                          onChange(
                            value === special.code ? "" : special.code,
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
