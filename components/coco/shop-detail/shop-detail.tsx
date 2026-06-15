import type { JSX, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ShopActionRow } from "@/components/coco/shop-detail/shop-action-row";
import { ShopDetailHero } from "@/components/coco/shop-detail/shop-detail-hero";
import { ShopDetailMetaTags } from "@/components/coco/shop-detail/shop-detail-meta-tags";
import { ShopQuickFacts } from "@/components/coco/shop-detail/shop-quick-facts";
import { ShopFeatureGrid } from "@/components/coco/shop-detail/shop-feature-grid";
import { ShopHoursCard } from "@/components/coco/shop-detail/shop-hours-card";
import { ShopLocationCard } from "@/components/coco/shop-detail/shop-location-card";
import { Typography } from "@/components/ui/typography";
import { TEXT } from "@/constants/text";
import { buildShopFeatureDisplays } from "@/lib/shop/shop-feature-display";
import type { Shop } from "@/types/shop";

/** セクション見出し（label-sm・muted） */
function DetailSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="space-y-2">
      <Typography
        as="h2"
        variant="label-sm"
        className="tracking-wide text-muted-foreground"
      >
        {label}
      </Typography>
      {children}
    </section>
  );
}

type RestaurantDetailProps = {
  shop: Shop;
  onBack?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
};

/** 店舗詳細（ヒーロー 4:3 → 名前 → メタタグ → 説明 → 住所カード → 営業時間） */
export function RestaurantDetail({
  shop,
  onBack,
  isFavorite = false,
  onToggleFavorite,
  className,
}: RestaurantDetailProps): JSX.Element {
  const description = shop.description.trim();
  const hasLocation =
    Boolean(shop.address.trim()) ||
    Boolean(shop.access.trim()) ||
    (shop.lat !== null && shop.lng !== null);
  const hasHours = Boolean(shop.open.trim()) || Boolean(shop.close.trim());
  const hasFeatures = buildShopFeatureDisplays(shop.tags).length > 0;

  return (
    <div className={cn("min-w-0 space-y-5", className)}>
      <ShopDetailHero
        imageUrl={shop.heroImageUrl ?? shop.imageUrl}
        shopName={shop.name}
        onBack={onBack}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />

      <div className="space-y-4">
        <Typography
          as="h1"
          variant="headline-md"
          className="break-words text-2xl font-bold leading-8"
        >
          {shop.name}
        </Typography>

        <ShopDetailMetaTags shop={shop} />

        {/* この店を素早く理解する: 営業状況・予算・距離 */}
        <ShopQuickFacts shop={shop} />

        <ShopActionRow shop={shop} />

        {description ? (
          <Typography variant="lead">{description}</Typography>
        ) : null}

        {hasLocation ? (
          <DetailSection label={TEXT.shop.locationSectionLabel}>
            <ShopLocationCard shop={shop} />
          </DetailSection>
        ) : null}

        {hasHours ? (
          <DetailSection label={TEXT.shop.hoursSectionLabel}>
            <ShopHoursCard openHours={shop.open} closedDay={shop.close} />
          </DetailSection>
        ) : null}

        {hasFeatures ? (
          <DetailSection label={TEXT.shop.featuresSectionLabel}>
            <ShopFeatureGrid tags={shop.tags} />
          </DetailSection>
        ) : null}
      </div>
    </div>
  );
}
