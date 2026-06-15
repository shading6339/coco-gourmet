"use client";

import type { JSX } from "react";
import { List, Map as MapIcon } from "lucide-react";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { TEXT } from "@/constants/text";
import { cn } from "@/lib/utils";

type SearchViewToggleProps = {
  view: "list" | "map";
  onToggle: () => void;
  className?: string;
};

/**
 * 検索タブのリスト⇄地図 浮遊トグル。
 * ボトムナビ上・画面右下にアイコンのみのガラスボタンとして浮かす。
 */
export function SearchViewToggle({
  view,
  onToggle,
  className,
}: SearchViewToggleProps): JSX.Element {
  const toMap = view === "list";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 z-20 mx-auto flex max-w-md justify-end px-3",
        className,
      )}
      style={{
        bottom: "calc(var(--bottom-nav-offset) + 0.75rem)",
      }}
    >
      <LiquidGlassButton
        variant="primary"
        className="pointer-events-auto size-12 p-0 shadow-lg"
        aria-label={toMap ? TEXT.common.mapToggleToMap : TEXT.common.mapToggleToList}
        onClick={onToggle}
      >
        {toMap ? (
          <MapIcon className="size-5" aria-hidden />
        ) : (
          <List className="size-5" aria-hidden />
        )}
      </LiquidGlassButton>
    </div>
  );
}
