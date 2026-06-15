import { NextRequest, NextResponse } from "next/server";
import {
  APPROXIMATE_FALLBACK_LABEL,
  type ApproximateGeo,
} from "@/lib/search/geo-defaults";

function parseCoord(value: string | null): number | null {
  if (!value) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function isLocalRequest(request: NextRequest): boolean {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "";

  return ip === "" || ip === "127.0.0.1" || ip === "::1";
}

function readVercelGeo(request: NextRequest): ApproximateGeo | null {
  const lat = parseCoord(request.headers.get("x-vercel-ip-latitude"));
  const lng = parseCoord(request.headers.get("x-vercel-ip-longitude"));
  if (lat === null || lng === null) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  const city = request.headers.get("x-vercel-ip-city")?.trim();
  const label = city ? `${city}周辺` : APPROXIMATE_FALLBACK_LABEL;

  return { lat, lng, label, origin: "ip" };
}

/** 権限なしで使えるおおよその位置（IP 推定のみ。推定不可時は 404） */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApproximateGeo | { message: string }>> {
  if (isLocalRequest(request)) {
    return NextResponse.json(
      { message: "位置を推定できません。" },
      { status: 404 },
    );
  }

  const fromIp = readVercelGeo(request);
  if (!fromIp) {
    return NextResponse.json(
      { message: "位置を推定できません。" },
      { status: 404 },
    );
  }

  return NextResponse.json(fromIp);
}
