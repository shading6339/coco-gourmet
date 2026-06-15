/** 徒歩速度の目安（m/分）。時速約4.8km */
const WALK_SPEED_M_PER_MIN = 80;

/** 直線距離から徒歩時間（分）を概算 */
export function estimateWalkMinutes(meters: number): number {
  return Math.max(1, Math.round(meters / WALK_SPEED_M_PER_MIN));
}

/** 検索半径向けの徒歩時間ヒント文言 */
export function formatWalkTimeHint(meters: number): string {
  return `徒歩${estimateWalkMinutes(meters)}分が目安`;
}
