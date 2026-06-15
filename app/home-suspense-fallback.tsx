import type { JSX } from "react";

import type { SearchUrlState } from "@/lib/search/search-url";

type HomeSuspenseFallbackProps = {
  initialUrlState: SearchUrlState;
};

/** 一覧 URL の再読み込み時、Client 待ちの間も AppBar 相当のシェルを出す */
export function HomeSuspenseFallback({
  initialUrlState,
}: HomeSuspenseFallbackProps): JSX.Element | null {
  // 共有ディープリンク: 詳細用スケルトン（ヒーロー4:3 + 本文）
  if (initialUrlState.shopId) {
    return (
      <main aria-hidden className="mx-auto w-full max-w-[28rem]">
        <div className="skeleton aspect-[4/3] w-full rounded-b-hero" />
        <div className="space-y-4 px-5 pt-4">
          <div className="skeleton h-7 w-3/4 rounded-lg" />
          <div className="skeleton h-16 w-full rounded-md" />
          <div className="skeleton h-11 w-full rounded-md" />
        </div>
      </main>
    );
  }

  if (!initialUrlState.hasConditions) return null;

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-md px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
        aria-hidden
      >
        <div className="glass-float box-border rounded-full px-2 py-1">
          <div className="skeleton h-10 w-full rounded-full" />
        </div>
      </header>
      <div aria-hidden className="app-bar-spacer" />
    </>
  );
}
