/** 一覧・詳細で返すタグの上限（Hot Pepper の設備フィールドから抽出） */
export const SHOP_TAG_MAX = 8;

/** API の「あり」系テキストから一覧用タグを抽出 */
const TAG_RULES: ReadonlyArray<{ field: string; label: string }> = [
  { field: "private_room", label: "個室" },
  { field: "free_drink", label: "飲み放題" },
  { field: "free_food", label: "食べ放題" },
  { field: "lunch", label: "ランチ" },
  { field: "non_smoking", label: "禁煙" },
  { field: "card", label: "カード可" },
  { field: "parking", label: "駐車場" },
  { field: "wifi", label: "WiFi" },
  { field: "horigotatsu", label: "掘りごたつ" },
  { field: "tatami", label: "座敷" },
  { field: "child", label: "お子様連れOK" },
  { field: "pet", label: "ペット可" },
];

const NEGATIVE_PATTERN = /なし|不可|していない|未確認/;

function isPositiveFeature(value: string): boolean {
  if (NEGATIVE_PATTERN.test(value)) return false;
  return /あり|可|歓迎|利用可|営業/.test(value);
}

export function extractShopTags(
  shop: Record<string, unknown>,
  max = SHOP_TAG_MAX,
): string[] {
  const tags: string[] = [];
  for (const { field, label } of TAG_RULES) {
    const raw = shop[field];
    if (typeof raw === "string" && isPositiveFeature(raw)) {
      tags.push(label);
    }
    if (tags.length >= max) break;
  }
  return tags;
}
