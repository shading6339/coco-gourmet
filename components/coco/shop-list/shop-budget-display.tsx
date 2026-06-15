import type { JSX } from "react";
import { Moon, Sun } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TEXT } from "@/constants/text";
import { ShopMetaLine } from "@/components/coco/shop-list/shop-meta-line";

type ShopBudgetDisplayProps = {
  dayRange: string | null;
  nightRange: string | null;
  layout?: "stack" | "inline";
  className?: string;
};

function BudgetInlineItem({
  icon: Icon,
  label,
  text,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  text: string;
  tone: "day" | "night";
}): JSX.Element {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <Icon
        className={cn(
          "size-3.5 shrink-0",
          tone === "day" ? "text-[#b77700]" : "text-[#5d628f]",
        )}
        aria-hidden
      />
      <span className="min-w-0 truncate text-xs text-muted-foreground tabular-nums" aria-label={`${label} ${text}`}>
        <span className="sr-only">{label}</span>
        {text}
      </span>
    </span>
  );
}

/** 夜・昼アイコン + 500 円刻みレンジ */
export function ShopBudgetDisplay({
  dayRange,
  nightRange,
  layout = "inline",
  className,
}: ShopBudgetDisplayProps): JSX.Element | null {
  if (!dayRange && !nightRange) return null;

  if (layout === "inline") {
    const hasBoth = Boolean(dayRange && nightRange);

    return (
      <div
        className={cn(
          "grid w-full min-w-0 gap-x-2 gap-y-1",
          hasBoth ? "grid-cols-2" : "grid-cols-1",
          className,
        )}
      >
        {nightRange ? (
          <BudgetInlineItem
            icon={Moon}
            label={TEXT.search.nightBudget}
            text={nightRange}
            tone="night"
          />
        ) : null}
        {dayRange ? (
          <BudgetInlineItem
            icon={Sun}
            label={TEXT.search.dayBudget}
            text={dayRange}
            tone="day"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-0 flex-col gap-1", className)}>
      {nightRange ? (
        <ShopMetaLine icon={Moon} aria-label={`${TEXT.search.nightBudget} ${nightRange}`}>
          {nightRange}
        </ShopMetaLine>
      ) : null}
      {dayRange ? (
        <ShopMetaLine icon={Sun} aria-label={`${TEXT.search.dayBudget} ${dayRange}`}>
          {dayRange}
        </ShopMetaLine>
      ) : null}
    </div>
  );
}
