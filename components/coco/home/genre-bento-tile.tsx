import type { JSX } from "react";
import Image from "next/image";

import { getGenreImage } from "@/constants/genre-display";
import type { SearchOption } from "@/lib/search/filter-shops";
import { cn } from "@/lib/utils";

type GenreBentoTileProps = {
  category: SearchOption;
  className?: string;
  imageSizes?: string;
  onSelect: (category: SearchOption) => void;
};

export function GenreBentoTile({
  category,
  className,
  imageSizes = "(max-width: 768px) 50vw, 188px",
  onSelect,
}: GenreBentoTileProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect(category);
      }}
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-xl bg-surface text-left ring-1 ring-foreground/8 shadow-[var(--shadow-card)] transition-transform active:scale-[0.99]",
        className,
      )}
    >
      <Image
        src={getGenreImage(category.code)}
        alt=""
        fill
        sizes={imageSizes}
        className="object-cover transition-transform duration-300 group-active:scale-[1.02]"
      />
      <span
        className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent"
        aria-hidden
      />
      <span className="absolute inset-x-4 bottom-4 line-clamp-2 break-words text-lg font-bold leading-tight text-white drop-shadow-sm">
        {category.label}
      </span>
    </button>
  );
}
