import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Sans_JP } from "next/font/google";
import { TEXT } from "@/constants/text";
import "./globals.css";

/** ブランド・キャッチコピー用（単一 TTF で日本語グリフを確実に含める） */
const lubrifont = localFont({
  src: "./fonts/WDXLLubrifontJPN-Regular.ttf",
  weight: "400",
  variable: "--font-brand",
  display: "swap",
  fallback: ["Hiragino Sans", "Yu Gothic", "system-ui", "sans-serif"],
});

/** UI・本文用 */
const ibmPlexSansJp = IBM_Plex_Sans_JP({
  weight: ["400", "500", "600", "700"],
  preload: false,
  variable: "--font-sans",
  display: "swap",
  fallback: ["Hiragino Sans", "Yu Gothic", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: TEXT.common.appTitle,
  description: TEXT.common.appDescription,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${lubrifont.variable} ${ibmPlexSansJp.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
