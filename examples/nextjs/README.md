# Next.js Commerce with Zoorix

This is [Next.js Commerce](https://github.com/vercel/commerce) (MIT, commit `3761e52`) with Zoorix
wired in. The original README is in [TEMPLATE-README.md](./TEMPLATE-README.md); setting up the
template itself is unchanged.

## Run it

1. In Zoorix → Settings → Headless storefront, save your storefront's **public** Storefront API
   access token (see the [guide](../../README.md#before-you-start)).
2. Copy `.env.example` to `.env.local` and fill in `SHOPIFY_STORE_DOMAIN` and
   `SHOPIFY_STOREFRONT_ACCESS_TOKEN`, as the template asks.
3. `pnpm install && pnpm dev`, then open a product page.

## What changed for Zoorix

Search for `Zoorix` in the code; every change is commented.

| File                                                                                        | Change                                                                                                                                                      |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/shopify/fragments/cart.ts`, `lib/shopify/types.ts`, `components/cart/cart-context.tsx` | The cart now has `updatedAt`                                                                                                                                |
| `components/cart/actions.ts`                                                                | `refreshCart()`: refetches the cart after `zrx:cart-changed`                                                                                                |
| `components/zoorix/zoorix-store.tsx`                                                        | `<zoorix-store>` with the cart's ID and `updatedAt`, and `product-path="/product/{handle}"` (this template's product route)                                 |
| `app/layout.tsx`                                                                            | Loads the Zoorix script after hydration (`next/script`); renders `<ZoorixStore>` and `<zoorix-promotion-bar>`                                               |
| `components/cart/modal.tsx`                                                                 | The cart button is wrapped in `<zoorix-cart-button>` and skips its own modal when the click was handled; the modal no longer auto-opens on quantity changes |
| `components/zoorix/zoorix-product-offers.tsx`, `components/product/product-description.tsx` | `<zoorix-offers>` on the product page, with the selected variant                                                                                            |
| `zoorix.d.ts`                                                                               | JSX types for the Zoorix elements                                                                                                                           |

The template already creates the cart on first load and keeps its ID in the `cartId` cookie, so
nothing else is needed.
