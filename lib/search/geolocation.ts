import {
  type ApproximateGeo,
  type GeoCoords,
} from "@/lib/search/geo-defaults";

export type { GeoCoords, ApproximateGeo, LocationSource } from "@/lib/search/geo-defaults";

/** 権限なしのおおよその位置（サーバー IP 推定。不可時は null） */
export async function fetchApproximatePosition(): Promise<ApproximateGeo | null> {
  try {
    const response = await fetch("/api/geo/approximate", { method: "GET" });
    if (!response.ok) return null;
    return (await response.json()) as ApproximateGeo;
  } catch {
    return null;
  }
}

/** 位置情報の許可が既に付与されているか（未対応ブラウザでは false） */
export async function hasGeolocationPermission(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.permissions) {
    return false;
  }

  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state === "granted";
  } catch {
    return false;
  }
}

/** 現在地を1回取得（失敗時は null） */
export type GetCurrentPositionOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
};

const DEFAULT_POSITION_OPTIONS: Required<GetCurrentPositionOptions> = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 60_000,
};

export async function getCurrentPosition(
  options: GetCurrentPositionOptions = {},
): Promise<GeoCoords | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return null;
  }

  const positionOptions: PositionOptions = {
    ...DEFAULT_POSITION_OPTIONS,
    ...options,
  };

  const result = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, positionOptions);
  }).catch(() => null);

  if (!result) return null;

  return {
    lat: result.coords.latitude,
    lng: result.coords.longitude,
  };
}
