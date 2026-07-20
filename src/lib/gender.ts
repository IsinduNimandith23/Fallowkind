// Gender audience for a product. Kept free of any server-only imports so both
// the admin form and the storefront grid can pull from it.

export const GENDER_OPTIONS = ["Men", "Women", "Unisex"] as const;

export type Gender = (typeof GENDER_OPTIONS)[number];

export const DEFAULT_GENDER: Gender = "Unisex";

export function isGender(value: string | null | undefined): value is Gender {
  return !!value && (GENDER_OPTIONS as readonly string[]).includes(value);
}

// Normalize a query-string value ("men", "WOMEN") to a canonical Gender.
export function parseGender(value: string | null | undefined): Gender | null {
  if (!value) return null;
  const match = GENDER_OPTIONS.find(
    (g) => g.toLowerCase() === value.trim().toLowerCase()
  );
  return match ?? null;
}

// Men and Women both include Unisex pieces, since most of the range is cut to
// be worn by anyone. Selecting Unisex narrows to only the unisex pieces.
export function genderMatches(productGender: string, selected: Gender): boolean {
  if (selected === "Unisex") return productGender === "Unisex";
  return productGender === selected || productGender === "Unisex";
}
