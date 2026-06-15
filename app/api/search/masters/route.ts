import { NextResponse } from "next/server";

import { getHotpepperApiKey } from "@/lib/hotpepper/client";
import {
  fetchSearchMasters,
  type SearchMastersData,
} from "@/lib/hotpepper/masters";

export async function GET(): Promise<
  NextResponse<SearchMastersData | { message: string }>
> {
  const apiKey = getHotpepperApiKey();
  if (!apiKey) {
    return NextResponse.json(
      { message: "APIキーが設定されていません。" },
      { status: 500 },
    );
  }

  try {
    const masters = await fetchSearchMasters(apiKey);

    return NextResponse.json(masters, {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "検索条件マスターの取得に失敗しました。" },
      { status: 502 },
    );
  }
}
