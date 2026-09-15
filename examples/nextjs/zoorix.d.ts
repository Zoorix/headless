// JSX types for the Zoorix elements. See CONTRACT.md in zoorix/headless.
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ZoorixElement<Attributes = {}> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  Attributes;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "zoorix-store": ZoorixElement<{
        shop: string;
        "cart-id": string;
        "cart-updated-at"?: string;
        country?: string;
        language?: string;
        "product-path"?: string;
      }>;
      "zoorix-offers": ZoorixElement<{
        "product-id"?: string;
        "variant-id"?: string;
        cart?: boolean;
      }>;
      "zoorix-promotion-bar": ZoorixElement;
      "zoorix-cart-button": ZoorixElement;
    }
  }
}
