"use client";

import { useMemo } from "react";

import {
  buildBudgetHistogram,
  mergeBudgetHistograms,
} from "@/lib/search/budget-range";
import type { Shop } from "@/types/shop";

/** 店舗配列から予算帯ヒストグラムを算出（クライアント側プレビュー用） */
export function useBudgetHistogram(shops: readonly Shop[]): number[] {
  return useMemo(() => buildBudgetHistogram([...shops]), [shops]);
}

/** 複数ページ分のヒストグラムをマージ */
export function useMergedBudgetHistogram(
  base: readonly number[],
  incoming: readonly number[],
): number[] {
  return useMemo(
    () => mergeBudgetHistograms(base, incoming),
    [base, incoming],
  );
}
