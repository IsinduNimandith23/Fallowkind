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

// ── Per-colour stock ────────────────────────────────────────────────
// Products can track stock per colour. Each colour then carries its own
// available `sizes` list and `sizeQuantities` map (same shape as the
// product-level fields). These helpers are pure so they can be shared by the
// admin form (client), the storefront, and the checkout route (server).

// The minimal colour shape these helpers operate on. Kept local so stock.ts
// stays free of the products.ts import cycle.
export type ColorStock = {
  name: string;
  sizes?: string[];
  sizeQuantities?: SizeQuantities;
};

// A product tracks stock per colour when at least one colour carries a `sizes`
// array. The admin form writes per-colour data for every colour at once, so in
// practice this is all-or-nothing.
export function hasPerColorStock(colors: ColorStock[]): boolean {
  return colors.some((c) => Array.isArray(c.sizes));
}

// Roll per-colour stock up into the product-level aggregate used by the shop
// grid, filters, restock logic and metadata.
// - sizes: the union of every colour's available sizes (sorted).
// - sizeQuantities: summed per size, but ONLY when every colour that offers
//   that size tracks it. If any offering colour leaves it untracked (unlimited)
//   the size is omitted, so productLowStockLabel never shows a wrong total.
// - inStock: true when any colour has at least one available size.
export function aggregateColorStock(colors: ColorStock[]): {
  sizes: string[];
  sizeQuantities: SizeQuantities;
  inStock: boolean;
} {
  const sizeSet = new Set<string>();
  const totals: SizeQuantities = {};
  const untracked = new Set<string>();

  for (const c of colors) {
    for (const s of c.sizes ?? []) {
      sizeSet.add(s);
      const n = c.sizeQuantities?.[s];
      if (typeof n === "number") totals[s] = (totals[s] ?? 0) + n;
      else untracked.add(s); // this colour offers `s` with no count = unlimited
    }
  }

  const sizes = [...sizeSet].sort();
  const sizeQuantities: SizeQuantities = {};
  for (const s of sizes) {
    if (!untracked.has(s) && s in totals) sizeQuantities[s] = totals[s];
  }

  return { sizes, sizeQuantities, inStock: sizes.length > 0 };
}

// Reduce one colour/size's tracked count by `qty` (clamped at 0), dropping the
// size from that colour's available `sizes` when it reaches 0. No-op for
// untracked sizes (unlimited) and unknown colours. Returns a new array.
export function applyColorDecrement<T extends ColorStock>(
  colors: T[],
  colorName: string,
  size: string,
  qty: number
): T[] {
  return colors.map((c) => {
    if (c.name !== colorName) return c;
    const current = c.sizeQuantities?.[size];
    if (typeof current !== "number") return c; // untracked = unlimited
    const next = Math.max(0, current - qty);
    const sizeQuantities = { ...c.sizeQuantities, [size]: next };
    const sizes = next === 0 ? (c.sizes ?? []).filter((s) => s !== size) : c.sizes;
    return { ...c, sizeQuantities, sizes };
  });
}
