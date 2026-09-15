# Zoorix headless contract, v1

The complete reference for Zoorix on a headless Shopify storefront. For a walkthrough, start with the
[README](./README.md).

Script: `https://admin.zoorix-bundle-kit.com/assets/headless/v1/zoorix.js` (`type="module"`).

## Setting

| Setting | Required | |
|---|---|---|
| Zoorix → Settings → Headless storefront | yes | Your storefront's **public** Storefront API access token |

Zoorix uses this token for every Storefront API call serving your storefront, in the browser and on
Zoorix's servers. It must be your storefront's own token: products published only to your storefront's
sales channel are invisible to any other token. Only a public token is accepted, since it's served to
browsers; Zoorix rejects private tokens (`shp…_`) and checks the token with Shopify before saving.
The page never sends a token to Zoorix.

Without a saved token, `<zoorix-store>` doesn't start and logs one console error naming the setting.

## Elements and attributes

| Kind | Name | Required | Notes |
|---|---|---|---|
| Element | `zoorix-store` | yes, once per page | Loads your Zoorix configuration; works on your cart; mounts the Zoorix cart drawer; adds free gifts |
| Attribute | `shop` | yes | Your `*.myshopify.com` domain |
| Attribute | `cart-id` | yes | Your cart's ID (a `gid://shopify/Cart/…` GID). Until it's set, nothing renders |
| Attribute | `cart-updated-at` | yes | Your cart's Storefront API `updatedAt` |
| Attribute | `country` | no | ISO 3166 country code, as passed to `@inContext`. Absent: your shop's primary market |
| Attribute | `language` | no | ISO 639 language code, as passed to `@inContext`. Absent: your shop's primary market |
| Attribute | `product-path` | no | Where product links point; `{handle}` is replaced. Default `/products/{handle}` |
| Element | `zoorix-offers` | per placement | Every applicable offer for its context |
| Attribute | `product-id` | this, or `cart` | Product ID, numeric or GID |
| Attribute | `variant-id` | no | The selected variant, numeric or GID |
| Attribute | `cart` | this, or `product-id` | Offers based on the cart's contents |
| Element | `zoorix-promotion-bar` | no | Progress toward your promotion tiers. No attributes |
| Element | `zoorix-cart-button` | no | Wraps your cart icon; a click opens the Zoorix cart drawer |

## Event

| Event | Target | `detail` |
|---|---|---|
| `zrx:cart-changed` | `window` | `{ reason: 'offer' \| 'free-gift' \| 'drawer' }` |

- `offer`: a shopper added an offer.
- `free-gift`: Zoorix added a promotion tier's free gift.
- `drawer`: a change made in the Zoorix cart drawer (quantities, removals, discount codes, the note,
  its recommendations).

Treat any other `reason` as a generic cart change: new reasons may be added within v1.

## Rules

### Declarative only

Attributes in, events out. There's no JavaScript API. A tag rendered before the script loads keeps its
attributes and starts when the script arrives, so load order never matters, and listening for
`zrx:cart-changed` before the script loads is fine.

### Every attribute is live

Change any attribute and Zoorix updates without a remount: a new `product-id` after client-side
navigation, a new `variant-id` when the shopper picks one, a new `country` when they switch market.

### The storefront owns the cart

Create the cart before rendering `<zoorix-store>`. Zoorix adds to that cart, changes it and never
replaces it. Changing `cart-id` switches Zoorix to the new cart.

### One event per settled change

A change Zoorix makes fires `zrx:cart-changed` **once**, after every cart write and discount call it
started has finished, including when a discount call fails (the lines did change). Two changes that
overlap, such as two quick adds, fire once, at the end. Your cart therefore never shows a full-price
line that is about to be discounted.

### Cart sync without loops

1. Zoorix changes the cart and fires `zrx:cart-changed`.
2. You refetch your cart and render its new `updatedAt` into `cart-updated-at`.
3. Zoorix already refetched that cart before firing, so it skips this `updatedAt`.

When **you** change the cart (your own add-to-cart button), render the new `updatedAt` too: Zoorix
refetches and updates the promotion bar, cart offers and the drawer. `updatedAt` has second
precision, so Zoorix refetches once more a second later to catch two changes within one second.

### One offers context per page

All offer widgets on a page, the Zoorix drawer's recommendations included, show one context: the first
`<zoorix-offers>` on the page sets it. A `<zoorix-offers>` with a different context renders nothing and
logs one warning. Several tags with the **same** context are fine, and share one fetch.

In practice: product offers on a product page; `<zoorix-offers cart>` on a cart page. With the Zoorix
cart drawer enabled, cart recommendations live in the drawer.

## Cart drawer

The Zoorix cart drawer has no tag. `<zoorix-store>` mounts it when the cart drawer is enabled in your
Zoorix settings, together with its floating toggle if that setting is on. It opens:

- from `<zoorix-cart-button>`;
- from the floating toggle;
- after a shopper adds an offer, if "open after add to cart" is on.

It never takes over your links: only `<zoorix-cart-button>` opens it.

### `<zoorix-cart-button>`

- A plain click (no modifier keys) anywhere inside opens the drawer and prevents the click's default,
  only when the drawer is enabled and loaded. Otherwise, and for Ctrl/⌘-click, your link or button
  behaves normally.
- It renders nothing and leaves your markup alone (`display: contents`). It adds
  `aria-haspopup="dialog"` to the first focusable element inside, and focus returns there when the
  drawer closes.
- Router links (Next.js `<Link>`, Remix/Hydrogen `<Link>`) already ignore a click whose default was
  prevented. **A click handler of your own must check `event.defaultPrevented`** and skip its own
  action, or your cart panel and the drawer open together.

### Checkout

The drawer's checkout goes to the cart's Storefront API `checkoutUrl`, which keeps the cart's
discount codes. Your own checkout button is unaffected.

## Product links

Offers and the drawer link to products at `product-path` (default `/products/{handle}`). Set it when
your routes differ, e.g. Next.js Commerce uses `/product/{handle}`.

## Markets, currencies and exchange rates

`country` selects the market and the market selects the currency: Zoorix queries the Storefront API
with `@inContext(country, language)`, so prices come back in the market's currency. Keep your cart's
buyer identity in the same country, so its currency matches.

Some amounts are configured in your shop's currency, such as promotion tier thresholds and fixed
discounts. Where a promotion tier has a per-market threshold, Zoorix uses it exactly. Otherwise it
converts for display with Shopify's public exchange rates, which can differ slightly from your
market's rate or rounding. This affects **displayed** amounts only: Shopify computes discounts at
checkout. If you sell in several currencies, set per-market thresholds on your promotion tiers.

## Custom CSS and JavaScript

The custom CSS and custom JavaScript you save in Zoorix apply on your headless storefront as they do on
a theme store.

## Content Security Policy

If your storefront sends a CSP, allow:

| Directive | Sources | Why |
|---|---|---|
| `script-src` | `https://admin.zoorix-bundle-kit.com` | `zoorix.js` and the widgets it loads |
| `connect-src` | `https://admin.zoorix-bundle-kit.com`, `https://your-shop.myshopify.com`, `https://cdn.shopify.com` | Zoorix's API; the Storefront API; exchange rates |
| `img-src` | `https://cdn.shopify.com`, `https://admin.zoorix-bundle-kit.com`, `https://public.zoorix.com` | Product images; Zoorix icons |
| `style-src` | `'unsafe-inline'` | Zoorix adds `<style>` elements for its widgets and your custom CSS |

Custom JavaScript saved in Zoorix runs as an inline script; a CSP without `'unsafe-inline'` in
`script-src` blocks it, and everything else keeps working.

## Console messages

Each is logged once.

| Message starts with | Meaning |
|---|---|
| `[zoorix-store] Missing the required "…" attribute` | Set `shop` and `cart-id`. Zoorix starts as soon as they're there |
| `[zoorix-store] No headless storefront token is saved` | Save your public token in Zoorix → Settings → Headless storefront |
| `[zoorix-store] Could not load the Zoorix configuration` | Check `shop`; Zoorix retries on the next attribute change |
| `[zoorix-offers] Set product-id (optionally with variant-id) or cart.` | The tag has no context |
| `[zoorix-offers] Set product-id or cart, not both.` | The tag has two contexts |
| `[zoorix-offers] product-id must be a numeric product id or a Product GID.` | Fix `product-id` |
| `[zoorix-offers] This page already shows offers for "…"` | A second offers context on the page; see [One offers context per page](#one-offers-context-per-page) |

## Not in v1

Standalone mix-and-match builder pages, and offers placed on collection or home pages.

## Versioning

- The script's path carries the major version: `/assets/headless/v1/`.
- **Within v1, the contract only grows:** new optional attributes, elements, events, `detail` fields and
  `reason` values. Nothing is renamed, removed or given a new meaning.
- A breaking change ships as `/assets/headless/v2/` beside `v1`. `v1` then gets an announced sunset
  date, and is removed after it.
