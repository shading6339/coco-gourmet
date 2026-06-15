"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

export type MapViewport = {
  center: { lat: number; lng: number };
  zoom: number;
};

/** Leaflet 地図の center/zoom を move/zoom 完了ごとに反応的に取得 */
export function useMapViewport(): MapViewport {
  const map = useMap();
  const [viewport, setViewport] = useState<MapViewport>(() => {
    const c = map.getCenter();
    return { center: { lat: c.lat, lng: c.lng }, zoom: map.getZoom() };
  });

  useEffect(() => {
    const update = (): void => {
      const c = map.getCenter();
      setViewport({ center: { lat: c.lat, lng: c.lng }, zoom: map.getZoom() });
    };
    map.on("moveend", update);
    map.on("zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
    };
  }, [map]);

  return viewport;
}
