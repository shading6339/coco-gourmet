import { NextRequest, NextResponse } from "next/server";

import {
  getHotpepperApiKey,
  statusFromUpstreamError,
  toPublicUpstreamErrorMessage,
} from "@/lib/hotpepper/client";
import { fetchGourmetSearch } from "@/lib/hotpepper/gourmet-search";
import {
  mapHotpepperShopToShop,
  toShopArray,
} from "@/lib/hotpepper/map-shop";
import {
  optionalParam,
  parseCoord,
  parseGourmetBinaryFilters,
  parsePartyCapacity,
} from "@/lib/hotpepper/parse";
import { HOTPEPPER_MAX_PAGE_SIZE, SHOP_PAGE_SIZE } from "@/constants/pagination";

const ALLOWED_RANGE = new Set(["1", "2", "3", "4", "5"]);
const ALLOWED_ORDER = new Set(["1", "2", "3", "4"]);

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get("lat");
  const lngRaw = searchParams.get("lng");
  const range = searchParams.get("range");
  const startRaw = searchParams.get("start");
  const countRaw = searchParams.get("count");
  const keyword = optionalParam(searchParams.get("keyword"));
  const genre = optionalParam(searchParams.get("genre"));
  const budget = optionalParam(searchParams.get("budget"));
  const special = optionalParam(searchParams.get("special"));
  const partyCapacityRaw = searchParams.get("party_capacity");
  const order = optionalParam(searchParams.get("order")) ?? "4";

  if (!latRaw || !lngRaw || !range || !startRaw) {
    return NextResponse.json(
      { message: "lat, lng, range, start は必須です。" },
      { status: 400 },
    );
  }

  const lat = parseCoord(latRaw, "lat");
  const lng = parseCoord(lngRaw, "lng");
  if (lat === null || lng === null) {
    return NextResponse.json(
      { message: "lat, lng は有効な座標で指定してください。" },
      { status: 400 },
    );
  }

  if (!ALLOWED_RANGE.has(range)) {
    return NextResponse.json(
      { message: "range は 1-5 を指定してください。" },
      { status: 400 },
    );
  }

  if (!ALLOWED_ORDER.has(order)) {
    return NextResponse.json(
      { message: "order は 1-4 を指定してください。" },
      { status: 400 },
    );
  }

  const start = Number(startRaw);
  if (!Number.isInteger(start) || start < 1) {
    return NextResponse.json(
      { message: "start は 1 以上の整数で指定してください。" },
      { status: 400 },
    );
  }

  const count = countRaw ? Number(countRaw) : SHOP_PAGE_SIZE;
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > HOTPEPPER_MAX_PAGE_SIZE
  ) {
    return NextResponse.json(
      {
        message: `count は 1-${HOTPEPPER_MAX_PAGE_SIZE} の整数で指定してください。`,
      },
      { status: 400 },
    );
  }

  const apiKey = getHotpepperApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { message: "APIキーが設定されていません。" },
      { status: 500 },
    );
  }

  const partyCapacity = parsePartyCapacity(partyCapacityRaw);
  if (partyCapacityRaw && partyCapacity === null) {
    return NextResponse.json(
      { message: "party_capacity は 1-9999 の整数で指定してください。" },
      { status: 400 },
    );
  }

  const binaryFilters = parseGourmetBinaryFilters(searchParams);

  try {
    const data = await fetchGourmetSearch({
      lat,
      lng,
      range,
      start,
      count,
      order,
      keyword: keyword ?? undefined,
      genre: genre ?? undefined,
      budget: budget ?? undefined,
      special: special ?? undefined,
      partyCapacity: partyCapacity ?? undefined,
      binaryFilters:
        Object.keys(binaryFilters).length > 0 ? binaryFilters : undefined,
    });

    if (data.results.error) {
      console.error("[api/search] upstream error", data.results.error);
      return NextResponse.json(
        { message: toPublicUpstreamErrorMessage(data.results.error.code) },
        { status: statusFromUpstreamError(data.results.error.code) },
      );
    }

    const shops = toShopArray(data.results.shop).map((shop) =>
      mapHotpepperShopToShop(shop, lat, lng),
    );

    return NextResponse.json({
      total: data.results.results_available,
      start: data.results.results_start,
      returned: Number(data.results.results_returned),
      shops,
    });
  } catch (error: unknown) {
    console.error("[api/search] fetch failed", error);
    return NextResponse.json(
      {
        message:
          "一時的に検索できません。時間をおいて再試行してください。",
      },
      { status: 500 },
    );
  }
}
