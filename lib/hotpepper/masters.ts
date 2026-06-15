import { fetchHotpepperJson } from "@/lib/hotpepper/client";
import type {
  HotpepperMasterItem,
  HotpepperMasterResponse,
  HotpepperSpecialMasterItem,
} from "@/lib/hotpepper/types";
import type { SearchOption } from "@/lib/search/filter-shops";
import {
  sortBudgetOptions,
  sortGenreOptions,
} from "@/lib/search/sort-search-options";

export type HotpepperMasterKind = "genre" | "budget";

export type SpecialSearchOption = SearchOption & {
  categoryCode: string;
  categoryLabel: string;
};

export type SearchMastersData = {
  genres: SearchOption[];
  budgets: SearchOption[];
  specials: SpecialSearchOption[];
};

function toMasterArray(
  item: HotpepperMasterItem | HotpepperMasterItem[] | undefined,
): HotpepperMasterItem[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function toSpecialArray(
  item: HotpepperSpecialMasterItem | HotpepperSpecialMasterItem[] | undefined,
): HotpepperSpecialMasterItem[] {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

function toOptions(items: HotpepperMasterItem[]): SearchOption[] {
  return items.flatMap((item) =>
    item.code && item.name ? [{ code: item.code, label: item.name }] : [],
  );
}

function toSpecialOptions(
  items: HotpepperSpecialMasterItem[],
): SpecialSearchOption[] {
  return items.flatMap((item) => {
    if (!item.code || !item.name) return [];
    return [
      {
        code: item.code,
        label: item.name,
        categoryCode: item.special_category?.code ?? "",
        categoryLabel: item.special_category?.name ?? "その他",
      },
    ];
  });
}

function sortSpecialOptions(options: SpecialSearchOption[]): SpecialSearchOption[] {
  return [...options].sort((left, right) => {
    const categoryCompare = left.categoryLabel.localeCompare(
      right.categoryLabel,
      "ja",
    );
    if (categoryCompare !== 0) return categoryCompare;
    return left.label.localeCompare(right.label, "ja");
  });
}

export async function fetchHotpepperMaster(
  kind: HotpepperMasterKind,
  apiKey: string,
): Promise<SearchOption[]> {
  const params = new URLSearchParams({
    key: apiKey,
    format: "json",
  });

  const data = await fetchHotpepperJson<HotpepperMasterResponse<typeof kind>>(
    `${kind}/v1`,
    params,
    { next: { revalidate: 60 * 60 * 24 } },
  );

  if (data.results.error) {
    throw new Error(
      data.results.error.message ?? `${kind} master fetch failed`,
    );
  }

  const options = toOptions(toMasterArray(data.results[kind]));
  if (kind === "genre") return sortGenreOptions(options);
  if (kind === "budget") return sortBudgetOptions(options);
  return options;
}

async function fetchSpecialMaster(apiKey: string): Promise<SpecialSearchOption[]> {
  const params = new URLSearchParams({
    key: apiKey,
    format: "json",
  });

  const data = await fetchHotpepperJson<
    HotpepperMasterResponse<"special"> & {
      results: { special?: HotpepperSpecialMasterItem | HotpepperSpecialMasterItem[] };
    }
  >("special/v1", params, { next: { revalidate: 60 * 60 * 24 } });

  if (data.results.error) {
    throw new Error(
      data.results.error.message ?? "special master fetch failed",
    );
  }

  return sortSpecialOptions(toSpecialOptions(toSpecialArray(data.results.special)));
}

export async function fetchSearchMasters(
  apiKey: string,
): Promise<SearchMastersData> {
  const [genres, budgets, specials] = await Promise.all([
    fetchHotpepperMaster("genre", apiKey),
    fetchHotpepperMaster("budget", apiKey),
    fetchSpecialMaster(apiKey),
  ]);

  return { genres, budgets, specials };
}
