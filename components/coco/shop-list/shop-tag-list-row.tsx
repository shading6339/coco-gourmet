"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import { cn } from "@/lib/utils";
import { fitTagsInRowWidth } from "@/lib/shop/fit-tags-in-row";
import { ShopTag } from "@/components/coco/shop-list/shop-tag";

type ShopTagListRowProps = {
  tags: string[];
  className?: string;
};

type RowLayout = {
  visibleCount: number;
  showOverflowChip: boolean;
};

/** 一覧用: 1行に収まるタグだけ表示し、残りは +N */
export function ShopTagListRow({
  tags,
  className,
}: ShopTagListRowProps): JSX.Element {
  const rowRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<RowLayout>({
    visibleCount: tags.length,
    showOverflowChip: false,
  });

  const recompute = useCallback(() => {
    const row = rowRef.current;
    const measure = measureRef.current;
    if (!row || !measure) return;

    const width = row.clientWidth;
    const tagEls = measure.querySelectorAll<HTMLElement>("[data-tag-measure]");
    const tagWidths = Array.from(tagEls).map((el) => el.offsetWidth);

    // レイアウト前・測定失敗時は表示を潰さない
    if (width <= 0 || tagWidths.length !== tags.length) return;

    const overflowChipWidth = (hiddenCount: number): number => {
      const el = measure.querySelector<HTMLElement>(
        `[data-overflow-measure="${String(hiddenCount)}"]`,
      );
      return el?.offsetWidth ?? 0;
    };

    setLayout(fitTagsInRowWidth(tagWidths, width, overflowChipWidth));
  }, [tags]);

  useLayoutEffect(() => {
    recompute();
    const row = rowRef.current;
    if (!row) return;

    const observer = new ResizeObserver(() => {
      recompute();
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, [recompute]);

  const overflow = tags.length - layout.visibleCount;
  const visibleTags = tags.slice(0, layout.visibleCount);
  const loneTagTruncates =
    layout.visibleCount === 1 && tags.length > 1 && !layout.showOverflowChip;

  return (
    <div ref={rowRef} className={cn("relative w-full min-w-0", className)}>
      <div
        ref={measureRef}
        className="pointer-events-none invisible absolute left-0 top-0 flex max-w-none flex-nowrap gap-1.5"
        aria-hidden
      >
        {tags.map((tag) => (
          <ShopTag key={`m-${tag}`} data-tag-measure>
            {tag}
          </ShopTag>
        ))}
        {tags.map((_, index) => {
          const hidden = tags.length - index;
          return (
            <ShopTag
              key={`m-overflow-${hidden}`}
              data-overflow-measure={String(hidden)}
            >
              {`+${hidden}`}
            </ShopTag>
          );
        })}
      </div>

      <div className="flex h-5 w-full min-w-0 flex-nowrap items-center gap-1.5">
        {visibleTags.map((tag) => (
          <ShopTag
            key={tag}
            className={loneTagTruncates ? "min-w-0 max-w-full truncate" : undefined}
          >
            {tag}
          </ShopTag>
        ))}
        {layout.showOverflowChip && overflow > 0 ? (
          <ShopTag
            className="shrink-0 tabular-nums"
            title={tags.slice(layout.visibleCount).join("、")}
          >
            {`+${overflow}`}
          </ShopTag>
        ) : null}
      </div>
    </div>
  );
}
