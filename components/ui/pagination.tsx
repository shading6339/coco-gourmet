"use client";

import * as React from "react";

import {
  PAGINATION_BAR_ROW_HEIGHT_CLASS,
  PaginationPageScrubber,
} from "@/components/ui/pagination-page-picker";
import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label={TEXT.pagination.paginationLabel}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

type PaginationNavButtonProps = React.ComponentProps<typeof Button> & {
  text?: string;
};

/** DS §10: タップ領域は n/max 行と同じ高さ。左右列いっぱいの幅 */
const PAGINATION_NAV_BUTTON_CLASS =
  "h-full min-h-0 w-full shrink-0 rounded-md px-3";

function PaginationPrevious({
  className,
  text = TEXT.pagination.previousPage,
  ...props
}: PaginationNavButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      aria-label={text}
      className={cn(PAGINATION_NAV_BUTTON_CLASS, className)}
      {...props}
    >
      {text}
    </Button>
  );
}

function PaginationNext({
  className,
  text = TEXT.pagination.nextPage,
  ...props
}: PaginationNavButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      aria-label={text}
      className={cn(PAGINATION_NAV_BUTTON_CLASS, className)}
      {...props}
    >
      {text}
    </Button>
  );
}

type PaginationBarProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

/** 前へ／次へ + 長押しスクラブ */
function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: PaginationBarProps): React.JSX.Element | null {
  const [isScrubbing, setIsScrubbing] = React.useState(false);

  if (totalPages <= 1) return null;

  const canGoPrevious = currentPage > 1 && !disabled;
  const canGoNext = currentPage < totalPages && !disabled;

  const navFadeClass = cn(
    "row-start-1 transition-all duration-300 ease-out",
    isScrubbing && "pointer-events-none opacity-0",
  );

  return (
    <Pagination className={className}>
      {/* L3 浮遊面: 中の操作要素は不透明のまま（同心円: float 20px > 内側 12px） */}
      <div className="glass-float w-full rounded-[var(--radius-float)] p-2">
        <div
          className={cn(
            "relative grid w-full grid-cols-3 items-stretch gap-2",
            PAGINATION_BAR_ROW_HEIGHT_CLASS,
            isScrubbing && "z-50",
          )}
        >
          <PaginationPrevious
            className={navFadeClass}
            disabled={!canGoPrevious}
            onClick={() => {
              onPageChange(currentPage - 1);
            }}
          />
          <PaginationPageScrubber
            currentPage={currentPage}
            totalPages={totalPages}
            disabled={disabled}
            onPageChange={onPageChange}
            onScrubbingChange={setIsScrubbing}
          />
          <PaginationNext
            className={navFadeClass}
            disabled={!canGoNext}
            onClick={() => {
              onPageChange(currentPage + 1);
            }}
          />
        </div>
      </div>
    </Pagination>
  );
}

export { PaginationBar };
