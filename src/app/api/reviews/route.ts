import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Create a product review. Reviews are stored as pending (approved = false)
// and only shown publicly once an admin approves them from the
// admin → Reviews screen.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const productId = Number(body.productId);
    const name = String(body.name ?? "").trim();
    const rating = Number(body.rating);
    const review = String(body.review ?? "").trim();
    const email = String(body.email ?? "").trim();

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }
    if (!name || !review) {
      return NextResponse.json({ error: "Name and review are required" }, { status: 400 });
    }
    if (name.length > 80) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please choose a rating from 1 to 5" }, { status: 400 });
    }
    if (review.length > 1000) {
      return NextResponse.json({ error: "Review is too long" }, { status: 400 });
    }
    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

    if (productError || !product) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 });
    }

    const { error } = await supabase.from("product_reviews").insert({
      product_id: productId,
      name,
      email: email || null,
      rating,
      review,
      approved: false,
    });

    if (error) {
      console.error("product review insert error:", error);
      return NextResponse.json({ error: "Could not save your review" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
