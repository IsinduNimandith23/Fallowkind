import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setSpotlight } from "@/lib/siteSettings";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      imageUrl?: string;
      perk1?: string;
      perk2?: string;
    };

    const name     = (body.name     ?? "").trim();
    const imageUrl = (body.imageUrl ?? "").trim();
    const perk1    = (body.perk1    ?? "").trim();
    const perk2    = (body.perk2    ?? "").trim();

    const MAX = 120;
    if ([name, perk1, perk2].some((s) => s.length > MAX)) {
      return NextResponse.json(
        { error: `Text must be ${MAX} characters or fewer.` },
        { status: 400 },
      );
    }

    await setSpotlight({ name, imageUrl, perk1, perk2 });
    revalidatePath("/fallowfam");
    revalidatePath("/fallowfam-preview");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
