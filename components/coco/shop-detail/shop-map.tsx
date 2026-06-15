import type { JSX } from "react";
import { MapPin } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { MAP_ATTRIBUTION, MAP_HEIGHT, MAP_WIDTH, MAP_ZOOM } from "@/constants/map";
import { buildCartoTileUrl, buildTileGrid } from "@/lib/map/tile-coordinates";

type ShopMapProps = {
  lat: number;
  lng: number;
  alt: string;
  className?: string;
};

/** 表示専用の地図（API キー不要・操作不可） */
export function ShopMap({ lat, lng, alt, className }: ShopMapProps): JSX.Element {
  const { tiles, width, height, offsetX, offsetY } = buildTileGrid(
    lat,
    lng,
    MAP_ZOOM,
    MAP_WIDTH,
    MAP_HEIGHT,
  );

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-surface-muted",
        className,
      )}
      role="img"
      aria-label={alt}
    >
      <div
        className="pointer-events-none absolute"
        style={{ width, height, left: offsetX, top: offsetY }}
      >
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element -- タイル URL は動的
          <img
            key={`${tile.x}-${tile.y}`}
            src={buildCartoTileUrl(tile.x, tile.y, MAP_ZOOM)}
            alt=""
            aria-hidden
            className="absolute"
            style={{ left: tile.left, top: tile.top, width: 256, height: 256 }}
            loading="eager"
            decoding="async"
          />
        ))}
      </div>

      <span
        className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-full text-primary drop-shadow-sm"
        aria-hidden
      >
        <MapPin className="size-7 fill-primary stroke-background" strokeWidth={1.5} />
      </span>

      <Typography
        as="p"
        variant="muted"
        className="pointer-events-none absolute right-1.5 bottom-1 rounded-sm bg-background/75 px-1 py-0.5 text-[10px] leading-none"
      >
        {MAP_ATTRIBUTION}
      </Typography>
    </div>
  );
}
