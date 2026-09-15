# Plain HTML example

One page, no build step, every step of the [guide](../../README.md) in about 200 lines. It creates
a cart with the Storefront API, shows a product with its Zoorix offers, and has controls to exercise
the contract:

- **Load** another product, or pick a **variant**: `<zoorix-offers>` follows its attributes.
- Switch **country**: `<zoorix-store country>` and the cart's buyer identity change together.
- **Add this variant without Zoorix**: a cart change the storefront makes itself. The new `updatedAt`
  goes into `cart-updated-at`, and Zoorix refetches.
- Add an offer: Zoorix fires `zrx:cart-changed`, and the page refetches its cart.

## Run it

1. Save your storefront's **public** Storefront API token in Zoorix → Settings → Headless storefront.
2. Serve this folder over HTTP, e.g. `python3 -m http.server 8080`.
3. Open `http://localhost:8080/?shop=your-shop.myshopify.com&token=your-public-token`, or edit `SHOP`
   and `TOKEN` at the top of the script.

Add `&product=a-handle` to start on a specific product.
