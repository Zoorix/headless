# Zoorix on Hydrogen

Hydrogen is a headless storefront, so the [guide](../README.md) and the [contract](../CONTRACT.md)
apply as they are. This page is the Hydrogen version of the guide: one file to copy and a few small
edits to the skeleton template. The [example](../examples/hydrogen/) is the skeleton with all of them
applied.

## Before you start

In Zoorix → Settings → Headless storefront, save your storefront's **public** Storefront API token:
the Hydrogen channel's `PUBLIC_STOREFRONT_API_TOKEN` for this storefront. Zoorix needs it to see the
products published to your Hydrogen storefront.

## 1. Copy `Zoorix.tsx`

Copy [Zoorix.tsx](./Zoorix.tsx) to `app/components/Zoorix.tsx`. It:

- loads the Zoorix script after hydration;
- creates a cart for a new visitor through your `/cart` route (Zoorix needs one before it starts);
- renders `<zoorix-store>` with the cart's ID and `updatedAt`, and your market's country and language;
- reloads the cart when Zoorix fires `zrx:cart-changed`.

## 2. Render it in `app/root.tsx`

```tsx
import {Suspense} from 'react';
import {Await /* , … */} from 'react-router';
import {Zoorix} from './components/Zoorix';

export default function App() {
  const data = useRouteLoaderData<RootLoader>('root');
  // …
  return (
    <Analytics.Provider cart={data.cart} shop={data.shop} consent={data.consent}>
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
      <Suspense fallback={null}>
        <Await resolve={data.cart}>
          {(cart) => (
            <Zoorix
              shop={data.publicStoreDomain}
              cart={cart}
              country={data.consent.country}
              language={data.consent.language}
            />
          )}
        </Await>
      </Suspense>
    </Analytics.Provider>
  );
}
```

The skeleton's `CartApiQuery` fragment already includes `updatedAt`, and its root loader already
reloads the cart on `useRevalidator`. `shop` must be your `*.myshopify.com` domain.

The cart is created with the skeleton's `BuyerIdentityUpdate` cart action. If you've removed it from
`app/routes/cart.tsx`, add it back, or change the action in `Zoorix.tsx` to one your route handles.

## 3. Wrap the cart toggle in `app/components/Header.tsx`

```tsx
function CartBadge({count}: {count: number}) {
  // …
  return (
    <zoorix-cart-button>
      <a
        href="/cart"
        onClick={(e) => {
          if (e.defaultPrevented) return; // Zoorix opened its cart drawer
          e.preventDefault();
          open('cart');
          // …
        }}
      >
        Cart <span aria-label={`(items: ${count})`}>{count}</span>
      </a>
    </zoorix-cart-button>
  );
}
```

With the Zoorix cart drawer enabled, a click opens it. With it disabled, the skeleton's cart aside
opens as before. The `defaultPrevented` check is what stops both from opening.

## 4. Place offers in `app/routes/products.$handle.tsx`

```tsx
<ProductForm productOptions={productOptions} selectedVariant={selectedVariant} />
<zoorix-offers product-id={product.id} variant-id={selectedVariant?.id} />
```

## 5. Allow Zoorix in your Content Security Policy

In `app/entry.server.tsx`:

```tsx
import {ZOORIX_ORIGIN} from '~/components/Zoorix';

const {nonce, header, NonceProvider} = createContentSecurityPolicy({
  shop: {
    checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
    storeDomain: context.env.PUBLIC_STORE_DOMAIN,
  },
  // Zoorix: its scripts and icons, its API, and the cart drawer's stylesheet (a data: URL).
  defaultSrc: [ZOORIX_ORIGIN, 'https://public.zoorix.com'],
  connectSrc: [ZOORIX_ORIGIN],
  styleSrc: ['data:'],
});
```

Hydrogen merges these with its defaults, which already allow `cdn.shopify.com`, your store domain and
inline styles. Without `data:` in `styleSrc`, the Zoorix cart drawer opens unstyled, several screens
tall. If `PUBLIC_STORE_DOMAIN` isn't your `*.myshopify.com` domain, add `https://your-shop.myshopify.com`
to `connectSrc` too.

Hydrogen's CSP allows scripts by nonce, not inline, so custom JavaScript saved in Zoorix doesn't run on
a Hydrogen storefront. Everything else does.

## 6. Optional: the promotion bar

Anywhere in your layout, e.g. in `app/components/PageLayout.tsx` above `<main>`:

```tsx
<zoorix-promotion-bar />
```

## Markets

`Zoorix.tsx` passes the storefront's `i18n` country and language (the skeleton's `consent` data) to
Zoorix. If you detect the locale per request, prices and currencies follow it.
