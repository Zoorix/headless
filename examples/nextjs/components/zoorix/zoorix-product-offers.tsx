"use client";

import type { Product } from "lib/shopify/types";
import { useSearchParams } from "next/navigation";

// <zoorix-offers> for the product page, with the variant the shopper selected (same rule as
// AddToCart: the options in the URL, or the only variant).
export function ZoorixProductOffers({ product }: { product: Product }) {
  const searchParams = useSearchParams();
  const selected = product.variants.find((variant) =>
    variant.selectedOptions.every(
      (option) => option.value === searchParams.get(option.name.toLowerCase()),
    ),
  );
  const variantId =
    selected?.id ??
    (product.variants.length === 1 ? product.variants[0]?.id : undefined);

  return <zoorix-offers product-id={product.id} variant-id={variantId} />;
}
