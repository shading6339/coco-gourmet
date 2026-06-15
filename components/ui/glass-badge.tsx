import * as React from "react";
import { cn } from "@/lib/utils";

type GlassBadgeVariant = "neutral" | "active";

const VARIANT_CLASS: Record<GlassBadgeVariant, string> = {
  neutral: "bg-surface-muted/80 text-muted-foreground",
  active: "bg-primary-container text-primary-container-foreground",
};

type GlassBadgeProps = React.HTMLAttributes<HTMLSpanElement> & { variant?: GlassBadgeVariant };

/** 小バッジ（カテゴリ・距離・フィルタ等）。角丸ピル + 控えめな面色。 */
export const GlassBadge = React.forwardRef<HTMLSpanElement, GlassBadgeProps>(
  function GlassBadge({ className, variant = "neutral", ...props }, ref) {
    return (
      <span
        ref={ref}
        data-slot="glass-badge"
        className={cn("inline-flex min-w-0 items-center gap-1 rounded-full px-2 py-0.5", "text-xs font-medium leading-tight tabular-nums", VARIANT_CLASS[variant], className)}
        {...props}
      />
    );
  },
);
