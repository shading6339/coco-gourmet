"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { TEXT } from "@/constants/text";
import {
  fetchApproximatePosition,
  getCurrentPosition,
  hasGeolocationPermission,
  type GeoCoords,
  type LocationSource,
} from "@/lib/search/geolocation";

type UseLocationStateOptions = {
  onSetErrorMessage: (message: string | null) => void;
};

type UseLocationStateResult = {
  lat: number | null;
  lng: number | null;
  locationSource: LocationSource | null;
  locationLabel: string | null;
  isResolvingInitialGeo: boolean;
  isLocating: boolean;
  resolveBrowseCoords: () => Promise<GeoCoords | null>;
  resolvePreciseCoords: () => Promise<GeoCoords | null>;
  resetLocating: () => void;
};

export function useLocationState({
  onSetErrorMessage,
}: UseLocationStateOptions): UseLocationStateResult {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationSource, setLocationSource] = useState<LocationSource | null>(
    null,
  );
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [isResolvingInitialGeo, setIsResolvingInitialGeo] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const initialGeoPromiseRef = useRef<Promise<GeoCoords | null> | null>(null);

  useEffect(() => {
    let active = true;

    const loadInitialGeo = async (): Promise<GeoCoords | null> => {
      setIsResolvingInitialGeo(true);

      try {
        const permissionGranted = await hasGeolocationPermission();
        const [approx, precise] = await Promise.all([
          fetchApproximatePosition(),
          permissionGranted ? getCurrentPosition() : Promise.resolve(null),
        ]);

        if (!active) return null;

        if (precise) {
          setLat(precise.lat);
          setLng(precise.lng);
          setLocationSource("precise");
          setLocationLabel(null);
          return precise;
        }

        if (approx) {
          setLat(approx.lat);
          setLng(approx.lng);
          setLocationSource("approximate");
          setLocationLabel(approx.label);
          return { lat: approx.lat, lng: approx.lng };
        }

        return null;
      } finally {
        if (active) {
          setIsResolvingInitialGeo(false);
        }
      }
    };

    initialGeoPromiseRef.current = loadInitialGeo();

    return () => {
      active = false;
    };
  }, []);

  const applyApproximateCoords = useCallback(
    (approx: { lat: number; lng: number; label: string }): GeoCoords => {
      setLat(approx.lat);
      setLng(approx.lng);
      setLocationSource("approximate");
      setLocationLabel(approx.label);
      return { lat: approx.lat, lng: approx.lng };
    },
    [],
  );

  const resolveBrowseCoords = useCallback(async (): Promise<GeoCoords | null> => {
    if (lat !== null && lng !== null) {
      return { lat, lng };
    }

    if (initialGeoPromiseRef.current) {
      const fromInitial = await initialGeoPromiseRef.current;
      if (fromInitial) return fromInitial;
    }

    if (lat !== null && lng !== null) {
      return { lat, lng };
    }

    const approx = await fetchApproximatePosition();
    if (approx) {
      return applyApproximateCoords(approx);
    }

    return null;
  }, [applyApproximateCoords, lat, lng]);

  const resolvePreciseCoords = useCallback(async (): Promise<GeoCoords | null> => {
    if (locationSource === "precise" && lat !== null && lng !== null) {
      return { lat, lng };
    }

    setIsLocating(true);
    const precise = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 0,
    });
    setIsLocating(false);

    if (precise) {
      setLat(precise.lat);
      setLng(precise.lng);
      setLocationSource("precise");
      setLocationLabel(null);
      onSetErrorMessage(null);
      return precise;
    }

    if (lat !== null && lng !== null) {
      onSetErrorMessage(TEXT.location.locationFallbackApproximate);
      return { lat, lng };
    }

    const approx = await fetchApproximatePosition();
    if (!approx) {
      onSetErrorMessage(TEXT.location.locationError);
      return null;
    }

    onSetErrorMessage(TEXT.location.locationFallbackApproximate);
    return applyApproximateCoords(approx);
  }, [
    applyApproximateCoords,
    lat,
    lng,
    locationSource,
    onSetErrorMessage,
  ]);

  const resetLocating = useCallback((): void => {
    setIsLocating(false);
  }, []);

  return {
    lat,
    lng,
    locationSource,
    locationLabel,
    isResolvingInitialGeo,
    isLocating,
    resolveBrowseCoords,
    resolvePreciseCoords,
    resetLocating,
  };
}
