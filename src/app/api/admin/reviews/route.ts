import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Approve (publish) a pending review. PATCH { id, approved }
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  const approved = Boolean(body.approved);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const { error } = await supabase
    .from("product_reviews")
    .update({ approved })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// Permanently delete a review. DELETE { id }
export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid review" }, { status: 400 });
  }

  const { error } = await supabase.from("product_reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
