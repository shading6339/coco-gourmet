import type { JSX } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** 店名直下: アイコン + テキスト（タグ風にしない） */
export function ShopMetaLine({
  icon: Icon,
  children,
  className,
  "aria-label": ariaLabel,
}: {
  icon: LucideIcon;
  children: string;
  className?: string;
  "aria-label"?: string;
}): JSX.Element {
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        "flex w-full min-w-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
