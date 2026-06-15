import type { JSX } from "react";
import { ArrowLeft } from "lucide-react";

import {
  getGenreDisplayLabel,
  POPULAR_GENRE_CODES,
} from "@/constants/genre-display";
import { TEXT } from "@/constants/text";
import { GenreBentoTile } from "@/components/coco/home/genre-bento-tile";
import type { SearchOption } from "@/lib/search/filter-shops";
import { cn } from "@/lib/utils";

type GenreGridProps = {
  categories: SearchOption[];
  isLoading?: boolean;
  onBack: () => void;
  onSelect: (category: SearchOption) => void;
  className?: string;
};

function GenreGridSkeleton(): JSX.Element {
  return (
    <div
      className="grid grid-cols-2 gap-3"
      aria-busy="true"
      aria-live="polite"
      aria-label="ジャンルを読み込み中"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className="skeleton aspect-4/3 rounded-xl"
          aria-hidden
        />
      ))}
    </div>
  );
}

function resolveAllCategories(categories: SearchOption[]): SearchOption[] {
  const popularSet = new Set<string>(POPULAR_GENRE_CODES);
  const popular = POPULAR_GENRE_CODES.flatMap((code) => {
    const matched = categories.find((category) => category.code === code);
    if (!matched) return [];
    return [
      {
        code: matched.code,
        label: getGenreDisplayLabel(matched.code, matched.label),
      },
    ];
  });
  const rest = categories
    .filter((category) => !popularSet.has(category.code))
    .map((category) => ({
      code: category.code,
      label: category.label,
    }));

  return [...popular, ...rest];
}

export function GenreGrid({
  categories,
  isLoading = false,
  onBack,
  onSelect,
  className,
}: GenreGridProps): JSX.Element {
  const items = resolveAllCategories(categories);

  return (
    <section className={cn("space-y-4", className)} aria-label={TEXT.search.genreLabel}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label={TEXT.common.backLabel}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface-muted"
        >
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <h1 className="text-[1.375rem] font-bold leading-7 tracking-normal text-foreground">
          {TEXT.search.genreLabel}
        </h1>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {items.map((category) => (
            <GenreBentoTile
              key={category.code}
              category={category}
              className="aspect-4/3"
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : isLoading ? (
        <GenreGridSkeleton />
      ) : null}
    </section>
  );
}
