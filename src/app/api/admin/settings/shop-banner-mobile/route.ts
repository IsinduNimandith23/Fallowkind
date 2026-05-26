import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setShopBannerMobileUrl } from "@/lib/siteSettings";

export async function PUT(request: Request) {
  try {
    const { url } = (await request.json()) as { url?: string };
    if (typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    await setShopBannerMobileUrl(url.trim());
    revalidatePath("/shop");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
