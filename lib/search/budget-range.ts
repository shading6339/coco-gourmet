import {
  BUDGET_SLIDER_MIN,
  BUDGET_SLIDER_OPEN_MAX,
  BUDGET_SNAP_POINTS,
  DEFAULT_BUDGET_MAX,
  DEFAULT_BUDGET_MIN,
  HOTPEPPER_BUDGET_TIERS,
  type HotpepperBudgetTier,
} from "@/constants/budget-range";
import type { SearchOption } from "@/lib/search/filter-shops";
import type { Shop } from "@/types/shop";

const yenFormatter = new Intl.NumberFormat("ja-JP");

export function snapBudgetValue(value: number): number {
  const clamped = Math.min(
    BUDGET_SLIDER_OPEN_MAX,
    Math.max(BUDGET_SLIDER_MIN, value),
  );

  let closest = BUDGET_SNAP_POINTS[0];
  let minDistance = Math.abs(clamped - closest);

  for (const point of BUDGET_SNAP_POINTS) {
    const distance = Math.abs(clamped - point);
    if (distance < minDistance) {
      minDistance = distance;
      closest = point;
    }
  }

  return closest;
}

export function getSnapPointIndex(value: number): number {
  const snapped = snapBudgetValue(value);
  const index = BUDGET_SNAP_POINTS.indexOf(snapped);
  return index >= 0 ? index : 0;
}

export function stepSnapPoint(value: number, direction: -1 | 1): number {
  const index = getSnapPointIndex(value);
  const nextIndex = Math.max(
    0,
    Math.min(BUDGET_SNAP_POINTS.length - 1, index + direction),
  );
  return BUDGET_SNAP_POINTS[nextIndex];
}

const SNAP_DIVISION_COUNT = BUDGET_SNAP_POINTS.length - 1;

/** 予算帯ごとに均等幅でスライダー上の位置（%）へ変換 */
export function valueToEqualWidthPercent(value: number): number {
  const clamped = Math.min(
    BUDGET_SLIDER_OPEN_MAX,
    Math.max(BUDGET_SLIDER_MIN, value),
  );

  for (let index = 0; index < SNAP_DIVISION_COUNT; index += 1) {
    const low = BUDGET_SNAP_POINTS[index];
    const high = BUDGET_SNAP_POINTS[index + 1];
    if (clamped <= high || index === SNAP_DIVISION_COUNT - 1) {
      const span = high - low;
      const fraction = span > 0 ? Math.min(1, (clamped - low) / span) : 0;
      return ((index + fraction) / SNAP_DIVISION_COUNT) * 100;
    }
  }

  return 100;
}

/** 均等幅スライダー上の位置（%）を予算値へ変換 */
export function equalWidthPercentToBudgetValue(percent: number): number {
  const clamped = Math.min(100, Math.max(0, percent));
  const rawIndex = (clamped / 100) * SNAP_DIVISION_COUNT;
  const lowIndex = Math.min(
    SNAP_DIVISION_COUNT - 1,
    Math.floor(rawIndex),
  );
  const highIndex = Math.min(SNAP_DIVISION_COUNT, Math.ceil(rawIndex));
  const fraction = rawIndex - lowIndex;
  const low = BUDGET_SNAP_POINTS[lowIndex];
  const high = BUDGET_SNAP_POINTS[highIndex];
  return low + (high - low) * fraction;
}

export function isBudgetRangeActive(min: number, max: number): boolean {
  return min !== DEFAULT_BUDGET_MIN || max !== DEFAULT_BUDGET_MAX;
}

/** 予算レンジと重なる Hotpepper 予算帯コード一覧 */
export function resolveOverlappingBudgetCodes(
  min: number,
  max: number,
): string[] {
  if (!isBudgetRangeActive(min, max)) {
    return [];
  }

  const snappedMin = snapBudgetValue(min);
  const snappedMax = snapBudgetValue(max);

  return HOTPEPPER_BUDGET_TIERS.filter((tier) =>
    tierOverlapsBudgetRange(tier, snappedMin, snappedMax),
  ).map((tier) => tier.code);
}

/**
 * 予算検索の取得戦略
 * - single-tier-api: 1帯のみ → API の budget + 通常ページング（高速・完全）
 * - multi-tier-preview: 複数帯 → 各帯の先頭ページだけ合成（少数リクエスト・概算）
 */
export type BudgetFetchStrategy =
  | "none"
  | "single-tier-api"
  | "multi-tier-preview";

export function resolveBudgetFetchStrategy(
  min: number,
  max: number,
): BudgetFetchStrategy {
  if (!isBudgetRangeActive(min, max)) {
    return "none";
  }

  const codes = resolveOverlappingBudgetCodes(min, max);
  if (codes.length === 0) {
    return "none";
  }
  if (codes.length === 1) {
    return "single-tier-api";
  }
  return "multi-tier-preview";
}

export function resolveSingleBudgetCode(min: number, max: number): string | null {
  const codes = resolveOverlappingBudgetCodes(min, max);
  return codes.length === 1 ? codes[0] : null;
}

export function formatBudgetRangeLabel(min: number, max: number): string {
  if (!isBudgetRangeActive(min, max)) {
    return "指定なし";
  }

  const snappedMin = snapBudgetValue(min);
  const snappedMax = snapBudgetValue(max);
  const hasOpenMin = snappedMin <= BUDGET_SLIDER_MIN;
  const hasOpenMax = snappedMax >= BUDGET_SLIDER_OPEN_MAX;

  if (hasOpenMin && hasOpenMax) {
    return "指定なし";
  }
  if (hasOpenMin) {
    return `〜${yenFormatter.format(snappedMax)}円`;
  }
  if (hasOpenMax) {
    return `${yenFormatter.format(snappedMin)}円〜`;
  }
  return `${yenFormatter.format(snappedMin)}円〜${yenFormatter.format(snappedMax)}円`;
}

export function getShopBudgetRange(shop: Shop): { min: number; max: number } | null {
  return (
    parseDisplayedRange(shop.budgetNightRange) ??
    parseDisplayedRange(shop.budgetDayRange)
  );
}

function getTierEffectiveMax(tier: HotpepperBudgetTier): number {
  return Number.isFinite(tier.max) ? tier.max : BUDGET_SLIDER_OPEN_MAX;
}

function findTierIndexForValue(value: number): number {
  for (let index = 0; index < HOTPEPPER_BUDGET_TIERS.length; index += 1) {
    const tier = HOTPEPPER_BUDGET_TIERS[index];
    const tierMax = getTierEffectiveMax(tier);
    if (value >= tier.min && value <= tierMax) {
      return index;
    }
  }

  const lastTierMin = HOTPEPPER_BUDGET_TIERS.at(-1)?.min ?? 0;
  if (value > lastTierMin) {
    return HOTPEPPER_BUDGET_TIERS.length - 1;
  }

  return -1;
}

function getShopBudgetRepresentativeValue(shop: Shop): number | null {
  const range = getShopBudgetRange(shop);
  if (!range) return null;

  if (range.max >= BUDGET_SLIDER_OPEN_MAX) {
    return range.min;
  }

  return (range.min + range.max) / 2;
}

/** 予算帯ごとの店舗数（予算未設定の店舗は除外） */
export function buildBudgetHistogram(shops: Shop[]): number[] {
  const counts = Array.from({ length: HOTPEPPER_BUDGET_TIERS.length }, () => 0);

  for (const shop of shops) {
    const representative = getShopBudgetRepresentativeValue(shop);
    if (representative === null) continue;

    const tierIndex = findTierIndexForValue(representative);
    if (tierIndex < 0) continue;
    counts[tierIndex] += 1;
  }

  return counts;
}

export function mergeBudgetHistograms(
  base: readonly number[],
  incoming: readonly number[],
): number[] {
  const length = Math.max(base.length, incoming.length);
  return Array.from(
    { length },
    (_, index) => (base[index] ?? 0) + (incoming[index] ?? 0),
  );
}

export function tierOverlapsBudgetRange(
  tier: HotpepperBudgetTier,
  rangeMin: number,
  rangeMax: number,
): boolean {
  const tierMax = getTierEffectiveMax(tier);
  const effectiveRangeMax =
    rangeMax >= BUDGET_SLIDER_OPEN_MAX ? Number.POSITIVE_INFINITY : rangeMax;

  return tier.min <= effectiveRangeMax && tierMax >= rangeMin;
}

function parseDisplayedRange(
  range: string | null,
): { min: number; max: number } | null {
  if (!range) return null;

  const normalized = range.replace(/,/g, "");
  const bounded = normalized.match(/(\d+)[~～](\d+)円/);
  if (bounded) {
    return {
      min: Number(bounded[1]),
      max: Number(bounded[2]),
    };
  }

  const upTo = normalized.match(/～(\d+)円/);
  if (upTo) {
    return { min: 0, max: Number(upTo[1]) };
  }

  return null;
}

function parseBudgetCodeRange(label: string): { min: number; max: number } | null {
  const normalized = label.replace(/,/g, "");
  const bounded = normalized.match(/(\d+)[～〜](\d+)円/);
  if (bounded) {
    return { min: Number(bounded[1]), max: Number(bounded[2]) };
  }

  const upTo = normalized.match(/^[～〜](\d+)円/);
  if (upTo) {
    return { min: 0, max: Number(upTo[1]) };
  }

  const open = normalized.match(/(\d+)円[～〜]/);
  if (open) {
    return { min: Number(open[1]), max: BUDGET_SLIDER_OPEN_MAX };
  }

  return null;
}

/** 旧 URL パラメータ budget=CODE をレンジへ変換 */
export function budgetCodeToRange(
  code: string,
  budgets: SearchOption[],
): { min: number; max: number } | null {
  const tier = HOTPEPPER_BUDGET_TIERS.find((item) => item.code === code);
  if (tier) {
    return {
      min: tier.min,
      max: getTierEffectiveMax(tier),
    };
  }

  const matched = budgets.find((budget) => budget.code === code);
  if (!matched) return null;
  return parseBudgetCodeRange(matched.label);
}

export function parseBudgetRangeParams(
  minRaw: string | null,
  maxRaw: string | null,
): { min: number; max: number } {
  const parseParam = (raw: string | null, fallback: number): number => {
    if (raw === null || raw.trim() === "") return fallback;

    const value = Number(raw);
    return Number.isFinite(value) ? snapBudgetValue(value) : fallback;
  };

  const parsedMin = parseParam(minRaw, DEFAULT_BUDGET_MIN);
  const parsedMax = parseParam(maxRaw, DEFAULT_BUDGET_MAX);

  if (parsedMin > parsedMax) {
    return { min: DEFAULT_BUDGET_MIN, max: DEFAULT_BUDGET_MAX };
  }

  return { min: parsedMin, max: parsedMax };
}

function rangesOverlap(
  shopMin: number,
  shopMax: number,
  filterMin: number,
  filterMax: number,
): boolean {
  const effectiveFilterMax =
    filterMax >= BUDGET_SLIDER_OPEN_MAX ? Number.POSITIVE_INFINITY : filterMax;
  const effectiveShopMax =
    shopMax >= BUDGET_SLIDER_OPEN_MAX ? Number.POSITIVE_INFINITY : shopMax;

  return shopMin <= effectiveFilterMax && effectiveShopMax >= filterMin;
}

export function shopMatchesBudgetRange(
  shop: Shop,
  filterMin: number,
  filterMax: number,
): boolean {
  if (!isBudgetRangeActive(filterMin, filterMax)) {
    return true;
  }

  const snappedMin = snapBudgetValue(filterMin);
  const snappedMax = snapBudgetValue(filterMax);

  if (shop.budgetCode) {
    const tier = HOTPEPPER_BUDGET_TIERS.find(
      (item) => item.code === shop.budgetCode,
    );
    if (tier) {
      return tierOverlapsBudgetRange(tier, snappedMin, snappedMax);
    }
  }

  const shopRange = getShopBudgetRange(shop);
  if (!shopRange) {
    return false;
  }

  return rangesOverlap(
    shopRange.min,
    shopRange.max,
    snappedMin,
    snappedMax,
  );
}

export function filterShopsByBudgetRange(
  shops: Shop[],
  filterMin: number,
  filterMax: number,
): Shop[] {
  if (!isBudgetRangeActive(filterMin, filterMax)) {
    return shops;
  }

  return shops.filter((shop) =>
    shopMatchesBudgetRange(shop, filterMin, filterMax),
  );
}
