# Appetite & Warmth — Design System

> **Version:** 1.1.0 — "Warm Daylight Glass"  
> **Product:** ここぐる（kokoguru）  
> **Stack:** Next.js App Router · Tailwind CSS 4 · shadcn/ui

---

## 目次

1. [Brand & Philosophy](#1-brand--philosophy)
2. [Design Principles](#2-design-principles)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Shape & Radius](#6-shape--radius)
7. [Elevation & Depth](#7-elevation--depth)
8. [Liquid Glass（フローティング UI）](#8-liquid-glassフローティング-ui)
9. [Motion & Interaction](#9-motion--interaction)
10. [Components](#10-components)
11. [Patterns](#11-patterns)
12. [Accessibility](#12-accessibility)
13. [Implementation（Tailwind / CSS）](#13-implementationtailwind--css)
14. [Anti-patterns（やらないこと）](#14-anti-patternsやらないこと)

---

## 1. Brand & Philosophy

### Personality

| 属性 | 説明 |
|------|------|
| **Sensory** | 食べ物の写真・彩度・質感で appetite を刺激する |
| **Inviting** | 圧迫感のない余白と、読みやすいタイポグラフィ |
| **Reliable** | 検索結果が素早く・正確に見える、信頼できる情報設計 |

### One-liner

> **UI は退き、食べ物が主役。温かさは写真と余白で作り、操作 UI だけが軽く浮く。**

### Target User

食の質と検索体験を重視するユーザー。長時間のブラウジングでも疲れない、プレミアムなモバイル検索体験を提供する。

---

## 2. Design Principles

### 2.1 Photo-first

- レストランカードの画像は **edge-to-edge**（カード幅いっぱい、上角のみ radius）
- UI クローム（検索バー・ナビ・フィルタ）は画面面積の **15% 以下**
- 背景色で「暖かさ」を演出しない — **写真の彩度**に任せる

### 2.2 Modern Borderless

- 水平 divider は使わない。ブロック間は **spacing（16–32px）** で分離
- カードは **border なし + 白 surface + 最小 shadow**（または shadow なし + gap のみ）
- 階層は **タイポグラフィ > 余白 > 写真 > 色** の順で作る

### 2.3 Selective Liquid Glass

- 半透明 + blur は **固定・浮遊 UI のみ**（検索バー、ボトムナビ、FAB）
- リスト行・カード・フォーム入力は **不透明**
- `prefers-reduced-transparency` では glass を無効化

### 2.4 Flat Actions, Rich Content

- ボタンは **フラット 1 色**。グラデーション・厚い shadow 禁止
- アクセント色は **Primary（Orange）1 本**を主 CTA に集中
- Secondary（Red）・Tertiary（Amber）は **意味のある場面だけ**（後述）

### 2.5 8pt Rhythm

すべての spacing / padding / margin は **4px の倍数**。基本単位 `base = 4px`。

---

## 3. Color System

### 3.1 Design Tokens

#### Surfaces（3 段階に限定）

| Token | Hex | 用途 |
|-------|-----|------|
| `background` | `#FFFCF9` | ページ背景（95% 無彩 + 5% 暖色） |
| `surface` | `#FFFFFF` | カード・入力・モーダル |
| `surface-muted` | `#F5F0EB` | hover / skeleton / セカンダリ背景 |

> **廃止:** `surface-container-low` 〜 `surface-container-highest` の 7 段 ladder。視差が弱く「のっぺり」になるため使用しない。

#### Text

| Token | Hex | 用途 |
|-------|-----|------|
| `on-background` | `#1D1B17` | 本文・見出し（pure black 禁止） |
| `on-surface-variant` | `#594139` | 補助テキスト・ラベル |
| `outline` | `#8D7168` | アイコン・プレースホルダ |
| `outline-variant` | `#E1BFB5` | 区切り（divider 代替、極力非使用） |

#### Brand — Primary（Vibrant Orange）

| Token | Hex | 用途 |
|-------|-----|------|
| `primary` | `#E8470A` | 主 CTA・リンク・アクティブ状態 |
| `on-primary` | `#FFFFFF` | Primary 上のテキスト |
| `primary-container` | `#FFDBD0` | 選択 chip 背景・soft highlight |
| `on-primary-container` | `#390C00` | Primary container 上のテキスト |

#### Brand — Secondary（Deep Red）※限定使用

| Token | Hex | 用途 |
|-------|-----|------|
| `secondary` | `#BA0627` | お気に入り・保存・強調バッジ **のみ** |
| `on-secondary` | `#FFFFFF` | |
| `secondary-container` | `#FFDAD8` | お気に入り chip 背景 |

> **禁止:** Secondary を通常ボタン・検索 CTA に使わない。

#### Brand — Tertiary（Warm Amber）

| Token | Hex | 用途 |
|-------|-----|------|
| `tertiary` | `#845400` | 評価・星・ランキングバッジ |
| `on-tertiary` | `#FFFFFF` | |
| `tertiary-container` | `#FFEDB6` | 評価 chip 背景 |
| `on-tertiary-container` | `#2A1800` | |

#### Semantic

| Token | Hex | 用途 |
|-------|-----|------|
| `error` | `#BA1A1A` | エラー |
| `on-error` | `#FFFFFF` | |
| `error-container` | `#FFDAD6` | エラーバナー背景 |
| `on-error-container` | `#93000A` | |

#### Glass（Liquid Glass 専用）

| Token | Value | 用途 |
|-------|-------|------|
| `glass-bg` | `rgba(255, 252, 249, 0.72)` | フローティング UI 背景 |
| `glass-bg-fallback` | `#FFFCF9` | blur 非対応 / reduced-transparency |
| `glass-border` | `rgba(255, 255, 255, 0.35)` | glass 要素の上辺・区切り |
| `glass-highlight` | `inset 0 1px 0 rgba(255, 255, 255, 0.6)` | 内側ハイライト |

### 3.2 Color Usage Rules

```
✅ DO
  - 背景: background (#FFFCF9)
  - カード: surface (#FFFFFF)
  - CTA: primary フラット
  - 暖色は写真・アクセント 1 点に集中

❌ DON'T
  - クリーム on クリーム の 7 段 surface
  - Primary → Secondary 縦グラデボタン
  - 暖色 shadow（rgba(171,53,0,0.3) 等）
  - Secondary を第 2 CTA に使う
```

### 3.3 CSS Variables（`:root`）

```css
:root {
  /* Surfaces */
  --background: #fffcf9;
  --foreground: #1d1b17;
  --surface: #ffffff;
  --surface-muted: #f5f0eb;

  /* Primary */
  --primary: #e8470a;
  --primary-foreground: #ffffff;
  --primary-container: #ffdbd0;
  --primary-container-foreground: #390c00;

  /* Secondary — limited */
  --secondary: #ba0627;
  --secondary-foreground: #ffffff;
  --secondary-container: #ffdad8;

  /* Tertiary */
  --tertiary: #845400;
  --tertiary-foreground: #ffffff;
  --tertiary-container: #ffedb6;

  /* Muted text */
  --muted-foreground: #594139;

  /* Borders & inputs */
  --border: #e1bfb5;
  --input: #f5f0eb;
  --ring: #e8470a;

  /* Semantic */
  --destructive: #ba1a1a;
  --destructive-foreground: #ffffff;

  /* Radius base（ボタン・入力 = 8px） */
  --radius: 0.5rem;

  /* Glass */
  --glass-bg: rgb(255 252 249 / 72%);
  --glass-border: rgb(255 255 255 / 35%);
}
```

---

## 4. Typography

### 4.1 Font Families

| Role | Font | CSS 変数 | Fallback |
|------|------|----------|----------|
| **Brand / Display** | WDXL Lubrifont JPN（local TTF） | `--font-brand` | Hiragino Sans, Yu Gothic, system-ui |
| **UI / Body** | IBM Plex Sans JP（Google Fonts） | `--font-sans` | Hiragino Sans, Yu Gothic, system-ui |

> Brand 書体は日本語グリフを確実に含む単一 TTF をローカル配信（`app/fonts/`）。  
> ブランド名・ヒーローコピー・ページスクラブの大数字など「声」の部分だけに `font-brand` を使い、UI 本文は IBM Plex Sans JP で可読性を確保する。

### 4.2 Type Scale

| Token | Font | Size | Weight | Line Height | Letter Spacing | 用途 |
|-------|------|------|--------|-------------|----------------|------|
| `headline-xl` | WDXL Lubrifont JPN | 36px / 2.25rem | 700 | 44px / 1.22 | -0.02em | ランディング・空状態 |
| `headline-lg` | WDXL Lubrifont JPN | 28px / 1.75rem | 700 | 36px / 1.29 | -0.01em | ページタイトル |
| `headline-lg-mobile` | WDXL Lubrifont JPN | 24px / 1.5rem | 700 | 32px / 1.33 | — | モバイルページタイトル |
| `headline-md` | IBM Plex Sans JP | 20px / 1.25rem | 600 | 28px / 1.4 | — | セクション見出し |
| `body-lg` | IBM Plex Sans JP | 18px / 1.125rem | 400 | 28px / 1.56 | — | リード文 |
| `body-md` | IBM Plex Sans JP | 16px / 1rem | 400 | 24px / 1.5 | — | 本文・リスト |
| `label-md` | IBM Plex Sans JP | 14px / 0.875rem | 600 | 20px / 1.43 | 0.01em | ボタン・タブ |
| `label-sm` | IBM Plex Sans JP | 12px / 0.75rem | 500 | 16px / 1.33 | — | キャプション・バッジ |

> **一覧カードの店名**は `label-md` ベースに 15px / 700 を上書きし、メタ行（12px / muted）との階層差を確保する。距離・予算など数値は `tabular-nums` で揃える。

### 4.3 Typography Rules

- 見出し色: 常に `on-background`（`#1D1B17`）。opacity で薄くしない
- 補助テキスト: `on-surface-variant`（`#594139`）。`opacity-60` 以下は禁止
- 長文: `body-md` + line-height 1.5 以上
- モバイル: `headline-lg` → `headline-lg-mobile` にダウンスケール

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

| Token | Value | 用途 |
|-------|-------|------|
| `base` | 4px | 最小単位 |
| `xs` | 8px | インライン gap・chip 内 padding |
| `sm` | 16px | カード内 padding・リスト gap・gutter |
| `md` | 24px | セクション間 |
| `lg` | 32px | 大セクション間 |
| `xl` | 48px | ページ上下 margin |

### 5.2 Layout

| Token | Value | 用途 |
|-------|-------|------|
| `gutter` | 16px | カードリスト横 gap |
| `margin-mobile` | 20px | 画面左右 safe zone（最小） |
| `max-width` | 28rem (448px) | モバイルファースト max container |

### 5.3 Grid Model

- **Mobile-first Fluid Grid**
- 1 カラムリストが基本
- カードリスト: `gap-sm`（16px）+ `margin-mobile`（20px）horizontal padding
- セクション区切り: `space-y-md`（24px）以上。divider 不使用

---

## 6. Shape & Radius

### 6.1 Radius Scale（実装 `@theme` と 1:1）

| Token | Value | 用途 |
|-------|-------|------|
| `sm` | 8px / 0.5rem | バッジ・小 tag |
| `md` | 12px / 0.75rem | カード・glass float 内の操作要素 |
| `lg` | 16px / 1rem | ボタン・入力・プロモバナー |
| `float` | 20px / 1.25rem | glass float 面（pagination tray 等） |
| `xl` | 24px / 1.5rem | ボトムシート・ダイアログ |
| `hero` | 32px / 2rem | ヒーロー下辺・詳細ヒーロー |
| `full` | 9999px | カテゴリ chip・フィルタ pill・写真上チップ |

### 6.2 Radius Hierarchy（同心円ルール）

```
内側 radius = 外側 radius − gap

例: glass float (20px) の中に gap 8px で置く操作要素 → 12px
```

- カード内画像: **上辺のみ** `rounded-t-md`（12px）、下辺は `rounded-none`
- すべて `rounded-xl` に統一しない（マシュマロ化を防ぐ）
- ネストする面は必ず同心円ルールで内側を小さくする（外≦内の逆転禁止）

---

## 7. Elevation & Depth

### 7.1 Shadow / Hairline Tokens

| Token | Value | 用途 |
|-------|-------|------|
| `--hairline` | `rgb(29 27 23 / 6%)` | L1 カードの輪郭（`ring-1 ring-foreground/6`） |
| `--shadow-card` | `0 1px 2px rgb(0 0 0 / 5%)` | L1 カードの rest 状態 |
| `shadow-sm` | `0 1px 3px rgb(0 0 0 / 8%)` | hover・軽い lift |
| `--shadow-float` | `0 4px 16px rgb(0 0 0 / 8%)` | L3 glass float |

> **禁止:** 暖色混合 shadow、`0 4px 12px rgba(171,53,0,0.3)` 等

### 7.2 Depth Strategy — 深度 4 層モデル

| 層 | 面 | 表現 |
|----|----|------|
| **L0** | ページ背景 | `background` + 最上部のみ暖色 radial グラデ（45% 不透明・写真を邪魔しない強度） |
| **L1** | コンテンツカード | 不透明 `surface` + hairline + `--shadow-card`。タップで `scale(0.99)` |
| **L2** | glass chrome | 画面端固定面（AppBar）。`.glass` レシピ |
| **L3** | glass float | 浮遊面（pagination tray・固定フッター・写真上チップ）。`.glass-float` レシピ |

モバイル（hover なし）でも深度が成立するよう、**rest 状態**で層差を表現する。hover/active は補助。

### 7.3 Gradients

| 用途 | 許可 |
|------|------|
| ボタン | ❌ 禁止 |
| Skeleton shimmer | ✅ 暖 grey → cream |
| Hero overlay（写真上） | ✅ `linear-gradient(transparent, rgb(0 0 0 / 40%))` |
| ブランド装飾 | ✅ ページ空状態の背景のみ、5% opacity 以下 |

---

## 8. Liquid Glass（フローティング UI）

### 8.1 適用対象

| コンポーネント | Glass | 理由 |
|----------------|-------|------|
| 固定検索バー | ✅ | スクロールコンテンツの上に浮く |
| ボトムナビ | ✅ | 仕様上の glass chrome |
| カテゴリフィルタバー（sticky） | ✅ | 写真の上を通過 |
| FAB（地図切替等） | ✅ | |
| レストランカード | ❌ | 写真が主役 |
| フォーム入力 | ❌ | 可読性 |
| リスト行 | ❌ | パフォーマンス |

### 8.2 Glass Recipes（2 レシピ制）

**L2 `.glass`（chrome）** — 画面端固定面。下端 hairline + 接地 shadow で「コンテンツとの接面」を定義する:

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-top: 1px solid var(--glass-border);
  border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 60%),
    0 1px 8px rgb(0 0 0 / 4%);
}
```

**L3 `.glass-float`（浮遊面）** — 角丸前提。全周 border + 上反射 + 下接地の 3 本のエッジで「板厚」を表現する:

```css
.glass-float {
  background: var(--glass-bg-float); /* rgb(255 252 249 / 78%) — chrome よりやや不透明 */
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid var(--glass-border);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 60%),  /* 上辺の反射 */
    inset 0 -1px 0 rgb(0 0 0 / 4%),        /* 下辺の接地 */
    var(--shadow-float);
}
```

両レシピとも `@supports not (backdrop-filter)` と `prefers-reduced-transparency` で不透明面（`background` / `surface`）に fallback する（globals.css 参照）。

### 8.3 使い分け

| レシピ | 適用先 | 中身 |
|--------|--------|------|
| `.glass` | AppBar・suspense fallback header | — |
| `.glass-float` | pagination tray・詳細検索フッター・写真上の円形チップ（戻る/お気に入り） | **操作要素は不透明のまま**載せる |

### 8.4 Performance Rules

- 同時に `backdrop-filter` を適用する要素は **最大 3 個**
- スクロールする要素には glass を使わない
- iOS Safari では `will-change: backdrop-filter` を乱用しない

---

## 9. Motion & Interaction

### 9.1 Duration & Easing（CSS 変数 `:root` 定義済み）

| Token | Value | 用途 |
|-------|-------|------|
| `--motion-fast` | 150ms | hover, focus ring, カード押下, スクリム |
| `--motion-base` | 220ms | シート・モーダル・AppBar 展開 |
| `--motion-slow` | 380ms | ページスクラブ展開などの大きい面の変形 |
| `--ease-out-soft` | `cubic-bezier(0.22, 1, 0.36, 1)` | 標準。新規 motion はまずこれ |
| `ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 汎用 fallback |

> CSS は `var(--motion-*)` / `var(--ease-out-soft)` を参照する。motion/react（秒指定）はトークンと同じ数値（0.15 / 0.22 / 0.38）を使い、コメントで対応トークンを明記する。新しい duration / easing 値の発明は禁止。

### 9.2 Interaction Specs

| 要素 | 状態 | 変化 |
|------|------|------|
| Primary Button | `:active` | `scale(0.98)`、shadow なし |
| Card | rest | hairline + `--shadow-card`（L1 の定義） |
| Card | `:hover` / `:active` | hover で `shadow-sm`、active で `scale(0.99)`（translate なし） |
| Chip | selected | `primary-container` 背景、`on-primary-container` 文字 |
| Input | `:focus` | 内側 glow: `box-shadow: inset 0 0 0 2px var(--primary)` |
| Skeleton | loading | warm shimmer 1.5s infinite |

### 9.3 Skeleton Shimmer

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-muted) 25%,
    #faf6f1 50%,
    var(--surface-muted) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## 10. Components

### 10.0 コンポーネント構成（shadcn / Coco）

| レイヤ | パス | 役割 |
|--------|------|------|
| **shadcn/ui** | `components/ui/` | Button・Input・Card など汎用プリミティブ。CLI で追加・更新し、**原則そのまま**（variant / トークンのみ調整） |
| **Coco** | `components/coco/` | 店舗カード・タグ・予算表示など **プロダクト固有** UI。shadcn を組み合わせて DS §10 に沿って実装 |

#### ルール

1. **画面の基本操作 UI**（ボタン、入力、ダイアログ、スケルトン等）は shadcn 準拠の `components/ui` を使う。
2. **ドメイン表現**（レストランカード、距離・予算・設備タグ）は `components/coco` に定義する。
3. `components/ui` に店舗専用コンポーネントを置かない。`components/coco` から `@/components/ui/*` を import する（逆 import 禁止）。
4. shadcn 追加は `pnpm dlx shadcn@latest add <name>`。エイリアス: `ui` → `@/components/ui`、`coco` → `@/components/coco`（`components.json`）。

```tsx
// app/page.tsx — ページは Coco と shadcn を併用
import { Button } from "@/components/ui/button";
import { RestaurantCard } from "@/components/coco/restaurant-card";
```

#### Coco コンポーネント一覧（現状）

| コンポーネント | 概要 |
|----------------|------|
| `RestaurantCard` / `RestaurantDetail` | 一覧・詳細（§10.5 / §11.2） |
| `ShopDetailHero` | 詳細ヒーロー 4:3・下辺のみ radius・戻る／お気に入り |
| `ShopImageSlot` | 一覧サムネ（行高 `object-cover`・左下距離オーバーレイ） |
| `ShopDetailMetaTags` | 詳細メタ chip（ジャンル・料金帯・距離） |
| `ShopLocationCard` / `ShopHoursCard` | 住所＋地図／営業時間アコーディオン |
| `ShopCardMeta` / `ShopMetaLine` / `ShopBudgetDisplay` | 一覧: アクセス・ジャンル・予算 |
| `ShopTag` / `ShopTagList` / `ShopTagListRow` | 設備タグ（§10.4 Chip） |
| `SkeletonCard` | 一覧ローディング |

### 10.1 Button

#### Variants

| Variant | Background | Text | Border | Shadow |
|---------|------------|------|--------|--------|
| **Primary** | `primary` | `on-primary` | none | none |
| **Secondary (ghost)** | `surface-muted` | `foreground` | none | none |
| **Outline** | transparent | `foreground` | `border` | none |
| **Destructive** | `error-container` | `on-error-container` | none | none |
| **Link** | transparent | `primary` | none | underline on hover |

#### Sizes

| Size | Height | Padding X | Radius | Font |
|------|--------|-----------|--------|------|
| `sm` | 32px | 12px | 8px | label-sm |
| `default` | 40px | 16px | 8px | label-md |
| `lg` | 48px | 20px | 8px | label-md |

#### Rules

- グラデーション禁止
- Primary は画面内 **1 個**が理想（複数ある場合は 1 つだけ Primary）
- disabled: `opacity-50` + `pointer-events-none`

```
Primary:   bg-primary text-white rounded-lg h-10 px-4 font-semibold text-sm
Ghost:     bg-surface-muted text-foreground rounded-lg h-10 px-4
```

### 10.2 Input / Select

| Property | Value |
|----------|-------|
| Background | `surface-muted` (#F5F0EB) |
| Border | none（通常時） |
| Radius | 8px |
| Height | 48px |
| Padding | 16px horizontal |
| Placeholder | `outline` (#8D7168) |
| Focus | inset ring 2px `primary` |

```tsx
className="h-12 w-full rounded-lg bg-[var(--input)] px-4 text-sm outline-none focus:shadow-[inset_0_0_0_2px_var(--primary)]"
```

### 10.3 Search Bar（Glass）

固定配置。スクロール時も画面上部に留まる。

```tsx
<header className="glass sticky top-0 z-50 px-5 py-3">
  {/* input */}
</header>
```

- 背景: glass recipe
- 入力欄自体は **不透明** `surface-muted`
- アイコン: `outline`

### 10.4 Category Chip

| State | Style |
|-------|-------|
| Default | `bg-surface-muted text-foreground rounded-full px-3 py-1.5 label-sm` |
| Selected | `bg-primary-container text-on-primary-container rounded-full` |
| With icon | icon 16px + gap 4px |

### 10.5 Restaurant Card

**一覧（現行スパイク）** — 横並びコンパクトカード:

```
┌──────┬──────────────────────┐
│ thumb│ Shop Name (text-sm)  │
│      │ Access / Genre / $   │
│      │ [tags…]              │
└──────┴──────────────────────┘
  bg: surface, rounded-md (12px), p-2 (8px)
  hover: shadow-sm のみ
  カード全体がタップ領域（詳細へ）
```

**詳細** — `ShopDetailHero` + 情報ブロック（§11.2 参照）。

| Property | 一覧 | 詳細ヒーロー |
|----------|------|----------------|
| Background | `surface` | 写真 + `surface-muted` placeholder |
| Image | 左列サムネ・行高追従 | 4:3 full-bleed・`rounded-b-lg` (16px) |
| Gap inside | 8px (`gap-2` / `p-2`) | `space-y-4`〜`space-y-5` |
| CTA | カードタップ | ヒーロー上の戻る（opaque `surface` ボタン） |

### 10.6 Bottom Navigation

| Property | Value |
|----------|-------|
| Position | fixed bottom |
| Style | glass recipe |
| Height | 56px + safe-area-inset-bottom |
| Icon | 24px |
| Active | `primary` color |
| Inactive | `outline` |

### 10.7 Error Banner

```tsx
className="rounded-lg bg-error-container px-4 py-3 text-sm text-on-error-container"
```

- border 不使用（background のみ）

### 10.8 Empty / Loading States

| State | Treatment |
|-------|-----------|
| Loading | skeleton（カード形状を mirror） |
| No results | Fraunces headline-md + body-md muted + ghost CTA |
| Location error | error banner |

---

## 11. Patterns

### 11.1 Search Flow

```
[Glass Search Header]
        ↓
[Search Form — white card, no border]
  - 現在地取得 (Primary)
  - 半径 Select
  - 検索 (Primary)
        ↓
[Results List — gap 16px]
  - Restaurant Card × n
  - Pagination (Outline buttons)
```

### 11.2 Detail Flow

```
[Hero Image — full bleed 4:3, rounded-b-lg, no horizontal padding]
  - Back / Favorite overlays (opaque surface, no blur)
        ↓
[Info Block — spacing only, no divider]
  - Name (headline-md)
  - Meta chips: genre, budget tier (￥), distance
  - Description (body-md muted)
  - Location card (address, access, map embed)
  - Hours card (accordion, collapsed by default)
  - Feature tags (optional)
```

### 11.3 List Separation

- divider 禁止
- `space-y-4`（16px）between cards
- セクション見出しとリスト: `space-y-3`（12px）

---

## 12. Accessibility

### 12.1 Contrast

| Pair | Ratio Target |
|------|--------------|
| `on-background` on `background` | ≥ 7:1 |
| `on-surface-variant` on `surface` | ≥ 4.5:1 |
| `on-primary` on `primary` | ≥ 4.5:1 |

### 12.2 Focus

- すべての interactive 要素に visible focus ring
- `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`

### 12.3 Touch Targets

- 最小 **44 × 44px**（iOS HIG）
- ボタン lg: 48px height

### 12.4 Reduced Motion / Transparency

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

### 12.5 Images

- 必ず `alt`（`{店名}の画像`）
- 画像なし: `surface-muted` placeholder + label

---

## 13. Implementation（Tailwind / CSS）

### 13.1 Font Setup（layout.tsx — 実装準拠）

```tsx
import localFont from "next/font/local";
import { IBM_Plex_Sans_JP } from "next/font/google";

const lubrifont = localFont({
  src: "./fonts/WDXLLubrifontJPN-Regular.ttf",
  weight: "400",
  variable: "--font-brand",
  display: "swap",
});

const ibmPlexSansJp = IBM_Plex_Sans_JP({
  weight: ["400", "500", "600", "700"],
  preload: false,
  variable: "--font-sans",
  display: "swap",
});

// <body className={`${lubrifont.variable} ${ibmPlexSansJp.variable} font-sans`}>
```

### 13.2 Tailwind `@theme` 拡張

```css
@theme inline {
  --font-display: var(--font-display);
  --font-sans: var(--font-sans);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-muted: var(--surface-muted);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-container: var(--primary-container);
  --color-secondary: var(--secondary);
  --color-tertiary: var(--tertiary);
  --color-muted-foreground: var(--muted-foreground);
  --color-destructive: var(--destructive);

  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

### 13.3 Utility Classes

| Class | Definition |
|-------|------------|
| `font-brand` | WDXL Lubrifont JPN |
| `font-sans` | IBM Plex Sans JP |
| `text-headline-lg` | `font-brand text-2xl font-bold tracking-tight` |
| `text-headline-md` | `text-xl font-semibold` |
| `text-body-md` | `text-base leading-6` |
| `text-label-md` | `text-sm font-semibold` |
| `glass` | §8.2 L2 chrome recipe |
| `glass-float` | §8.2 L3 float recipe |
| `skeleton` | §9.3 shimmer |

### 13.4 File Structure（推奨）

```
docs/
  design-system.md          ← このファイル
app/
  globals.css               ← CSS variables + @theme
  layout.tsx                ← font loading
components/
  ui/
    button.tsx              ← variants 準拠
    card.tsx                ← borderless card
    chip.tsx                ← category chip
    search-header.tsx       ← glass header
    bottom-nav.tsx          ← glass nav
    skeleton-card.tsx       ← loading state
constants/
  uiText.ts                 ← 文言（既存）
```

---

## 14. Anti-patterns（やらないこと）

| ❌ Anti-pattern | 理由 | ✅ 代替 |
|----------------|------|--------|
| 7 段 cream surface | のっぺり | 3 段（background / surface / muted） |
| Orange → Red グラデボタン | カプチーノ感 | フラット primary |
| 暖色 shadow | ぼってり | neutral shadow-sm or none |
| 全要素 rounded-xl | マシュマロ UI | radius hierarchy |
| カード全体 glass | 写真が濁る | 白 opaque card |
| Secondary を第 2 CTA | 色が競合 | ghost button |
| divider で list 分割 | borderless 破壊 | vertical spacing |
| opacity で text を薄く | コントラスト不足 | muted-foreground token |
| スクロール要素に blur | パフォーマンス | 固定 UI のみ |
| UI 色で appetite 演出 | 無機感 | 写真 + 1 accent |
| 店舗 UI を `components/ui` に置く | shadcn 更新で上書き・責務混在 | `components/coco` + shadcn プリミティブ |

---

## Appendix A — Token Quick Reference（YAML）

```yaml
name: Appetite & Warmth
version: 1.1.0

colors:
  background: '#FFFCF9'
  surface: '#FFFFFF'
  surface-muted: '#F5F0EB'
  on-background: '#1D1B17'
  on-surface-variant: '#594139'
  outline: '#8D7168'
  outline-variant: '#E1BFB5'
  primary: '#E8470A'
  on-primary: '#FFFFFF'
  primary-container: '#FFDBD0'
  on-primary-container: '#390C00'
  secondary: '#BA0627'
  on-secondary: '#FFFFFF'
  secondary-container: '#FFDAD8'
  tertiary: '#845400'
  on-tertiary: '#FFFFFF'
  tertiary-container: '#FFEDB6'
  on-tertiary-container: '#2A1800'
  error: '#BA1A1A'
  on-error: '#FFFFFF'
  error-container: '#FFDAD6'
  on-error-container: '#93000A'
  glass-bg: 'rgba(255, 252, 249, 0.72)'
  glass-bg-float: 'rgba(255, 252, 249, 0.78)'
  glass-border: 'rgba(255, 255, 255, 0.35)'
  hairline: 'rgba(29, 27, 23, 0.06)'

typography:
  display: WDXL Lubrifont JPN
  body: IBM Plex Sans JP
  headline-xl: { size: 36px, weight: 700, lineHeight: 44px, tracking: -0.02em }
  headline-lg: { size: 28px, weight: 700, lineHeight: 36px, tracking: -0.01em }
  headline-lg-mobile: { size: 24px, weight: 700, lineHeight: 32px }
  headline-md: { size: 20px, weight: 600, lineHeight: 28px }
  body-lg: { size: 18px, weight: 400, lineHeight: 28px }
  body-md: { size: 16px, weight: 400, lineHeight: 24px }
  label-md: { size: 14px, weight: 600, lineHeight: 20px, tracking: 0.01em }
  label-sm: { size: 12px, weight: 500, lineHeight: 16px }

radius:
  sm: 8px
  md: 12px
  lg: 16px
  float: 20px
  xl: 24px
  hero: 32px
  full: 9999px

spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  gutter: 16px
  margin-mobile: 20px

shadow:
  card: '0 1px 2px rgb(0 0 0 / 5%)'
  sm: '0 1px 3px rgb(0 0 0 / 8%)'
  float: '0 4px 16px rgb(0 0 0 / 8%)'

motion:
  fast: 150ms
  base: 220ms
  slow: 380ms
  ease-out-soft: 'cubic-bezier(0.22, 1, 0.36, 1)'
```

---

## Appendix B — Changelog

### v1.1.0 — "Warm Daylight Glass"

| 項目 | v1.0 | v1.1 |
|------|------|------|
| 深度 | spacing 主体・カード shadow なし | **深度 4 層モデル**（L0 背景グラデ / L1 hairline+shadow-card / L2 glass chrome / L3 glass float） |
| Glass | `.glass` 1 レシピ | **2 レシピ制**（`.glass` chrome / `.glass-float`）。下端 hairline・3 本エッジで板厚を表現 |
| Radius | doc 4–24px（実装と乖離） | 実装 `@theme` と 1:1（8/12/16/20/24/32 + pill）+ **同心円ルール** |
| Motion | doc のみ・値は各所アドホック | `:root` に CSS 変数化（150/220/380ms + ease-out-soft） |
| Font | Fraunces + Plus Jakarta Sans（未実装） | **WDXL Lubrifont JPN + IBM Plex Sans JP**（実装が正） |
| カード | hover shadow のみ | rest で hairline + shadow-card、active scale(0.99)、店名 15px/700、数値 tabular-nums |
| Dark mode | 未定義 | **light only と明記**（`.dark` トークンはスコープ外・トグル未実装） |

### Changelog from Stitch v0

| 項目 | Stitch v0 | v1.0（本書） |
|------|-----------|--------------|
| Surface 段数 | 7 段 cream | 3 段 |
| Background | `#FEF8F1` | `#FFFCF9`（より neutral） |
| Primary | `#AB3500` | `#E8470A`（やや鮮やか、フラット向け） |
| Button | 縦グラデ + warm shadow | フラット 1 色 |
| Display font | Jakarta のみ | Fraunces + Jakarta |
| Glass | nav のみ言及 | 適用範囲・fallback 明文化 |
| Card | borderless + shadow | borderless + **shadow なし** + gap |
| Secondary 用途 | 汎用 accent | お気に入り・保存限定 |

---

*Document maintained for coco-gourmet-spike. Implementation PRs should reference section numbers when applying tokens.*
