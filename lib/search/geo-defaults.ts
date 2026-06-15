export type GeoCoords = {
  lat: number;
  lng: number;
};

export type LocationSource = "approximate" | "precise";

/** IP 推定で市区町村名が取れないときのラベル */
export const APPROXIMATE_FALLBACK_LABEL = "このあたり";

export type ApproximateGeo = GeoCoords & {
  label: string;
  origin: "ip";
};
