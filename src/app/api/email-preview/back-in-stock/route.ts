import { NextResponse } from "next/server";
import { buildBackInStockEmailHtml } from "@/lib/email";
import { getProductById, getAllProducts } from "@/lib/products";

// Dev-only: renders the customer "back in stock" email so it can be viewed
// in a browser. Pulls a real product (name + image) from the DB so the
// preview matches what shoppers receive. Pass ?id= to pick a product, or
// ?name= / ?image= to override.
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const { searchParams } = new URL(request.url);

  // Resolve a sample product: the one given by ?id=, else the first product.
  const idParam = Number(searchParams.get("id"));
  let product = Number.isInteger(idParam) && idParam > 0 ? await getProductById(idParam) : null;
  if (!product) {
    product = (await getAllProducts())[0] ?? null;
  }

  const html = buildBackInStockEmailHtml({
    product_name: searchParams.get("name") || product?.name || "Tropical Aura Graphic Tee",
    product_id: Number(searchParams.get("id")) || product?.id || 1,
    image_url: searchParams.get("image") || product?.imageUrl,
  });

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
