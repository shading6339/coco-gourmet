# ここぐる（coco-gourmet）

選考課題【ウェブアプリ】提出用の簡易仕様書です。  
ホットペッパー グルメサーチ API を用いて、現在地付近の飲食店を検索するモバイル向け Web アプリです。

---

## 基本情報

| 項目 | 内容 |
| --- | --- |
| **アプリ名** | ここぐる（coco-gourmet） |
| **作者** | 坂上智朗 |
| **コンセプト** | 食べに行きたいお店が、今いる場所からすぐ見つかる。 |
| **リポジトリ URL** | https://github.com/shading6339/coco-gourmet/ |

### こだわったポイント

- 飲食店の検索条件を豊富に選べるようにした（キーワード・半径・ジャンル・予算・ランチ有無・特集・設備・宴会人数・並び順など）。
- モバイルファーストの UI と、Liquid Glass 風の浮遊コンポーネントで操作感を統一した。
- 検索条件・ページ番号を URL に同期し、ブックマークや共有で状態を復元できるようにした。

### デザイン面でこだわったポイント

- 最大幅 28rem のシングルカラムレイアウトで、スマートフォンでの片手操作を前提に設計。
- AppBar / BottomNav / フィルタシートをガラス質感の浮遊 UI で統一（`docs/design-system.md`, `docs/liquid-glass.md` 参照）。
- `prefers-reduced-motion` / `prefers-reduced-transparency` に配慮し、アニメーションと透過表現を抑制可能にした。
- 一覧カードはサムネイル・店名・アクセス・距離・予算・タグを揃え、行高のブレを抑えた。

### 技術面でアドバイスして欲しいポイント

- 検索結果一覧の情報密度とタップしやすさのバランス（特にタグ行・お気に入り操作・ページング周り）。
- 地図表示とリスト表示のデータ同期（地図は最大 40 件プロット、リストはページング）の UX 改善案。
- Hot Pepper API の予算・設備絞り込みを、ユーザーが直感的に理解できる UI に落とし込む方法。

### 自己評価

- **要件充足**: 検索条件入力・一覧（ページング）・詳細の最低要件は満たしている。
- **追加実装**: 地図表示、お気に入り・閲覧履歴、URL 共有、おすすめセクションなど課題外の機能も実装した。
- **課題**: ローカル開発では IP 概算位置 API が動作しない、電話発信連携は未実装など、後述の「既知の制限」あり。
- **総合**: モバイル Web として一通りの体験は完成しているが、実機検証とアクセシビリティ監査にはまだ余地がある。

### 生成 AI の利用について

- 開発中に Cursor 等の生成 AI をコード生成・リファクタリング支援に利用した。
- 提出コードの品質・動作については提出者本人が確認・修正している。

---

## 開発環境

| 項目 | 内容 |
| --- | --- |
| **開発言語** | TypeScript 5.x |
| **ランタイム** | Node.js 20.x 推奨 |
| **パッケージマネージャ** | pnpm 11.x |
| **フレームワーク** | Next.js 15.5.x（App Router） |
| **UI** | React 19.x / Tailwind CSS 4.x |
| **地図** | Leaflet 1.9.x / react-leaflet 5.x |
| **アニメーション** | Motion 12.x |
| **Lint / 型検査** | ESLint 9.x / `tsc --noEmit` |

### 利用技術の選定理由

| 技術 | 理由 |
| --- | --- |
| **Next.js (App Router)** | API Routes で Hot Pepper API キーをサーバー側に閉じつつ、SSR/ルーティングを一体で扱えるため。 |
| **TypeScript** | 検索条件や API レスポンスの型を厳密にし、仕様変更時の不具合を減らすため。 |
| **Tailwind CSS** | モバイル向けの spacing / safe-area を素早く揃え、デザインシステムと併用しやすいため。 |
| **Leaflet** | 検索結果の地図プロット・現在地表示に OSS の地図ライブラリを使うため（タイルは CARTO）。 |
| **localStorage** | お気に入り・閲覧履歴はサーバー DB なしで永続化でき、選考課題のスコープに収まるため。 |

### テーブル定義（ER 図）などの設計ドキュメント

本アプリは **サーバー側データベースを持たない** 構成です。

- 店舗データ: Hot Pepper API から都度取得（永続化しない）。
- お気に入り・閲覧履歴: ブラウザ `localStorage`（キー `coco:favorites:v1`, `coco:history:v1`）。
- 設計ドキュメント: `docs/design-system.md`（UI）、`docs/liquid-glass.md`（ガラス UI コンポーネント）。

```
[Browser]
  ├─ localStorage ─ favorites / history (Shop JSON 配列)
  └─ Next.js App
       ├─ /api/search/*  ──► Hot Pepper Gourmet Search API
       ├─ /api/shop/[id] ──► Hot Pepper (店舗詳細)
       └─ /api/geo/approximate ──► Vercel IP ジオヘッダ（本番のみ）
```

---

## 開発環境構築手順

### 1. 前提

- Node.js 20 以上
- pnpm 11 以上（`corepack enable` 推奨）
- [ホットペッパー グルメサーチ API](https://webservice.recruit.co.jp/doc/hotpepper/reference.html) の API キー

### 2. クローンと依存関係インストール

```bash
git clone <リポジトリ URL>
cd coco-gourmet
pnpm install
```

### 3. 環境変数

プロジェクトルートに `.env.local` を作成する。

```env
HOTPEPPER_API_KEY=あなたのAPIキー
```

### 4. 開発サーバー起動

```bash
pnpm dev
```

ブラウザで `https://localhost:3000` を開く。

- **位置情報**: 検索には Geolocation API の許可が必要。拒否した場合は概算位置または手動検索の導線を表示する。
- **スマートフォン実機**: `pnpm dev:lan` で LAN 公開し、同一ネットワークからアクセスできる。HTTPS が必要な場合は `pnpm dev:lans` を利用する。
Chromeを使用する必要があります。

### 5. ビルド・本番起動

```bash
pnpm build
pnpm start
```

### 6. 品質チェック

```bash
pnpm typecheck
pnpm lint
```

---

## 動作対象端末・OS

モバイル Web を主対象としたレスポンシブ UI（最大幅 28rem）。

| 区分 | 対象 |
| --- | --- |
| **OS** | iOS 16 以降 |
| **ブラウザ** | Chrome（Android・デスクトップ）最新版 |
| **デスクトップ** | Chrome |

※ Geolocation・`navigator.share`・`localStorage` を利用するため、プライベートブラウズでは一部機能が制限される場合がある。

---

## 開発期間

３日間

---

## アプリケーション機能

### 機能一覧

| 機能 | 説明 |
| --- | --- |
| **現在地取得** | Geolocation API で精密位置を取得。未許可時は Vercel デプロイ時の IP 概算位置（`/api/geo/approximate`）をフォールバック。 |
| **レストラン検索** | Hot Pepper グルメサーチ API で現在地・半径・各種条件から店舗を検索。 |
| **検索条件** | キーワード、半径（300〜3000m）、ジャンル（複数）、予算レンジ、ランチ有無、特集、設備・サービス、宴会人数、並び順。 |
| **検索結果一覧** | 店名・アクセス・サムネイル・距離・予算・タグをカード表示。ページング・下端オーバースクロールで次ページ読み込み。 |
| **検索結果地図** | リスト⇄地図切替。ズーム連動半径、「このエリアを検索」、現在地・店舗ピン表示。 |
| **店舗詳細** | 店名・住所・アクセス・営業時間・画像・説明・設備タグ・静的地図。 |
| **外部連携** | Google マップで経路案内、Web Share / クリップボードで詳細 URL 共有、ホットペッパー店舗ページへリンク。 |
| **お気に入り** | ハートトグルで `localStorage` に保存（最大 200 件）。 |
| **閲覧履歴** | 詳細表示時に自動記録（最大 50 件）。 |
| **URL 同期** | 検索条件・ページをクエリに反映。`?shop=<id>` で詳細のコールド復元。 |
| **おすすめ** | ホーム画面で現在地周辺の特集・ジャンル別おすすめを表示。 |

### 画面一覧

| 画面 | 説明 |
| --- | --- |
| **ホーム** | ヒーロー・検索半径・ジャンルベント・おすすめセクション。 |
| **検索（リスト）** | AppBar でキーワード・詳細条件。結果一覧・ソート・ページング。 |
| **検索（地図）** | 同一検索条件の地図プロット。AppBar で条件変更。 |
| **詳細検索オーバーレイ** | 条件パネル（予算ヒストグラム・設備チップ等）と件数プレビュー。 |
| **店舗詳細** | フルスクリーン詳細。戻るで元タブに復帰。 |
| **履歴 / お気に入り** | BottomNav から保存済み店舗一覧。 |

### 課題要件との対応

| 課題要件 | 対応 |
| --- | --- |
| Geolocation で現在地取得 | ✅ `useLocationState` / 検索フロー全体 |
| 検索半径の指定 | ✅ 300〜3000m（ホーム・詳細条件・地図ズーム連動） |
| その他検索条件 | ✅ 上記「検索条件」参照 |
| 一覧: 店名・アクセス・サムネイル | ✅ `RestaurantCard` |
| ページング | ✅ `PaginationBar` + pull-next |
| 詳細: 店名・住所・営業時間・画像 | ✅ `RestaurantDetail` |
| 詳細にあるべき機能 | ✅ 経路・共有・HP リンク（電話は未実装、下記参照） |

### 使用している API / SDK / ライブラリ

| 名称 | 用途 |
| --- | --- |
| [ホットペッパー グルメサーチ API](https://webservice.recruit.co.jp/doc/hotpepper/reference.html) | 店舗検索・詳細 |
| [Geolocation API](https://developer.mozilla.org/docs/Web/API/Geolocation_API) | 現在地 |
| [CARTO Basemap](https://carto.com/basemaps/) | 地図タイル（Leaflet） |
| Next.js / React / Tailwind / Motion / Leaflet 等 | フロント・BFF |

---

## 既知の制限・今後実装したい機能

| 項目 | 内容 |
| --- | --- |
| **IP 概算位置** | `/api/geo/approximate` は Vercel のジオヘッダ依存のため、`localhost` では 404。ローカルは Geolocation 許可が必要。 |
| **電話アプリ連携** | API から電話番号を画面に出していないため、`tel:` 連携は未実装。今後 Shop 型と詳細 UI に追加予定。 |
| **オフライン** | 未対応（常時ネットワーク前提）。 |
| **アクセシビリティ** | 基本の `aria-*` は付与済みだが、スクリーンリーダー実機テストは限定的。 |

---

## リポジトリ構成（主要）

```
app/
  page.tsx              # エントリ（URL 状態のパース）
  home-content.tsx      # 画面オーケストレーション
  api/search/           # 検索 BFF
  api/shop/[id]/        # 店舗詳細 BFF
components/coco/        # ドメイン UI（一覧・詳細・地図・保存タブ）
components/ui/          # デザインシステム / Liquid Glass
hooks/                  # 検索・位置・お気に入り等
lib/hotpepper/          # API クライアント・マッピング
lib/storage/            # localStorage 抽象化
docs/                   # デザインシステム資料
```

---

## ライセンス・注意

- Hot Pepper API の利用規約・クレジット表示に従うこと。
- `HOTPEPPER_API_KEY` をリポジトリにコミットしないこと（`.env.local` は gitignore 対象）。
