import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

// Approve (publish) a pending community story. PATCH { id, approved }
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);
  const approved = Boolean(body.approved);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid story" }, { status: 400 });
  }

  const { error } = await supabase
    .from("community_reviews")
    .update({ approved })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Bust the cached public community page so the change shows immediately.
  revalidatePath("/fallowfam");

  return NextResponse.json({ success: true });
}

// Permanently delete a community story. DELETE { id }
export async function DELETE(request: Request) {
  const body = await request.json().catch(() => ({}));
  const id = Number(body.id);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid story" }, { status: 400 });
  }

  const { error } = await supabase.from("community_reviews").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Bust the cached public community page so the change shows immediately.
  revalidatePath("/fallowfam");

  return NextResponse.json({ success: true });
}
