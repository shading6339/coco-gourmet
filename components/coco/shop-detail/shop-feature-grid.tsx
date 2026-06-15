import type { JSX } from "react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { buildShopFeatureDisplays } from "@/lib/shop/shop-feature-display";

type ShopFeatureGridProps = {
  tags: string[];
  className?: string;
};

/** 詳細の特徴（2列×最大2行のアイコンカード） */
export function ShopFeatureGrid({
  tags,
  className,
}: ShopFeatureGridProps): JSX.Element | null {
  const features = buildShopFeatureDisplays(tags);
  if (features.length === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {features.map((feature) => {
        const Icon = feature.icon;
        return (
          <div
            key={feature.tag}
            className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-md bg-surface px-2 py-3 ring-1 ring-foreground/6 shadow-[var(--shadow-card)]"
          >
            <Icon
              className="size-7 shrink-0 text-primary"
              strokeWidth={1.5}
              aria-hidden
            />
            <Typography
              as="span"
              variant="label-sm"
              className="text-center leading-tight text-foreground"
            >
              {feature.label}
            </Typography>
          </div>
        );
      })}
    </div>
  );
}
