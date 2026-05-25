import { supabase } from "./supabase";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductDetails = {
  material: string;
  fit: string;
  origin: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  priceValue: number;
  originalPrice?: string;
  tag?: string;
  description: string;
  colors: ProductColor[];
  sizes: string[];
  inStock: boolean;
  imageUrl?: string;
  imageUrl2?: string;
  details: ProductDetails;
};

type ProductRow = {
  id: number;
  name: string;
  category: string;
  price_display: string;
  price_value: number;
  original_price: string | null;
  tag: string | null;
  description: string;
  in_stock: boolean;
  material: string;
  fit: string;
  origin: string;
  colors: ProductColor[] | null;
  sizes: string[] | null;
  image_url: string | null;
  image_url_2: string | null;
  sort_order: number;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price_display,
    priceValue: Number(row.price_value),
    originalPrice: row.original_price ?? undefined,
    tag: row.tag ?? undefined,
    description: row.description,
    colors: row.colors ?? [],
    sizes: sortSizes(row.sizes ?? []),
    inStock: row.in_stock,
    imageUrl: row.image_url ?? undefined,
    imageUrl2: row.image_url_2 ?? undefined,
    details: {
      material: row.material,
      fit: row.fit,
      origin: row.origin,
    },
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("getAllProducts error:", error);
    return [];
  }
  return (data as ProductRow[]).map(rowToProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return rowToProduct(data as ProductRow);
}
