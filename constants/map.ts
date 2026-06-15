/** 詳細画面の地図ズーム（大きいほど寄る） */
export const MAP_ZOOM = 15;

export const MAP_WIDTH = 640;
export const MAP_HEIGHT = 360;

export const MAP_ATTRIBUTION = "© OpenStreetMap © CARTO";

/** 地図検索タブの初期ズーム */
export const MAP_SEARCH_INITIAL_ZOOM = 16;

/** このズーム以上で「点ピン」→「画像ピン（店名・距離つき）」に切り替える */
export const ZOOM_FOR_RICH_PINS = 17;

/**
 * 地図ズーム → 検索半径(range値 "1"〜"5")へのスナップ。
 * ズームが小さい（広域）ほど大きい半径を割り当てる。HotPepper は中心+半径のみ対応。
 */
export function zoomToRangeValue(zoom: number): string {
  if (zoom >= 17) return "1"; // 300m
  if (zoom >= 16) return "2"; // 500m
  if (zoom >= 15) return "3"; // 1000m
  if (zoom >= 14) return "4"; // 2000m
  return "5"; // 3000m
}
