import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  const { code, subtotal } = await request.json();

  if (!code || typeof subtotal !== "number") {
    return NextResponse.json({ valid: false, error: "Invalid request" }, { status: 400 });
  }

  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("active", true)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "This coupon has expired" });
  }

  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, error: "This coupon has reached its usage limit" });
  }

  if (subtotal < coupon.min_order_value) {
    return NextResponse.json({
      valid: false,
      error: `Minimum order value for this coupon is Rs. ${coupon.min_order_value.toLocaleString("en-LK")}`,
    });
  }

  const discountAmount =
    coupon.discount_type === "percentage"
      ? Math.round((subtotal * coupon.discount_value) / 100)
      : Math.min(coupon.discount_value, subtotal);

  return NextResponse.json({
    valid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      discountAmount,
    },
  });
}
