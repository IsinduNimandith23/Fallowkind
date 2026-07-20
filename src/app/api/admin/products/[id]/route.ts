import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { sendBackInStockEmail } from "@/lib/email";
import { isGender } from "@/lib/gender";

type Params = { params: Promise<{ id: string }> };

// A product is buyable only when it's flagged in stock AND has at least one
// available size - same rule the storefront uses to show the restock sign-up.
function isAvailable(inStock: boolean, sizes: unknown): boolean {
  return Boolean(inStock) && Array.isArray(sizes) && sizes.length > 0;
}

// Email everyone on a product's restock waiting list, then mark them so they
// are never emailed twice. Best-effort: failures are logged, not thrown.
async function notifyRestockWaitlist(
  productId: number,
  productName: string,
  imageUrl: string | null
) {
  const { data: waiters, error } = await supabase
    .from("restock_notifications")
    .select("id, email")
    .eq("product_id", productId)
    .eq("notified", false);

  if (error || !waiters?.length) {
    if (error) console.error("restock waitlist fetch error:", error);
    return;
  }

  const results = await Promise.allSettled(
    waiters.map((w) =>
      sendBackInStockEmail({
        product_name: productName,
        product_id: productId,
        to: w.email as string,
        image_url: imageUrl ?? undefined,
      })
    )
  );

  // Only mark the ones that actually sent, so failures can retry next restock.
  const sentIds = waiters
    .filter((_, i) => results[i].status === "fulfilled")
    .map((w) => w.id);

  if (sentIds.length) {
    const { error: markError } = await supabase
      .from("restock_notifications")
      .update({ notified: true })
      .in("id", sentIds);
    if (markError) console.error("restock waitlist mark error:", markError);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  const fields = [
    "name", "category", "gender", "price_display", "price_value",
    "original_price", "tag", "description", "in_stock",
    "material", "fit", "origin",
    "colors", "sizes", "size_quantities", "image_url", "image_url_2", "sort_order",
  ];
  for (const f of fields) {
    if (f in body) allowed[f] = body[f];
  }
  // Normalize empty strings on nullable text fields
  for (const f of ["original_price", "tag", "image_url", "image_url_2"]) {
    if (allowed[f] === "") allowed[f] = null;
  }

  // gender is NOT NULL with a CHECK constraint - reject bad values here so the
  // caller gets a 400 instead of a Postgres error.
  if ("gender" in allowed && !isGender(allowed.gender as string)) {
    return NextResponse.json(
      { error: "Gender must be Men, Women or Unisex" },
      { status: 400 }
    );
  }

  // Snapshot availability before the update so we can detect a sold-out →
  // back-in-stock transition and email the waiting list.
  const { data: before } = await supabase
    .from("products")
    .select("name, in_stock, sizes, image_url")
    .eq("id", numericId)
    .maybeSingle();

  const { error } = await supabase
    .from("products")
    .update(allowed)
    .eq("id", numericId);

  if (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Merge the update over the prior row to get the resulting state.
  if (before) {
    const wasAvailable = isAvailable(before.in_stock, before.sizes);
    const nowInStock = "in_stock" in allowed ? Boolean(allowed.in_stock) : before.in_stock;
    const nowSizes = "sizes" in allowed ? allowed.sizes : before.sizes;
    const nowAvailable = isAvailable(nowInStock, nowSizes);

    if (!wasAvailable && nowAvailable) {
      const name = ("name" in allowed ? String(allowed.name) : before.name) as string;
      const image = ("image_url" in allowed ? (allowed.image_url as string | null) : before.image_url);
      await notifyRestockWaitlist(numericId, name, image);
    }
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
