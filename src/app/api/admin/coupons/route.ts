import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { code, discountType, discountValue, minOrderValue, maxUses, expiresAt } = body;

  if (!code || !discountType || !discountValue) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase.from("coupons").insert({
    code: code.toUpperCase().trim(),
    discount_type: discountType,
    discount_value: parseFloat(discountValue),
    min_order_value: minOrderValue ? parseFloat(minOrderValue) : 0,
    max_uses: maxUses ? parseInt(maxUses) : null,
    expires_at: expiresAt || null,
    active: true,
  });

  if (error) {
    return NextResponse.json(
      { error: error.code === "23505" ? "A coupon with that code already exists" : error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const { id, active } = await request.json();

  const { error } = await supabase
    .from("coupons")
    .update({ active })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
