# Zoorix on a headless Shopify storefront

Zoorix shows bundles, cross-sells, volume discounts, BOGO and mix-and-match offers, a promotion bar
and a cart drawer on your storefront. On a headless storefront (plain HTML, Next.js, Hydrogen, or
anything else that renders HTML), you add it with **one script, a few tags and one event
listener**. There is no package to install.

> **Status:** preview. The v1 script URL below goes live with the Zoorix release that ships headless
> support.

- **This guide:** set it up in about ten minutes.
- **[CONTRACT.md](./CONTRACT.md):** the full reference: every tag, attribute and event, and the rules
  behind them.
- **[hydrogen/](./hydrogen/):** Hydrogen is a headless storefront too, so everything here applies;
  that folder has the one file to copy and the Hydrogen version of this guide.
- **[examples/](./examples/):** working storefronts for [plain HTML](./examples/plain-html/),
  [Next.js](./examples/nextjs/) and [Hydrogen](./examples/hydrogen/).

## Before you start

1. **Install Zoorix** on your Shopify store and create at least one offer.
2. **Save your storefront's public Storefront API access token in Zoorix.** Open Zoorix → Settings →
   Headless storefront and paste it. Zoorix checks it with Shopify before saving.
   - **Headless channel:** Shopify admin → Sales channels → Headless → your storefront → Storefront API
     → **Public access token**.
   - **Hydrogen:** the same, in the Hydrogen channel; it's the storefront's `PUBLIC_STOREFRONT_API_TOKEN`.

   Use the **public** token, never the private one (private tokens start with `shp…_`). Zoorix needs
   *your storefront's* token because a product published only to your storefront's channel is
   invisible to any other token. Without it, Zoorix doesn't start and says so in the console.

## 1. Have a cart before Zoorix renders

Zoorix works on your storefront's cart and never creates one. Create the cart when a visitor first
arrives (most templates already do) and keep its ID, e.g. in a cookie.

## 2. Add the script

```html
<script type="module" src="https://admin.zoorix-bundle-kit.com/assets/headless/v1/zoorix.js"></script>
```

Anywhere on the page, once. Load order doesn't matter: tags rendered before the script loads start
when it arrives.

With a server-rendering React framework, load it **after hydration**: `next/script` (its default
strategy) in Next.js, an effect in Hydrogen (as [hydrogen/Zoorix.tsx](./hydrogen/Zoorix.tsx) does). See
[CONTRACT.md](./CONTRACT.md#server-rendering-and-hydration).

## 3. Add `<zoorix-store>` to your layout

```html
<zoorix-store
  shop="your-shop.myshopify.com"
  cart-id="gid://shopify/Cart/…"
  cart-updated-at="2026-09-10T08:49:48Z"
></zoorix-store>
```

- `cart-id`: your cart's ID.
- `cart-updated-at`: your cart's Storefront API `updatedAt`. Add `updatedAt` to your cart query if it
  isn't there.
- Selling in several markets? Add `country` (and `language`) as you pass them to `@inContext`.
- Product pages not at `/products/{handle}`? Add `product-path`, e.g. `product-path="/product/{handle}"`.

Every attribute is live: when your cart or market changes, update the attribute and Zoorix follows.

## 4. Refetch your cart when Zoorix changes it

```js
addEventListener('zrx:cart-changed', () => refreshMyCart());
```

Zoorix fires `zrx:cart-changed` once a change it made has **settled**, with its discounts attached,
so your cart never shows a full-price line that is about to be discounted. After you refetch, the
new `updatedAt` flows back through `cart-updated-at` and Zoorix knows it already has that cart.

## 5. Wrap your cart icon

```html
<zoorix-cart-button>
  <a href="/cart">Cart (2)</a>
</zoorix-cart-button>
```

When the Zoorix cart drawer is enabled, a click opens it. When it's disabled, or before the script
loads, your link works as usual.

If your cart icon has its own click handler (opening your own cart panel, for example), skip it when
Zoorix already handled the click:

```js
onClick={(event) => {
  if (event.defaultPrevented) return; // Zoorix opened its drawer
  openMyCart();
}}
```

## 6. Place offers

```html
<!-- product page -->
<zoorix-offers product-id="8120202199175" variant-id="44012345678901"></zoorix-offers>

<!-- a cart page or custom cart panel -->
<zoorix-offers cart></zoorix-offers>
```

IDs can be numeric or GIDs. Update `variant-id` when the shopper picks a variant; change `product-id`
on client-side navigation. Offers for one context per page: see [CONTRACT.md](./CONTRACT.md#one-offers-context-per-page).

## 7. Optional: the promotion bar

```html
<zoorix-promotion-bar></zoorix-promotion-bar>
```

Progress toward the promotion tiers you set up in Zoorix. Free gifts are added to the cart for you.

## Content Security Policy

If your storefront sets a CSP, allow Zoorix's origins. The list is in
[CONTRACT.md](./CONTRACT.md#content-security-policy).

## Troubleshooting

Zoorix reports setup problems once each in the browser console, prefixed `[zoorix-store]` or
`[zoorix-offers]`: a missing `cart-id`, no token saved in Zoorix settings, or a second offers context
on the page. [CONTRACT.md](./CONTRACT.md#console-messages) lists them.
