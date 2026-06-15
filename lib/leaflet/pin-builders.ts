import L from "leaflet";

import { formatDistance } from "@/lib/map/distance";
import type { Shop } from "@/types/shop";

/** 現在地（青ドット + ハロー） */
export function buildCurrentLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#2f6fed;border:3px solid #fff;box-shadow:0 0 0 4px rgb(47 111 237 / 25%);"></span>`,
  });
}

/** 引き（広域）: 点ピン */
export function buildDotIcon(isSelected: boolean): L.DivIcon {
  const size = isSelected ? 22 : 14;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:var(--primary);border:2px solid #fff;box-shadow:0 1px 6px rgb(0 0 0 / 35%);"></span>`,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 寄り（拡大）: 画像サムネ + 店名 + 距離のリッチピン */
export function buildRichPinIcon(shop: Shop, isSelected: boolean): L.DivIcon {
  const distance =
    shop.distanceMeters !== null ? formatDistance(shop.distanceMeters) : "";
  const name = escapeHtml(shop.name);
  const ring = isSelected ? "2px solid var(--primary)" : "1px solid #fff";
  const width = 132;

  const thumb = shop.imageUrl
    ? `<img src="${escapeHtml(shop.imageUrl)}" alt="" style="width:36px;height:36px;border-radius:8px;object-fit:cover;flex-shrink:0;" />`
    : `<span style="width:36px;height:36px;border-radius:8px;background:var(--surface-muted);flex-shrink:0;"></span>`;

  return L.divIcon({
    className: "",
    iconSize: [width, 48],
    iconAnchor: [width / 2, 54],
    html: `
      <div style="display:flex;align-items:center;gap:6px;width:${width}px;padding:4px;border-radius:12px;background:var(--glass-bg-float,rgba(255,252,249,0.92));border:${ring};box-shadow:0 4px 16px rgb(0 0 0 / 18%);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);">
        ${thumb}
        <div style="min-width:0;display:flex;flex-direction:column;gap:1px;">
          <span style="font-size:11px;font-weight:700;line-height:1.2;color:#1d1b17;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${name}</span>
          ${distance ? `<span style="font-size:10px;color:#594139;font-variant-numeric:tabular-nums;">${distance}</span>` : ""}
        </div>
      </div>`,
  });
}
