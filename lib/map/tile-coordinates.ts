const TILE_SIZE = 256;

function latLngToWorld(lat: number, lng: number, zoom: number): { x: number; y: number } {
  const scale = 2 ** zoom;
  const x = ((lng + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * scale;
  return { x, y };
}

type TileDescriptor = {
  x: number;
  y: number;
  left: number;
  top: number;
};

/** 中心座標を画面中央に置くタイル一覧 */
export function buildTileGrid(
  lat: number,
  lng: number,
  zoom: number,
  width: number,
  height: number,
  radius = 2,
): { tiles: TileDescriptor[]; width: number; height: number; offsetX: number; offsetY: number } {
  const { x: worldX, y: worldY } = latLngToWorld(lat, lng, zoom);
  const centerTileX = Math.floor(worldX);
  const centerTileY = Math.floor(worldY);
  const fractionX = worldX - centerTileX;
  const fractionY = worldY - centerTileY;

  const gridWidth = (radius * 2 + 1) * TILE_SIZE;
  const gridHeight = (radius * 2 + 1) * TILE_SIZE;
  const offsetX = width / 2 - (radius + fractionX) * TILE_SIZE;
  const offsetY = height / 2 - (radius + fractionY) * TILE_SIZE;

  const tiles: TileDescriptor[] = [];
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      tiles.push({
        x: centerTileX + dx,
        y: centerTileY + dy,
        left: (dx + radius) * TILE_SIZE,
        top: (dy + radius) * TILE_SIZE,
      });
    }
  }

  return { tiles, width: gridWidth, height: gridHeight, offsetX, offsetY };
}

export function buildCartoTileUrl(x: number, y: number, zoom: number): string {
  const subdomain = "abcd"[Math.abs(x + y) % 4];
  return `https://${subdomain}.basemaps.cartocdn.com/light_all/${zoom}/${x}/${y}.png`;
}
