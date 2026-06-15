import type { JSX } from "react";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { TEXT } from "@/constants/text";
import type { ShopSortKey } from "@/lib/search/filter-shops";

type SortOption = {
  label: string;
  value: ShopSortKey;
};

type SearchResultMetaProps = {
  total: number;
  resultNote?: string;
  sort: ShopSortKey;
  onSortChange: (sort: ShopSortKey) => void;
};

const SORT_OPTIONS: SortOption[] = [
  { label: "おすすめ順", value: "recommended" },
  { label: "近い順", value: "distance" },
];

/** 一覧先頭の件数・並び順（AppBar とは分離し、情報を最小限に抑える） */
export function SearchResultMeta({
  total,
  resultNote,
  sort,
  onSortChange,
}: SearchResultMetaProps): JSX.Element {
  return (
    <div
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 text-xs text-muted-foreground"
      aria-live="polite"
    >
      <div className="min-w-0 space-y-0.5">
        <span className="block truncate text-left tabular-nums">
          <AnimatedNumber value={total} />
          {TEXT.search.resultCountSuffix}
        </span>
        {resultNote ? (
          <span className="block truncate text-[11px] text-muted-foreground/80">
            {resultNote}
          </span>
        ) : null}
      </div>
      <label className="min-w-0">
        <span className="sr-only">並び順</span>
        <select
          value={sort}
          onChange={(event) => {
            onSortChange(event.target.value as ShopSortKey);
          }}
          className="h-8 w-full min-w-[7.25rem] max-w-[10.5rem] rounded-lg border border-border bg-surface px-2 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
