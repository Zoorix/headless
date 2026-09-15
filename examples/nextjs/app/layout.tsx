import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { WelcomeToast } from "components/welcome-toast";
import { GeistSans } from "geist/font/sans";
import { getCart } from "lib/shopify";
import { ReactNode, Suspense } from "react";
import { Toaster } from "sonner";
import "./globals.css";
import { baseUrl } from "lib/utils";
import { ZoorixStore } from "components/zoorix/zoorix-store";

const { SITE_NAME } = process.env;

// Zoorix: the script, and the shop domain for <zoorix-store>.
const ZOORIX_SCRIPT =
  "https://admin.zoorix-bundle-kit.com/assets/headless/v1/zoorix.js";
const SHOPIFY_STORE_DOMAIN = (process.env.SHOPIFY_STORE_DOMAIN ?? "").replace(
  /^https?:\/\//,
  "",
);

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: SITE_NAME!,
    template: `%s | ${SITE_NAME}`,
  },
  robots: {
    follow: true,
    index: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();

  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <CartProvider cartPromise={cart}>
          <script async type="module" src={ZOORIX_SCRIPT} />
          <Suspense fallback={null}>
            <ZoorixStore shop={SHOPIFY_STORE_DOMAIN} />
          </Suspense>
          <Navbar />
          <zoorix-promotion-bar />
          <main>
            {children}
            <Toaster closeButton />
            <WelcomeToast />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
