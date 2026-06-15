import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const typographyVariants = cva("text-foreground", {
  variants: {
    variant: {
      "headline-lg": "font-brand text-2xl font-bold tracking-tight",
      "headline-lg-mobile": "font-brand text-2xl font-bold leading-8",
      "headline-md": "text-xl font-semibold leading-7",
      "body-lg": "text-lg leading-7",
      "body-md": "text-base leading-6",
      "label-md": "text-sm font-semibold tracking-wide",
      "label-sm": "text-xs font-medium leading-4",
      muted: "text-sm text-muted-foreground",
      lead: "text-base leading-relaxed text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body-md",
  },
});

type TypographyProps = React.ComponentProps<"p"> &
  VariantProps<typeof typographyVariants> & {
    as?: "p" | "span" | "h1" | "h2" | "h3" | "div";
  };

function Typography({
  className,
  variant,
  as: Component = "p",
  ...props
}: TypographyProps): React.JSX.Element {
  return (
    <Component
      data-slot="typography"
      className={cn(typographyVariants({ variant, className }))}
      {...props}
    />
  );
}

function TypographyH1({
  className,
  ...props
}: React.ComponentProps<"h1">): React.JSX.Element {
  return (
    <h1
      data-slot="typography-h1"
      className={cn(typographyVariants({ variant: "headline-lg-mobile" }), className)}
      {...props}
    />
  );
}

function TypographyH2({
  className,
  ...props
}: React.ComponentProps<"h2">): React.JSX.Element {
  return (
    <h2
      data-slot="typography-h2"
      className={cn(typographyVariants({ variant: "headline-md" }), className)}
      {...props}
    />
  );
}

function TypographyLead({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="typography-lead"
      className={cn(typographyVariants({ variant: "lead" }), className)}
      {...props}
    />
  );
}

function TypographyMuted({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element {
  return (
    <p
      data-slot="typography-muted"
      className={cn(typographyVariants({ variant: "muted" }), className)}
      {...props}
    />
  );
}

export {
  Typography,
  TypographyH1,
  TypographyH2,
  TypographyLead,
  TypographyMuted,
  typographyVariants,
};
