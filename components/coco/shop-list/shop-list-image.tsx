"use client";

import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import Image from "next/image";
import { RESTAURANT_LIST_THUMB_SIZES } from "@/constants/shopImage";
import { cn } from "@/lib/utils";
import { TEXT } from "@/constants/text";

type ShopListImageProps = {
  imageUrl: string;
  alt: string;
  className?: string;
};

type LoadState = "loading" | "loaded" | "error";

/** 一覧サムネ（読み込み中はスケルトン） */
export function ShopListImage({
  imageUrl,
  alt,
  className,
}: ShopListImageProps): JSX.Element {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(
    imageUrl ? "loading" : "error",
  );

  useEffect(() => {
    setLoadState(imageUrl ? "loading" : "error");
  }, [imageUrl]);

  const syncCompletedImage = useCallback((): void => {
    const image = imageRef.current;
    if (!image || !imageUrl || !image.complete) return;

    setLoadState(image.naturalWidth > 0 ? "loaded" : "error");
  }, [imageUrl]);

  useEffect(() => {
    if (!imageUrl) return undefined;

    const frame = window.requestAnimationFrame(syncCompletedImage);
    const timer = window.setTimeout(syncCompletedImage, 120);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [imageUrl, syncCompletedImage]);

  return (
    <div
      className={cn(
        "relative h-full min-h-[4.25rem] w-full min-w-0 self-stretch overflow-hidden rounded-none bg-surface-muted",
        className,
      )}
      data-slot="shop-image-list"
    >
      {imageUrl && loadState !== "error" ? (
        <>
          {loadState === "loading" ? (
            <div className="skeleton absolute inset-0 rounded-none" aria-hidden />
          ) : null}
          <Image
            ref={imageRef}
            key={imageUrl}
            src={imageUrl}
            alt={alt}
            fill
            sizes={RESTAURANT_LIST_THUMB_SIZES}
            className={cn(
              "object-cover transition-opacity duration-200",
              loadState === "loaded" ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => {
              setLoadState("loaded");
            }}
            onError={() => {
              setLoadState("error");
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center px-1 text-center text-xs text-muted-foreground"
          aria-hidden
        >
          {TEXT.common.noImage}
        </div>
      )}
    </div>
  );
}
