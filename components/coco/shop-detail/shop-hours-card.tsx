import type { JSX } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { summarizeOpenHours } from "@/lib/shop/open-hours";
import { TEXT } from "@/constants/text";
import { Typography } from "@/components/ui/typography";

/** 詳細の情報ブロック（L1: hairline + shadow-card） */
const BORDERLESS_SURFACE_CLASS =
  "rounded-md bg-surface ring-1 ring-foreground/6 shadow-[var(--shadow-card)]";

type ShopHoursCardProps = {
  openHours: string;
  closedDay?: string;
  className?: string;
};

/** 営業時間カード（常時表示・公式に近い原文） */
export function ShopHoursCard({
  openHours,
  closedDay = "",
  className,
}: ShopHoursCardProps): JSX.Element | null {
  const summary = summarizeOpenHours(openHours, closedDay);
  if (!summary) return null;

  const statusLabel =
    summary.status === "open"
      ? TEXT.shop.openStatusOpen
      : summary.status === "closed"
        ? TEXT.shop.openStatusClosed
        : TEXT.shop.openLabel;

  const statusClassName =
    summary.status === "open"
      ? "text-secondary"
      : summary.status === "closed"
        ? "text-muted-foreground"
        : "text-foreground";

  const scheduleLines = summary.lines.filter((line) => line.kind === "schedule");
  const footnotes = summary.lines.filter((line) => line.kind === "footnote");

  return (
    <div className={cn(BORDERLESS_SURFACE_CLASS, className)}>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-muted"
            aria-hidden
          >
            <Clock className="size-5 text-primary" strokeWidth={1.5} />
          </span>

          <div className="min-w-0 flex-1 space-y-0.5">
            <Typography as="p" variant="label-md" className={statusClassName}>
              {statusLabel}
            </Typography>
            {summary.todayHours ? (
              <p className="text-sm text-muted-foreground">
                {TEXT.shop.todayHoursPrefix} {summary.todayHours}
              </p>
            ) : null}
          </div>
        </div>

        {scheduleLines.length > 0 ? (
          <div className="space-y-2">
            {scheduleLines.map((line) => (
              <p
                key={line.text}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : null}

        {footnotes.length > 0 ? (
          <div className="space-y-1">
            {footnotes.map((line) => (
              <p
                key={line.text}
                className="text-xs leading-relaxed text-muted-foreground"
              >
                {line.text}
              </p>
            ))}
          </div>
        ) : null}

        {summary.closedDay ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {TEXT.shop.closedDayLabel}：{summary.closedDay}
          </p>
        ) : null}
      </div>
    </div>
  );
}
