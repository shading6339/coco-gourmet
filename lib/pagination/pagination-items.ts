/** 1 始まりの start インデックス → ページ番号 */
export function startIndexToPage(start: number, pageSize: number): number {
  return Math.floor((start - 1) / pageSize) + 1;
}

/** ページ番号 → API の start パラメータ */
export function pageToStartIndex(page: number, pageSize: number): number {
  return (page - 1) * pageSize + 1;
}
