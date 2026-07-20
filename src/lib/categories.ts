// Garment categories. Server-safe and client-safe - no supabase imports - so
// the admin form, the shop filters and the navbar can share one list.
//
// These strings must match the product `category` values exactly, since the
// shop filters on an exact match. The shop's Category filter merges any other
// value found on a product over this list, so an ad-hoc category typed into the
// admin form still shows up.

export const CATEGORY_OPTIONS = ["T-Shirts", "Shirts"];
