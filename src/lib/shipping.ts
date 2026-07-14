// Shipping fee rules, shared by the cart, checkout page and checkout API so the
// amount is computed identically everywhere.

/** Base island-wide shipping charge (Rs.). */
export const BASE_SHIPPING = 425;

/** Extra charged when an order is heavy enough to cross the next weight tier. */
export const BULK_SURCHARGE = 100;

/** Ordering this many tees (or more) tips the parcel over 1 kg. */
export const BULK_THRESHOLD = 5;

/** Total shipping charge for an order with the given total item quantity. */
export function computeShipping(totalQuantity: number): number {
  return BASE_SHIPPING + (totalQuantity >= BULK_THRESHOLD ? BULK_SURCHARGE : 0);
}
