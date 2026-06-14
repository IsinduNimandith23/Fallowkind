// Low-stock display helpers. Kept free of any supabase import so client
// components (ShopGrid, ProductDetail) can value-import from here safely.

// Show the "Only X left" urgency badge when stock is at or below this.
export const LOW_STOCK_THRESHOLD = 3;

// Per-size remaining counts, e.g. { S: 3, M: 0, L: 10 }. A size absent from
// the map is untracked (treated as unlimited).
export type SizeQuantities = Record<string, number>;

// Returns a label like "Only 3 left" when a single count is low (1..threshold),
// or null when it's untracked, healthy, or zero.
export function lowStockLabel(qty?: number | null): string | null {
  if (qty == null) return null;
  if (qty <= 0 || qty > LOW_STOCK_THRESHOLD) return null;
  return `Only ${qty} left`;
}

// Product-level label for the shop grid (no size is selected there).
// Only returns a label when EVERY in-stock size is tracked, so the combined
// total is meaningful; if any in-stock size is untracked it returns null.
export function productLowStockLabel(
  sizes: string[],
  sizeQuantities?: SizeQuantities | null
): string | null {
  if (!sizes.length) return null;
  const q = sizeQuantities ?? {};
  let total = 0;
  for (const s of sizes) {
    const n = q[s];
    if (typeof n !== "number") return null; // an in-stock size is untracked
    total += n;
  }
  return lowStockLabel(total);
}
