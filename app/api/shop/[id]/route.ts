import { NextRequest, NextResponse } from "next/server";

import {
  getHotpepperApiKey,
  statusFromUpstreamError,
} from "@/lib/hotpepper/client";
import { fetchGourmetShopById } from "@/lib/hotpepper/gourmet-search";
import {
  mapHotpepperShopToShop,
  toShopArray,
} from "@/lib/hotpepper/map-shop";
import { parseCoord } from "@/lib/hotpepper/parse";

/** 店舗 ID 単一取得（共有 `?shop=<id>` のコールド復元）。lat/lng は任意（距離計算用） */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "id は必須です。" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  // 距離は任意。座標未取得のコールド起動では null（UIで距離欄を出し分け）
  const lat = parseCoord(searchParams.get("lat"), "lat");
  const lng = parseCoord(searchParams.get("lng"), "lng");

  const apiKey = getHotpepperApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { message: "APIキーが設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const data = await fetchGourmetShopById({ id });

    if (data.results.error) {
      return NextResponse.json(
        {
          message: data.results.error.message,
          code: data.results.error.code,
        },
        { status: statusFromUpstreamError(data.results.error.code) },
      );
    }

    const [hotpepperShop] = toShopArray(data.results.shop);
    if (!hotpepperShop) {
      return NextResponse.json(
        { message: "お店が見つかりませんでした。" },
        { status: 404 },
      );
    }

    // 座標が無い場合は距離 null になるよう原点に shop 自身の座標を渡す
    const originLat = lat ?? Number(hotpepperShop.lat ?? Number.NaN);
    const originLng = lng ?? Number(hotpepperShop.lng ?? Number.NaN);
    const shop = mapHotpepperShopToShop(hotpepperShop, originLat, originLng);

    return NextResponse.json({
      shop: lat === null || lng === null ? { ...shop, distanceMeters: null } : shop,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "店舗取得中にエラーが発生しました。";
    return NextResponse.json({ message }, { status: 500 });
  }
}
