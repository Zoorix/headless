"use client";

import { refreshCart } from "components/cart/actions";
import { useCart } from "components/cart/cart-context";
import { useEffect } from "react";

// <zoorix-store>: the cart and where product links point. Once per page, in the layout.
export function ZoorixStore({ shop }: { shop: string }) {
  const { cart } = useCart();

  // Zoorix changed the cart and the change has settled: refetch it. The new updatedAt comes
  // back through cart-updated-at, and Zoorix skips it because it already has that cart.
  useEffect(() => {
    const onCartChanged = () => void refreshCart();
    window.addEventListener("zrx:cart-changed", onCartChanged);
    return () => window.removeEventListener("zrx:cart-changed", onCartChanged);
  }, []);

  // The template creates the cart on first load (CartModal); Zoorix starts once it exists.
  if (!cart?.id) return null;

  return (
    <zoorix-store
      shop={shop}
      cart-id={cart.id}
      cart-updated-at={cart.updatedAt}
      product-path="/product/{handle}"
    />
  );
}
