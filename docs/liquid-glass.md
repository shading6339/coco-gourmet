# Liquid Glass — 実装仕様

> **Version:** 1.0.0
> **対象:** ここぐる（kokoguru）フローティングUI
> **Stack:** Next.js 15 · Tailwind v4 · Framer Motion (motion/react)
> 親ドキュメント: [design-system.md](./design-system.md)（深度4層・glass 2レシピ・motionトークン）

Apple の「Liquid Glass」を Web 上で解釈した、**物理演算と光学シミュレーションに基づく動的なガラス**の実装ルール。単なる `backdrop-filter: blur()` の静的グラスモーフィズムではない。

---

## 1. 核心

| 属性 | 意味 |
|------|------|
| **物理的** | 表面張力・粘性・バネ弾性を持つ。押下/解放/切替を spring で表現 |
| **光学的** | 屈折（背後の歪み）・光の回り込み（エッジハイライト）・環境色の注入 |

**適用範囲（重要）:** フローティングUI（ボトムナビ・AppBarカプセル・地図の浮遊コントロール・主要CTA・chip/トグル）に限定。**コンテンツカード・本文・写真・入力は不透明維持**（可読性最優先）。

---

## 2. 視覚仕様（Visual Topology & Optics）

### 2.1 形状 — 同心円カプセル
- フローティング要素は極端な角丸（カプセル型 or 大きな radius）。
- ネストは同心円ルール: 内側 radius = 外側 radius − gap（[design-system.md §6.2](./design-system.md)）。
- 静的固定値ではなく、状態に応じて `borderRadius` を spring でモーフ。

### 2.2 深度 — 明確な浮遊
- 親背景に直接適用しない。コンテンツの上に「浮かぶ」層。
- 複数 `box-shadow` を重ねて厚み + 接地距離を表現。
- エッジに極細 inset ハイライト（白）で光の回り込み。

### 2.3 光学 — 屈折と環境色注入
- `backdrop-filter: blur() saturate()` をベースに、背後の彩度を持ち上げる（vibrant）。
- ベースは `--glass-bg-float`（rgb 255 252 249 / 78%）。

### 2.4 エッジ3層レシピ
```
inset 0 1px 0 rgb(255 255 255 / 60%)   /* 上辺の反射 */
inset 0 -1px 0 rgb(0 0 0 / 4%)         /* 下辺の接地 */
var(--shadow-float)                     /* 外周ドロップ */
```

---

## 3. インタラクション物理（Spring Dynamics）

すべての動きを spring でシミュレート。`ease-in-out` や単純 `scale` は不可。

| 状態 | 視覚・物理変化 | spring パラメータ |
|------|----------------|-------------------|
| **① Idle** | カプセル・深度3・屈折・エッジ白ハイライト | — |
| **② Hover** | ハイライトがポインタ追従、背景色を少し吸う | — |
| **③ Active（押下＝潰れて広がる）** | 単純縮小NG。Z方向に縮みつつ四隅が外へ膨らみ接地面へ流動的に広がる（`scaleY↓` + `scaleX↑`）。ドロップシャドウは小さく濃く、blur は一段低下（接地面がクリアに） | `{ stiffness: 520, damping: 18 }`（硬く・反発、指に即応） |
| **④ Morphing（切替）** | 選択インジケータが要素間を「溶けて流れる」。Framer `layoutId` 共有で隣接ガラスがシームレスに結合。テキスト/アイコンは形状変化に遅れて沈む | `{ stiffness: 380, damping: 30, mass: 1 }`（質量感+揺り戻し） |
| **⑤ Release（解放＝プルン）** | 表面張力が戻るように overshoot を伴い元形状へ復元。水滴特有の揺れを残す | `{ stiffness: 320, damping: 12, mass: 0.9 }`（damping低め） |

### トークン化（実装定数）
```ts
export const LIQUID_SPRING = {
  active:  { type: "spring", stiffness: 520, damping: 18 },
  release: { type: "spring", stiffness: 320, damping: 12, mass: 0.9 },
  morph:   { type: "spring", stiffness: 380, damping: 30, mass: 1 },
} as const;
```

---

## 4. コンポーネント

### 4.1 `LiquidGlassButton`（components/ui/liquid-glass-button.tsx）
- `motion.button`。`.glass-float` を土台にエッジ3層。
- `whileTap` で Active（scaleY↓ + scaleX↑ + radius→pill）、離すと Release で揺り戻し。
- 任意の children（テキスト/アイコン）。variant（primary / ghost / on-glass）。

### 4.2 `LiquidGlassContainer`（components/ui/liquid-glass-container.tsx）
- 複数 Liquid Glass 要素を統合。`layoutId` で選択インジケータの流動モーフを管理。
- spring 設定を Context で配布。用途: ボトムナビの選択pill、AppBarカプセル、セグメント。

---

## 5. アクセシビリティ

- `prefers-reduced-motion`: spring 全停止。`whileTap` 無効、色/opacity のみで状態表現。
- `prefers-reduced-transparency`: blur 無効化し不透明面（`--surface`）に fallback（[design-system.md §8.2](./design-system.md)）。
- 同時 `backdrop-filter` は最大3要素（性能）。スクロール要素（地図）には blur 非適用。
- 物理アニメは `transform`/`opacity` 中心、layout を避ける。

---

## 6. Anti-patterns

| ❌ | 理由 |
|----|------|
| 本文/カード/写真をガラス化 | 可読性・appetite を損なう |
| 単純 `scale`/`ease` で押下 | Liquid Glass の物理感が出ない |
| blur をスクロール要素に | iOS Safari 性能劣化 |
| 同時 backdrop-filter 4+ | 描画コスト |
| reduced-motion 非対応の spring | アクセシビリティ違反 |
