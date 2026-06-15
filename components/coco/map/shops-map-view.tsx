"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { Search, SlidersHorizontal } from "lucide-react";

import { RestaurantCard } from "@/components/coco/shop-list/restaurant-card";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import {
  MAP_ATTRIBUTION,
  MAP_SEARCH_INITIAL_ZOOM,
  ZOOM_FOR_RICH_PINS,
} from "@/constants/map";
import { TEXT } from "@/constants/text";
import { useMapViewport } from "@/hooks/use-map-viewport";
import {
  buildCurrentLocationIcon,
  buildDotIcon,
  buildRichPinIcon,
} from "@/lib/leaflet/pin-builders";
import type { GeoCoords } from "@/lib/search/geolocation";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types/shop";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

const SEARCH_AREA_MOVE_THRESHOLD_M = 120;

function distanceMeters(a: GeoCoords, b: GeoCoords): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

type MapControlsProps = {
  searchOrigin: GeoCoords;
  isSearching: boolean;
  onSearchArea: (center: GeoCoords, zoom: number) => void;
};

/** 地図移動を監視し「このエリアを検索」ボタンの出現を制御（MapContainer 子で useMap を使う） */
function MapControls({
  searchOrigin,
  isSearching,
  onSearchArea,
}: MapControlsProps): JSX.Element | null {
  const viewport = useMapViewport();
  const movedFar =
    distanceMeters(searchOrigin, viewport.center) >
    SEARCH_AREA_MOVE_THRESHOLD_M;

  if (!movedFar && !isSearching) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[4.75rem] z-[1000] flex justify-center">
      <LiquidGlassButton
        variant="primary"
        className="pointer-events-auto h-10 gap-1.5 px-4 shadow-lg"
        disabled={isSearching}
        onClick={() => {
          onSearchArea(viewport.center, viewport.zoom);
        }}
      >
        <Search className="size-4" aria-hidden />
        {isSearching ? TEXT.common.mapSearching : TEXT.common.mapSearchThisArea}
      </LiquidGlassButton>
    </div>
  );
}

type MapMarkersProps = {
  coords: GeoCoords;
  shops: Shop[];
  selectedShopId: string | null;
  onSelectMarker: (shopId: string) => void;
};

function MapMarkers({
  coords,
  shops,
  selectedShopId,
  onSelectMarker,
}: MapMarkersProps): JSX.Element {
  const { zoom } = useMapViewport();
  const isRich = zoom >= ZOOM_FOR_RICH_PINS;

  return (
    <>
      <Marker
        position={[coords.lat, coords.lng]}
        icon={buildCurrentLocationIcon()}
        interactive={false}
      />
      {shops.map((shop) => {
        const selected = shop.id === selectedShopId;
        return (
          <Marker
            key={shop.id}
            position={[shop.lat!, shop.lng!]}
            icon={
              isRich
                ? buildRichPinIcon(shop, selected)
                : buildDotIcon(selected)
            }
            zIndexOffset={selected ? 1000 : 0}
            eventHandlers={{
              click: () => {
                onSelectMarker(shop.id);
              },
            }}
          />
        );
      })}
    </>
  );
}

type ShopsMapViewProps = {
  coords: GeoCoords | null;
  /** 直近の検索原点（現在地 or 前回エリア検索の中心）。ボタン出現判定に使う */
  searchOrigin: GeoCoords | null;
  shops: Shop[];
  keyword: string;
  isSearching: boolean;
  isLocating: boolean;
  onSelectShop: (shop: Shop) => void;
  onSearchHere: () => void;
  onSearchArea: (center: GeoCoords, zoom: number) => void;
  onKeywordSubmit: (keyword: string) => void;
  onOpenFilters: () => void;
  className?: string;
};

/** 地図タブ = 独立した検索ページ。エリア検索・キーワード・ズーム連動ピン */
export function ShopsMapView({
  coords,
  searchOrigin,
  shops,
  keyword,
  isSearching,
  isLocating,
  onSelectShop,
  onSearchHere,
  onSearchArea,
  onKeywordSubmit,
  onOpenFilters,
  className,
}: ShopsMapViewProps): JSX.Element {
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState(keyword);
  const inputDirtyRef = useRef(false);

  // 外部の keyword 変更を取り込む（自分の入力中は上書きしない）
  useEffect(() => {
    if (!inputDirtyRef.current) setKeywordInput(keyword);
  }, [keyword]);

  const mappableShops = useMemo(
    () => shops.filter((shop) => shop.lat !== null && shop.lng !== null),
    [shops],
  );

  const selectedShop =
    mappableShops.find((shop) => shop.id === selectedShopId) ?? null;

  useEffect(() => {
    setSelectedShopId(null);
  }, [shops]);

  if (coords === null) {
    return (
      <div
        className={cn(
          "flex h-full flex-col items-center justify-center gap-3 px-6 text-center",
          className,
        )}
      >
        <p className="text-base font-semibold text-foreground">
          {TEXT.location.locationMissingList}
        </p>
        <LiquidGlassButton
          variant="primary"
          className="mt-2 h-12 gap-2 px-6"
          disabled={isLocating}
          onClick={onSearchHere}
        >
          <Search className="size-5" aria-hidden />
          {isLocating
            ? TEXT.location.locationLoading
            : TEXT.hero.searchFromHereButton}
        </LiquidGlassButton>
      </div>
    );
  }

  const origin = searchOrigin ?? coords;

  return (
    <div className={cn("relative h-full w-full", className)}>
      <MapContainer
        center={[coords.lat, coords.lng]}
        zoom={MAP_SEARCH_INITIAL_ZOOM}
        zoomControl={false}
        attributionControl
        className="h-full w-full"
      >
        <TileLayer
          url={TILE_URL}
          attribution={MAP_ATTRIBUTION}
          subdomains="abcd"
        />
        <MapMarkers
          coords={coords}
          shops={mappableShops}
          selectedShopId={selectedShopId}
          onSelectMarker={setSelectedShopId}
        />
        <MapControls
          searchOrigin={origin}
          isSearching={isSearching}
          onSearchArea={onSearchArea}
        />
      </MapContainer>

      {/* 上部フローティング・キーワード検索 */}
      <div className="pointer-events-none absolute inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[900] px-4">
        <form
          className="glass-float pointer-events-auto mx-auto flex h-12 max-w-[24rem] items-center gap-2 rounded-full px-2 pl-4"
          onSubmit={(event) => {
            event.preventDefault();
            inputDirtyRef.current = false;
            onKeywordSubmit(keywordInput.trim());
          }}
        >
          <Search
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={keywordInput}
            onChange={(event) => {
              inputDirtyRef.current = true;
              setKeywordInput(event.target.value);
            }}
            placeholder={TEXT.common.mapKeywordPlaceholder}
            enterKeyHint="search"
            aria-label={TEXT.common.mapKeywordPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onOpenFilters}
            aria-label={TEXT.search.openFilterPanelLabel}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface/70 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <SlidersHorizontal className="size-5" aria-hidden />
          </button>
        </form>
      </div>

      {/* ピン選択時のミニカード（右下トグルと重ならないよう左寄せ） */}
      {selectedShop ? (
        <div className="absolute inset-x-3 bottom-3 right-16 z-[1000]">
          <div className="glass-float rounded-[var(--radius-float)] p-2">
            <RestaurantCard
              shop={selectedShop}
              onShowDetail={() => {
                onSelectShop(selectedShop);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
