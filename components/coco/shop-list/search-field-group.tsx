import type { JSX, ReactNode } from "react";

import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";

export type SearchSelectionMode = "single" | "multiple";

type SearchFieldGroupProps = {
  label: string;
  /** 未指定のときはバッジを出さない（予算スライダーなど） */
  mode?: SearchSelectionMode;
  children: ReactNode;
  className?: string;
};

/** 検索条件の1ブロック（単一／複数選択をラベルで明示） */
export function SearchFieldGroup({
  label,
  mode,
  children,
  className,
}: SearchFieldGroupProps): JSX.Element {
  return (
    <section
      className={cn("grid min-w-0 gap-2", className)}
      aria-label={label}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        {mode ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
              mode === "multiple"
                ? "bg-primary/10 text-primary"
                : "bg-surface-muted text-muted-foreground",
            )}
          >
            {mode === "multiple"
              ? TEXT.search.multiSelectHint
              : TEXT.search.singleSelectHint}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
