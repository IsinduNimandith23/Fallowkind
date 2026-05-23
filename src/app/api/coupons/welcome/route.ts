import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("coupons")
    .select("code, discount_type, discount_value, min_order_value, max_uses, used_count, expires_at")
    .eq("active", true)
    .ilike("code", "WELCOME%")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ available: false });
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ available: false });
  }

  if (data.max_uses !== null && data.used_count >= data.max_uses) {
    return NextResponse.json({ available: false });
  }

  const remaining =
    data.max_uses !== null ? Math.max(0, data.max_uses - data.used_count) : null;

  return NextResponse.json({
    available: true,
    coupon: {
      code: data.code,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      minOrderValue: data.min_order_value,
      remaining,
    },
  });
}
