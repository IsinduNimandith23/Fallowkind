import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setCommunityBannerUrl } from "@/lib/siteSettings";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const url = (body.url ?? "").trim();

    await setCommunityBannerUrl(url);
    revalidatePath("/community-preview");
    revalidatePath("/community");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
