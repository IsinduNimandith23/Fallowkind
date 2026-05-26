import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setOurStoryImageUrl, type OurStoryImageKey } from "@/lib/siteSettings";

const VALID_KEYS: OurStoryImageKey[] = ["beginning", "principle1", "principle2", "principle3"];

function isValidKey(value: unknown): value is OurStoryImageKey {
  return typeof value === "string" && (VALID_KEYS as string[]).includes(value);
}

export async function PUT(request: Request) {
  try {
    const { key, url } = (await request.json()) as { key?: string; url?: string };
    if (!isValidKey(key)) {
      return NextResponse.json({ error: "Invalid image key" }, { status: 400 });
    }
    if (typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    await setOurStoryImageUrl(key, url.trim());
    revalidatePath("/our-story");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
