import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendRestockRequestEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = Number(body.productId);
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    // One row per (product, email). Re-submitting the same email is a no-op.
    const { error } = await supabase
      .from("restock_notifications")
      .upsert(
        { product_id: productId, email, notified: false },
        { onConflict: "product_id,email", ignoreDuplicates: true }
      );

    if (error) {
      console.error("restock notify insert error:", error);
      return NextResponse.json({ error: "Could not save your request" }, { status: 500 });
    }

    // Heads-up to the owner is best-effort — the request is already saved.
    try {
      await sendRestockRequestEmail({
        product_name: product.name as string,
        product_id: productId,
        email,
      });
    } catch (e) {
      console.error("restock notify email error:", e);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
