export type HotpepperBudgetTier = {
  code: string;
  min: number;
  max: number;
  label: string;
};

/** Hotpepper グルメサーチの予算マスター（API 応答順ではなく価格順） */
export const HOTPEPPER_BUDGET_TIERS: readonly HotpepperBudgetTier[] = [
  { code: "B009", min: 0, max: 500, label: "～500円" },
  { code: "B010", min: 501, max: 1_000, label: "501～1000円" },
  { code: "B011", min: 1_001, max: 1_500, label: "1001～1500円" },
  { code: "B001", min: 1_501, max: 2_000, label: "1501～2000円" },
  { code: "B002", min: 2_001, max: 3_000, label: "2001～3000円" },
  { code: "B003", min: 3_001, max: 4_000, label: "3001～4000円" },
  { code: "B008", min: 4_001, max: 5_000, label: "4001～5000円" },
  { code: "B015", min: 5_001, max: 6_000, label: "5001～6000円" },
  { code: "B016", min: 6_001, max: 7_000, label: "6001～7000円" },
  { code: "B017", min: 7_001, max: 8_000, label: "7001～8000円" },
  { code: "B018", min: 8_001, max: 9_000, label: "8001～9000円" },
  { code: "B019", min: 9_001, max: 10_000, label: "9001～10000円" },
  { code: "B020", min: 10_001, max: 12_000, label: "10001～12000円" },
  { code: "B021", min: 12_001, max: 15_000, label: "12001～15000円" },
  { code: "B012", min: 15_001, max: 20_000, label: "15001～20000円" },
  { code: "B013", min: 20_001, max: 30_000, label: "20001～30000円" },
  { code: "B014", min: 30_001, max: Number.POSITIVE_INFINITY, label: "30001円～" },
] as const;

/** スライダー下限（円） */
export const BUDGET_SLIDER_MIN = 0;

/** スライダー上限の実値（30001円〜を表す） */
export const BUDGET_SLIDER_OPEN_MAX = 31_000;

/**
 * スライダーのスナップ位置（各予算帯の境界）
 * 0, 500, 1000, …, 30000, 31000
 */
export const BUDGET_SNAP_POINTS: readonly number[] = [
  BUDGET_SLIDER_MIN,
  ...HOTPEPPER_BUDGET_TIERS.slice(0, -1).map((tier) => tier.max),
  BUDGET_SLIDER_OPEN_MAX,
];

/** フィルタなしの既定値 */
export const DEFAULT_BUDGET_MIN = BUDGET_SLIDER_MIN;
export const DEFAULT_BUDGET_MAX = BUDGET_SLIDER_OPEN_MAX;
