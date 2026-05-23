import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setHeroVideoUrl } from "@/lib/siteSettings";

export async function PUT(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };
    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    await setHeroVideoUrl(url.trim());
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
