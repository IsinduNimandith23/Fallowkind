import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

// Persist a new display order. The body carries the product ids in the exact
// order they should appear (top → bottom); we write each row's index into
// sort_order so the storefront (which orders by sort_order asc) matches.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ids: unknown = body?.ids;
    if (
      !Array.isArray(ids) ||
      ids.length === 0 ||
      ids.some((id) => !Number.isFinite(Number(id)))
    ) {
      return NextResponse.json(
        { error: "ids must be a non-empty array of product ids" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      ids.map((id, index) =>
        supabase
          .from("products")
          .update({ sort_order: index })
          .eq("id", Number(id))
      )
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) {
      console.error("Reorder products error:", failed.error);
      return NextResponse.json({ error: failed.error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
