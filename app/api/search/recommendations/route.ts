import { NextRequest, NextResponse } from "next/server";

import { getHotpepperApiKey } from "@/lib/hotpepper/client";
import { fetchGourmetSearch } from "@/lib/hotpepper/gourmet-search";
import {
  mapHotpepperShopToShop,
  toShopArray,
} from "@/lib/hotpepper/map-shop";
import { parseCoord } from "@/lib/hotpepper/parse";
import type { RecommendationSection } from "@/types/recommendation";

const SHOP_COUNT = 7;
const MIN_SECTION_TOTAL = 4;
const ALLOWED_RANGE = new Set(["1", "2", "3", "4", "5"]);

const SPECIAL_GROUPS = [
  {
    key: "party",
    specials: [
      { code: "LT0080", title: "1000円台の飲み放題付コース" },
      { code: "LT0086", title: "2000円台の飲み放題付コース" },
      { code: "LT0087", title: "3000円台の飲み放題付コース" },
      { code: "LT0088", title: "4000円台の飲み放題付コース" },
      { code: "LT0089", title: "食べ放題プランのあるお店" },
      { code: "LT0090", title: "コースじゃなくても飲み放題OKなお店" },
    ],
  },
  {
    key: "mood",
    specials: [
      { code: "LU0006", title: "落ち着ける雰囲気自慢のお店" },
      { code: "LU0012", title: "大人たちの隠れ家" },
      { code: "LU0013", title: "内装がオシャレなお店" },
      { code: "LZ0045", title: "完全個室のお店" },
    ],
  },
  {
    key: "night",
    specials: [
      { code: "LU0024", title: "深夜までやっているお店" },
      { code: "LU0009", title: "おしゃべりする夜カフェ夜ごはん" },
      { code: "LU0010", title: "仕事帰りにサク飲み・サク飯" },
      { code: "LZ0028", title: "ハッピーアワーでオトクに楽しむ" },
      { code: "LZ0047", title: "昼飲みできるお店" },
    ],
  },
  {
    key: "drink",
    specials: [
      { code: "LY0081", title: "こだわりのビールが飲めるお店" },
      { code: "LU0011", title: "雰囲気がいいBAR" },
      { code: "LU0018", title: "焼酎、日本酒の種類が豊富なお店" },
      { code: "LY0094", title: "ワイン・シャンパンの品ぞろえが自慢のお店" },
      { code: "LZ0002", title: "おいしく飲んで食べられるバル・ビストロ" },
    ],
  },
  {
    key: "date",
    specials: [
      { code: "LU0029", title: "デートで使いたいお店" },
      { code: "LU0033", title: "2人だけの空間があるお店" },
      { code: "LU0030", title: "カップルシート＆2人個室" },
      { code: "LU0031", title: "夜景を楽しむデート" },
      { code: "LU0034", title: "大人のゆったりデート" },
    ],
  },
  {
    key: "casual",
    specials: [
      { code: "LU0017", title: "食事メインで楽しめるお店" },
      { code: "LU0022", title: "女子の行きつけのお店" },
      { code: "LY0093", title: "お子様連れ歓迎のお店" },
      { code: "LY0084", title: "家族で行きたいお店" },
      { code: "LZ0044", title: "おひとり様歓迎のお店" },
    ],
  },
  {
    key: "special-day",
    specials: [
      { code: "LU0019", title: "誕生日・記念日サービスあり" },
      { code: "LU0040", title: "今宵は贅沢グルメ" },
      { code: "LU0065", title: "NEWOPEN・リニューアルOPEN・新登場のお店" },
      { code: "LZ0027", title: "SNSでシェアしたいお店" },
    ],
  },
  {
    key: "food",
    specials: [
      { code: "LU0053", title: "郷土料理・ご当地メニュー！" },
      { code: "LY0090", title: "話題のB級グルメを味わう" },
      { code: "LU0054", title: "おいしいお肉が食べたい！" },
      { code: "LU0055", title: "地鶏・焼き鳥・焼きとんを食べたい！" },
      { code: "LU0056", title: "魚・海鮮類がおいしいお店" },
      { code: "LY0091", title: "体にやさしい野菜が食べたい！" },
      { code: "LU0058", title: "一度は食べたい看板メニュー" },
      { code: "LZ0029", title: "こだわりの絶品ラーメンのあるお店" },
      { code: "LZ0032", title: "辛いものが食べたい！" },
      { code: "LZ0046", title: "チーズが食べたい" },
    ],
  },
  {
    key: "cafe-lunch",
    specials: [
      { code: "LY0083", title: "デザート・スイーツ・デザートバイキングがあるお店" },
      { code: "LY0088", title: "ランチのお店" },
      { code: "LY0065", title: "オープンテラス・テラス席でくつろげるお店" },
    ],
  },
] as const;

type Special = (typeof SPECIAL_GROUPS)[number]["specials"][number];

type RecommendationResponse = {
  sections: RecommendationSection[];
};

async function fetchShopsBySpecial(
  special: Special,
  coords: { lat: number; lng: number; range: string },
): Promise<RecommendationSection | null> {
  try {
    const data = await fetchGourmetSearch({
      lat: coords.lat,
      lng: coords.lng,
      range: coords.range,
      start: 1,
      count: SHOP_COUNT,
      order: "4",
      special: special.code,
    });

    if (data.results.error) {
      return null;
    }

    if ((data.results.results_available ?? 0) < MIN_SECTION_TOTAL) {
      return null;
    }

    const shops = toShopArray(data.results.shop).map((shop) =>
      mapHotpepperShopToShop(shop, coords.lat, coords.lng),
    );
    if (shops.length === 0) return null;

    return {
      code: special.code,
      title: special.title,
      shops,
    };
  } catch {
    return null;
  }
}

async function resolveGroupSection(
  specials: readonly Special[],
  coords: { lat: number; lng: number; range: string },
): Promise<RecommendationSection | null> {
  for (const special of specials) {
    const section = await fetchShopsBySpecial(special, coords);
    if (section) return section;
  }

  return null;
}

export async function GET(
  request: NextRequest,
): Promise<
  NextResponse<RecommendationResponse | { message: string }>
> {
  const { searchParams } = new URL(request.url);
  const lat = parseCoord(searchParams.get("lat"), "lat");
  const lng = parseCoord(searchParams.get("lng"), "lng");
  const range = searchParams.get("range") ?? "";

  if (lat === null || lng === null || !ALLOWED_RANGE.has(range)) {
    return NextResponse.json(
      { message: "lat, lng, range は有効な値で指定してください。" },
      { status: 400 },
    );
  }

  if (!getHotpepperApiKey()) {
    return NextResponse.json(
      { message: "APIキーが設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const sections = await Promise.all(
      SPECIAL_GROUPS.map((group) =>
        resolveGroupSection(group.specials, {
          lat,
          lng,
          range,
        }),
      ),
    );

    return NextResponse.json({
      sections: sections.filter((section) => section !== null),
    });
  } catch {
    return NextResponse.json(
      { message: "おすすめの取得に失敗しました。" },
      { status: 502 },
    );
  }
}
