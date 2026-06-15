"use client";

import type { ReactNode } from "react";

import { OVERSCROLL_NEXT_SNAP_BACK_MS } from "@/lib/pagination/overscroll-next-page";
import { cn } from "@/lib/utils";

type PullNextPageBounceShellProps = {
  pullOffset: number;
  isPulling: boolean;
  snapBack: boolean;
  children: ReactNode;
};

/** 一覧を pull-to-refresh 風に持ち上げる */
export function PullNextPageBounceShell({
  pullOffset,
  isPulling,
  snapBack,
  children,
}: PullNextPageBounceShellProps): React.JSX.Element {
  return (
    <div
      className={cn(
        "will-change-transform",
        isPulling && "pull-next-dragging",
        snapBack && "pull-next-snap-back",
      )}
      style={{
        transform:
          pullOffset > 0 ? `translate3d(0, -${pullOffset}px, 0)` : undefined,
        transition: snapBack
          ? `transform ${OVERSCROLL_NEXT_SNAP_BACK_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
          : undefined,
      }}
    >
      {children}
    </div>
  );
}
