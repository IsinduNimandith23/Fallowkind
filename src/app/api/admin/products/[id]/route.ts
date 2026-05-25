import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  const fields = [
    "name", "category", "price_display", "price_value",
    "original_price", "tag", "description", "in_stock",
    "material", "fit", "origin",
    "colors", "sizes", "image_url", "image_url_2", "sort_order",
  ];
  for (const f of fields) {
    if (f in body) allowed[f] = body[f];
  }
  // Normalize empty strings on nullable text fields
  for (const f of ["original_price", "tag", "image_url", "image_url_2"]) {
    if (allowed[f] === "") allowed[f] = null;
  }

  const { error } = await supabase
    .from("products")
    .update(allowed)
    .eq("id", numericId);

  if (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${numericId}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", numericId);

  if (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/shop/${numericId}`);
  return NextResponse.json({ ok: true });
}
