import * as React from "react";
import { cn } from "@/lib/utils";

type GlassPanelRadius = "md" | "lg" | "float" | "none";

const RADIUS_CLASS: Record<GlassPanelRadius, string> = {
  none: "",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
  float: "rounded-[var(--radius-float)]",
};

type GlassPanelProps = React.HTMLAttributes<HTMLDivElement> & { radius?: GlassPanelRadius };

/** L3 浮遊ガラス面（`.glass-float` + 角丸トークン）の汎用パネル。 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  function GlassPanel({ className, radius = "float", ...props }, ref) {
    return <div ref={ref} data-slot="glass-panel" className={cn("glass-float", RADIUS_CLASS[radius], className)} {...props} />;
  },
);
