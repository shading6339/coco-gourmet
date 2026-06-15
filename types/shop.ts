export type Shop = {
  id: string;
  name: string;
  address: string;
  open: string;
  /** 定休日（API close フィールド原文） */
  close: string;
  access: string;
  /** 一覧サムネ用 */
  imageUrl: string;
  /** 詳細ヒーロー用（未設定時は imageUrl） */
  heroImageUrl?: string;
  genreCode: string;
  genreName: string;
  budgetCode: string;
  /** 店舗キャッチ（Hot Pepper catch） */
  description: string;
  /** 地図表示用（世界測地系） */
  lat: number | null;
  lng: number | null;
  /** API 原文（詳細の補足用） */
  budgetLabel: string;
  /** 昼・500円刻み（例: 500~1,000円） */
  budgetDayRange: string | null;
  /** 夜・500円刻み */
  budgetNightRange: string | null;
  /** 現在地からの距離（メートル）。座標が無い場合は null */
  distanceMeters: number | null;
  /** ホットペッパー店舗ページ URL（urls.pc）。無い場合は空文字 */
  hotpepperUrl: string;
  tags: string[];
};
