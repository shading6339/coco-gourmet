import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type GlassSelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> & {
  className?: string;
  selectClassName?: string;
};

/** ガラスのピル風ネイティブ `<select>`。appearance-none + 独自シェブロン。 */
export const GlassSelect = React.forwardRef<HTMLSelectElement, GlassSelectProps>(
  function GlassSelect({ className, selectClassName, children, ...props }, ref) {
    return (
      <span data-slot="glass-select" className={cn("glass-float relative inline-flex items-center rounded-full", "focus-within:ring-2 focus-within:ring-primary/40", className)}>
        <select ref={ref} className={cn("w-full appearance-none rounded-full bg-transparent", "py-1.5 pl-3 pr-8 text-sm font-medium text-foreground outline-none", selectClassName)} {...props}>
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 size-4 text-muted-foreground" />
      </span>
    );
  },
);
