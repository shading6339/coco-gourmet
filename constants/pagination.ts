/** Hot Pepper 検索 API と一覧 UI で共有する1ページ件数 */
export const SHOP_PAGE_SIZE = 10;

/** Hot Pepper API が1リクエストで返せる最大件数 */
export const HOTPEPPER_MAX_PAGE_SIZE = 20;

/** 地図プロット用: 2リクエスト × 20件 */
export const MAP_PLOT_REQUEST_COUNT = 2;
export const MAP_PLOT_BATCH_SIZE = HOTPEPPER_MAX_PAGE_SIZE;
export const MAP_PLOT_SHOP_LIMIT =
  MAP_PLOT_REQUEST_COUNT * MAP_PLOT_BATCH_SIZE;
