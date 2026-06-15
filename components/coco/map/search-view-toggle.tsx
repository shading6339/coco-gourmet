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
 * 検索タブのリスト⇄地図切替。
 * 画面右下・ボトムナビ直上に浮かぶ丸型ガラスアイコンボタン。
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
        "pointer-events-none fixed inset-x-0 z-30 mx-auto w-full max-w-[28rem]",
        className,
      )}
      style={{
        bottom: "calc(var(--bottom-nav-offset) + 0.75rem)",
      }}
    >
      <div className="pointer-events-none flex justify-end px-4">
        <LiquidGlassButton
          variant="glass"
          className="pointer-events-auto size-12 shrink-0 p-0 shadow-[var(--shadow-float)]"
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
    </div>
  );
}
