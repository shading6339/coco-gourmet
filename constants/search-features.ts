import type { GourmetBinaryFilterKey } from "@/lib/hotpepper/gourmet-search";

export type SearchFeatureItem = {
  key: GourmetBinaryFilterKey;
  label: string;
};

export type SearchFeatureGroup = {
  key: string;
  label: string;
  features: readonly SearchFeatureItem[];
};

/**
 * グルメサーチ API の 0/1 設備フィルタ（UI 表示用）
 * lunch は lunchFilter（あり/なし）で別制御するため除外
 */
export const SEARCH_FEATURE_GROUPS: readonly SearchFeatureGroup[] = [
  {
    key: "course",
    label: "コース・放題",
    features: [
      { key: "course", label: "コースあり" },
      { key: "free_drink", label: "飲み放題" },
      { key: "free_food", label: "食べ放題" },
    ],
  },
  {
    key: "space",
    label: "空間・席",
    features: [
      { key: "private_room", label: "個室" },
      { key: "horigotatsu", label: "掘りごたつ" },
      { key: "tatami", label: "座敷" },
      { key: "non_smoking", label: "禁煙席" },
      { key: "open_air", label: "オープンエア" },
      { key: "charter", label: "貸切可" },
    ],
  },
  {
    key: "drink",
    label: "ドリンク",
    features: [
      { key: "cocktail", label: "カクテル充実" },
      { key: "shochu", label: "焼酎充実" },
      { key: "sake", label: "日本酒充実" },
      { key: "wine", label: "ワイン充実" },
      { key: "sommelier", label: "ソムリエ" },
    ],
  },
  {
    key: "facility",
    label: "設備・サービス",
    features: [
      { key: "wifi", label: "WiFi" },
      { key: "card", label: "カード可" },
      { key: "parking", label: "駐車場" },
      { key: "barrier_free", label: "バリアフリー" },
      { key: "english", label: "英語メニュー" },
      { key: "pet", label: "ペット可" },
      { key: "child", label: "お子様連れOK" },
      { key: "tv", label: "TV・プロジェクター" },
      { key: "karaoke", label: "カラオケ" },
      { key: "band", label: "バンド演奏可" },
      { key: "show", label: "ライブ・ショー" },
      { key: "equipment", label: "エンタメ設備" },
    ],
  },
  {
    key: "scene",
    label: "シーン・時間帯",
    features: [
      { key: "wedding", label: "二次会・ウェディング" },
      { key: "night_view", label: "夜景" },
      { key: "midnight", label: "23時以降営業" },
      { key: "midnight_meal", label: "23時以降食事OK" },
      { key: "ktai", label: "携帯OK" },
    ],
  },
] as const;

export const UI_FEATURE_FILTER_KEYS: readonly GourmetBinaryFilterKey[] =
  SEARCH_FEATURE_GROUPS.flatMap((group) =>
    group.features.map((feature) => feature.key),
  );

export function getFeatureLabel(key: GourmetBinaryFilterKey): string {
  for (const group of SEARCH_FEATURE_GROUPS) {
    const match = group.features.find((feature) => feature.key === key);
    if (match) return match.label;
  }
  return key;
}
