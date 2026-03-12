declare global {
  interface Window {
    gtag: (...args: [string, ...unknown[]]) => void;
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CURRENCY = "INR";

function isGtagAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

// ── Core ─────────────────────────────────────────────────────────────────────

export function pageView(url: string): void {
  if (!isGtagAvailable()) return;
  window.gtag("config", GA_ID as string, { page_path: url });
}

export function trackEvent(
  action: string,
  params?: Record<string, unknown>,
): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", action, params);
}

// ── E-commerce events ────────────────────────────────────────────────────────

export function trackViewItem(product: {
  id: string;
  title: string;
  price: number;
  category: string;
}): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "view_item", {
    currency: CURRENCY,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        price: product.price,
        item_category: product.category,
      },
    ],
  });
}

export function trackAddToCart(
  product: { id: string; title: string; price: number; category: string },
  quantity: number = 1,
): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "add_to_cart", {
    currency: CURRENCY,
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        price: product.price,
        item_category: product.category,
        quantity,
      },
    ],
  });
}

export function trackRemoveFromCart(product: {
  id: string;
  title: string;
  price: number;
}): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "remove_from_cart", {
    currency: CURRENCY,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        price: product.price,
      },
    ],
  });
}

export function trackViewItemList(
  category: string,
  products: { id: string; title: string; price: number }[],
): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "view_item_list", {
    item_list_id: category,
    item_list_name: category,
    items: products.map((p, index) => ({
      item_id: p.id,
      item_name: p.title,
      price: p.price,
      index,
    })),
  });
}

export function trackBeginCheckout(
  total: number,
  itemCount: number,
): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "begin_checkout", {
    currency: CURRENCY,
    value: total,
    items: [{ quantity: itemCount }],
  });
}

export function trackPurchase(
  orderId: string,
  total: number,
  items: { id: string; title: string; price: number; quantity: number }[],
): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "purchase", {
    transaction_id: orderId,
    currency: CURRENCY,
    value: total,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.title,
      price: item.price,
      quantity: item.quantity,
    })),
  });
}

export function trackSearch(query: string): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "search", { search_term: query });
}

export function trackAddToWishlist(product: {
  id: string;
  title: string;
  price: number;
}): void {
  if (!isGtagAvailable()) return;
  window.gtag("event", "add_to_wishlist", {
    currency: CURRENCY,
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        price: product.price,
      },
    ],
  });
}
