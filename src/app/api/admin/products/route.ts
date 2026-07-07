import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

type ProductPayload = {
  name?: string;
  category?: string;
  price_display?: string;
  price_value?: number;
  original_price?: string | null;
  tag?: string | null;
  description?: string;
  in_stock?: boolean;
  material?: string;
  fit?: string;
  origin?: string;
  colors?: {
    name: string;
    hex: string;
    imageUrl?: string;
    imageUrl2?: string;
    sizes?: string[];
    sizeQuantities?: Record<string, number>;
  }[];
  sizes?: string[];
  size_quantities?: Record<string, number>;
  image_url?: string | null;
  image_url_2?: string | null;
  sort_order?: number;
};

function validate(payload: ProductPayload, requireAll = true): string | null {
  if (requireAll) {
    if (!payload.name?.trim()) return "Name is required";
    if (!payload.category?.trim()) return "Category is required";
    if (!payload.price_display?.trim()) return "Price (display) is required";
    if (typeof payload.price_value !== "number" || payload.price_value < 0)
      return "Price value must be a non-negative number";
  }
  if (payload.colors && !Array.isArray(payload.colors)) return "Colors must be an array";
  if (payload.sizes && !Array.isArray(payload.sizes)) return "Sizes must be an array";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ProductPayload;
    const err = validate(body, true);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: body.name,
        category: body.category,
        price_display: body.price_display,
        price_value: body.price_value,
        original_price: body.original_price || null,
        tag: body.tag || null,
        description: body.description ?? "",
        in_stock: body.in_stock ?? true,
        material: body.material ?? "",
        fit: body.fit ?? "",
        origin: body.origin ?? "",
        colors: body.colors ?? [],
        sizes: body.sizes ?? ["S", "M", "L", "XL", "XXL"],
        size_quantities: body.size_quantities ?? {},
        image_url: body.image_url || null,
        image_url_2: body.image_url_2 || null,
        sort_order: body.sort_order ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Create product error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ id: data.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
