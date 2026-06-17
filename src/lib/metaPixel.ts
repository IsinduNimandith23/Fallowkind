// Meta (Facebook) Pixel helpers.
//
// The base pixel script lives in src/app/layout.tsx and defines `window.fbq`.
// These helpers fire standard e-commerce events so the pixel can optimise the
// ad campaign for real conversions (not just page views).
//
// All values are in LKR - the store's only currency.

const CURRENCY = "LKR";

type Fbq = (...args: unknown[]) => void;

type PixelContent = {
  id: string;
  quantity: number;
  item_price: number;
};

function fbq(): Fbq | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { fbq?: Fbq }).fbq;
}

/** Low-level: fire a standard Meta Pixel event. Safe to call before fbq loads (it queues). */
export function trackPixel(event: string, params?: Record<string, unknown>) {
  fbq()?.("track", event, params);
}

/** Viewing a single product page. */
export function trackViewContent(args: {
  id: number | string;
  name: string;
  category?: string;
  value: number;
}) {
  trackPixel("ViewContent", {
    content_type: "product",
    content_ids: [String(args.id)],
    content_name: args.name,
    content_category: args.category,
    value: args.value,
    currency: CURRENCY,
  });
}

/** Adding an item to the cart. */
export function trackAddToCart(args: {
  id: number | string;
  name: string;
  category?: string;
  quantity: number;
  value: number;
}) {
  trackPixel("AddToCart", {
    content_type: "product",
    content_ids: [String(args.id)],
    content_name: args.name,
    content_category: args.category,
    contents: [{ id: String(args.id), quantity: args.quantity }],
    value: args.value,
    currency: CURRENCY,
  });
}

/** Starting the checkout flow. */
export function trackInitiateCheckout(args: {
  contents: PixelContent[];
  numItems: number;
  value: number;
}) {
  trackPixel("InitiateCheckout", {
    content_type: "product",
    content_ids: args.contents.map((c) => c.id),
    contents: args.contents,
    num_items: args.numItems,
    value: args.value,
    currency: CURRENCY,
  });
}

/** A completed purchase - the most important event for ad optimisation. */
export function trackPurchase(args: {
  contents: PixelContent[];
  numItems: number;
  value: number;
  orderId?: string;
}) {
  trackPixel("Purchase", {
    content_type: "product",
    content_ids: args.contents.map((c) => c.id),
    contents: args.contents,
    num_items: args.numItems,
    value: args.value,
    currency: CURRENCY,
    order_id: args.orderId,
  });
}
