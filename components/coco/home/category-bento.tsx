import type { JSX } from "react";
import { ChevronRight } from "lucide-react";

import {
  getGenreDisplayLabel,
  POPULAR_GENRE_CODES,
} from "@/constants/genre-display";
import { TEXT } from "@/constants/text";
import { GenreBentoTile } from "@/components/coco/home/genre-bento-tile";
import type { SearchOption } from "@/lib/search/filter-shops";
import { cn } from "@/lib/utils";

type CategoryBentoProps = {
  categories: SearchOption[];
  isLoading?: boolean;
  onShowAll: () => void;
  onSelect: (category: SearchOption) => void;
  className?: string;
};

const PREVIEW_BENTO_CLASS = [
  "col-span-2 aspect-[8/3]",
  "col-span-1 aspect-[4/3]",
  "col-span-1 aspect-[4/3]",
];

function resolvePopularCategories(categories: SearchOption[]): SearchOption[] {
  return POPULAR_GENRE_CODES.flatMap((code) => {
    const matched = categories.find((category) => category.code === code);
    if (!matched) return [];
    return [
      {
        code: matched.code,
        label: getGenreDisplayLabel(matched.code, matched.label),
      },
    ];
  });
}

function CategoryBentoSkeleton(): JSX.Element {
  return (
    <div
      className="grid grid-cols-2 gap-3"
      aria-busy="true"
      aria-live="polite"
      aria-label="ジャンルを読み込み中"
    >
      {PREVIEW_BENTO_CLASS.map((tileClass, index) => (
        <div key={index} className={cn("skeleton rounded-xl", tileClass)} aria-hidden />
      ))}
    </div>
  );
}

export function CategoryBento({
  categories,
  isLoading = false,
  onShowAll,
  onSelect,
  className,
}: CategoryBentoProps): JSX.Element | null {
  const items = resolvePopularCategories(categories);

  if (items.length === 0 && !isLoading) return null;

  return (
    <section className={cn("space-y-4", className)} aria-label={TEXT.search.genreLabel}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="min-w-0 text-[1.375rem] font-bold leading-7 tracking-normal text-foreground">
          {TEXT.search.genreLabel}
        </h2>
        <button
          type="button"
          onClick={onShowAll}
          aria-label={TEXT.search.showAllGenresLabel}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {items.map((category, index) => (
            <GenreBentoTile
              key={category.code}
              category={category}
              className={PREVIEW_BENTO_CLASS[index] ?? "col-span-1 aspect-[4/3]"}
              imageSizes={
                index === 0
                  ? "(max-width: 768px) 100vw, 384px"
                  : "(max-width: 768px) 50vw, 188px"
              }
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <CategoryBentoSkeleton />
      )}
    </section>
  );
}
