# Hydrogen skeleton with Zoorix

This is Shopify's [Hydrogen skeleton template](https://github.com/Shopify/hydrogen/tree/main/templates/skeleton)
(MIT, `Shopify/hydrogen@15cc3df`, `@shopify/hydrogen` 2026.4.5) with Zoorix wired in, following the
[Hydrogen guide](../../hydrogen/README.md). The template's own README is in
[TEMPLATE-README.md](./TEMPLATE-README.md).

## Run it

Zoorix needs a real store, so this example doesn't work with the template's Mock.shop fallback.

1. In Zoorix → Settings → Headless storefront, save your Hydrogen storefront's `PUBLIC_STOREFRONT_API_TOKEN`.
2. Copy `.env.example` to `.env` and fill it in from your Hydrogen storefront, or run
   `npx shopify hydrogen link` and `npx shopify hydrogen env pull`.
3. `npm install && npm run dev`, then open a product page.

## What changed for Zoorix

Search for `Zoorix` in the code; every change is commented.

| File | Change |
|---|---|
| `app/components/Zoorix.tsx` | Copied from [hydrogen/Zoorix.tsx](../../hydrogen/Zoorix.tsx) |
| `app/root.tsx` | Renders `<Zoorix>` with the root loader's cart and i18n |
| `app/components/Header.tsx` | The cart badge is wrapped in `<zoorix-cart-button>` and skips its own aside when the click was handled |
| `app/routes/products.$handle.tsx` | `<zoorix-offers>` with the product and selected variant |
| `app/components/PageLayout.tsx` | `<zoorix-promotion-bar>` above the page content |
| `app/entry.server.tsx` | Zoorix's origins in the Content Security Policy |
