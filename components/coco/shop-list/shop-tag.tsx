import type { ComponentPropsWithoutRef, JSX } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ShopTagProps = {
  children: string;
  className?: string;
  title?: string;
} & Omit<ComponentPropsWithoutRef<"span">, "children" | "className" | "title">;

/** §10.4 Category Chip（shadcn Badge chip） */
export function ShopTag({
  children,
  className,
  title,
  ...rest
}: ShopTagProps): JSX.Element {
  return (
    <Badge
      variant="chip"
      title={title}
      {...rest}
      className={cn("shrink-0 text-xs", className)}
    >
      {children}
    </Badge>
  );
}
