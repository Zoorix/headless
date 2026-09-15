/**
 * Zoorix for Hydrogen: https://github.com/Zoorix/headless/tree/main/hydrogen
 *
 * Copy this file to app/components/Zoorix.tsx. The README next to it shows where to use it.
 */
import {useEffect, useRef, type DetailedHTMLProps, type HTMLAttributes} from 'react';
import {useFetcher, useRevalidator} from 'react-router';
import {CartForm} from '@shopify/hydrogen';

/** Add to your Content Security Policy in entry.server.tsx. */
export const ZOORIX_ORIGIN = 'https://admin.zoorix-bundle-kit.com';
const ZOORIX_SCRIPT = `${ZOORIX_ORIGIN}/assets/headless/v1/zoorix.js`;

type ZoorixProps = {
  /** Your *.myshopify.com domain. */
  shop: string;
  /** The root loader's cart, resolved. */
  cart: {id: string; updatedAt: string} | null;
  country?: string;
  language?: string;
};

/** Once, in root.tsx: loads Zoorix and keeps it in step with Hydrogen's cart. */
export function Zoorix({shop, cart, country, language}: ZoorixProps) {
  const {revalidate} = useRevalidator();
  const fetcher = useFetcher();
  const cartRequested = useRef(false);

  // The script loads after hydration, so Zoorix never fills a tag React hasn't hydrated yet.
  // (Hydrogen's <Script waitForHydration> inserts a classic script; zoorix.js is a module.)
  useEffect(() => {
    if (document.querySelector(`script[src="${ZOORIX_SCRIPT}"]`)) return;
    const script = document.createElement('script');
    script.type = 'module';
    script.src = ZOORIX_SCRIPT;
    document.head.appendChild(script);
  }, []);

  // Zoorix changed the cart and the change has settled: reload the cart.
  useEffect(() => {
    const onCartChanged = () => void revalidate();
    window.addEventListener('zrx:cart-changed', onCartChanged);
    return () => window.removeEventListener('zrx:cart-changed', onCartChanged);
  }, [revalidate]);

  // Zoorix works on your cart, and a new visitor has none yet. Create it through the cart
  // route, which sets the cart cookie; the root loader then returns it.
  useEffect(() => {
    if (cart || cartRequested.current) return;
    cartRequested.current = true;
    void fetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.BuyerIdentityUpdate,
          inputs: {buyerIdentity: {countryCode: country}},
        }),
      },
      {method: 'POST', action: '/cart'},
    );
  }, [cart, country, fetcher]);

  if (!cart) return null;

  return (
    <zoorix-store
      shop={shop}
      cart-id={cart.id}
      cart-updated-at={cart.updatedAt}
      country={country}
      language={language}
    />
  );
}

type ZoorixElement<Attributes = {}> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Attributes;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'zoorix-store': ZoorixElement<{
        shop: string;
        'cart-id': string;
        'cart-updated-at'?: string;
        country?: string;
        language?: string;
        'product-path'?: string;
      }>;
      'zoorix-offers': ZoorixElement<{
        'product-id'?: string;
        'variant-id'?: string;
        cart?: boolean;
      }>;
      'zoorix-promotion-bar': ZoorixElement;
      'zoorix-cart-button': ZoorixElement;
    }
  }
}
