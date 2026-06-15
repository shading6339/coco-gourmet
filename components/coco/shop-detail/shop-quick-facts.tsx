import type { JSX } from "react";
import { Clock, MapPin, Wallet } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { TEXT } from "@/constants/text";
import { formatDistance } from "@/lib/map/distance";
import { summarizeOpenHours } from "@/lib/shop/open-hours";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/shop";

type QuickFact = {
  icon: typeof Clock;
  label: string;
  value: string;
  tone?: "open" | "closed" | "default";
};

/**
 * 詳細ヒーロー直下のクイックファクト帯。
 * 営業状況 / 予算 / アクセス・距離 を一目でスキャンできる（この店を素早く理解する）。
 */
export function ShopQuickFacts({
  shop,
  className,
}: {
  shop: Shop;
  className?: string;
}): JSX.Element | null {
  const facts: QuickFact[] = [];

  const hours = summarizeOpenHours(shop.open, shop.close);
  if (hours) {
    if (hours.status === "open" || hours.status === "closed") {
      facts.push({
        icon: Clock,
        label: TEXT.shop.openLabel,
        value:
          hours.status === "open"
            ? TEXT.shop.openStatusOpen
            : TEXT.shop.openStatusClosed,
        tone: hours.status,
      });
    } else if (hours.todayHours) {
      facts.push({
        icon: Clock,
        label: TEXT.shop.openLabel,
        value: hours.todayHours,
      });
    }
  }

  const budget = shop.budgetNightRange ?? shop.budgetDayRange ?? shop.budgetLabel;
  if (budget) {
    facts.push({ icon: Wallet, label: TEXT.search.budgetLabel, value: budget });
  }

  // 距離は短くスキャンしやすい値のみ。アクセス全文は下の「場所」セクションに任せる
  if (shop.distanceMeters !== null) {
    facts.push({
      icon: MapPin,
      label: TEXT.shop.accessLabel,
      value: formatDistance(shop.distanceMeters),
    });
  }

  if (facts.length === 0) return null;

  return (
    <div
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-2 rounded-md bg-surface p-3 ring-1 ring-foreground/6 shadow-[var(--shadow-card)]",
        className,
      )}
      data-slot="shop-quick-facts"
    >
      {facts.map((fact) => {
        const Icon = fact.icon;
        return (
          <div
            key={fact.label}
            className="flex w-full min-w-0 flex-col items-center gap-1 text-center"
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                fact.tone === "open"
                  ? "text-secondary"
                  : fact.tone === "closed"
                    ? "text-muted-foreground"
                    : "text-primary",
              )}
              aria-hidden
            />
            <Typography
              as="span"
              variant="label-sm"
              className={cn(
                "block max-w-full truncate tabular-nums",
                fact.tone === "open"
                  ? "text-secondary"
                  : fact.tone === "closed"
                    ? "text-muted-foreground"
                    : "text-foreground",
              )}
            >
              {fact.value}
            </Typography>
            <span className="text-[10px] leading-none text-muted-foreground">
              {fact.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
