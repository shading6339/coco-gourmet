import { TEXT } from "@/constants/text";

/** 検索ヒット件数（例: 1,234件） */
export function formatResultTotal(total: number): string {
  return `${total.toLocaleString("ja-JP")}${TEXT.search.resultCountSuffix}`;
}

/** ページ表示（複数ページ時のみ。例: 3 / 12） */
export function formatPageIndicator(
  currentPage: number,
  totalPages: number,
): string {
  return `${currentPage} / ${totalPages}`;
}

/** スクラブ中の補助表示（例: 全 491 ページ） */
export function formatPageScrubContext(totalPages: number): string {
  return `全 ${totalPages.toLocaleString("ja-JP")} ページ`;
}
