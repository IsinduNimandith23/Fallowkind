import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setHeroText } from "@/lib/siteSettings";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      eyebrow?: string;
      headingLine1?: string;
      headingLine2?: string;
    };

    const eyebrow      = (body.eyebrow      ?? "").trim();
    const headingLine1 = (body.headingLine1 ?? "").trim();
    const headingLine2 = (body.headingLine2 ?? "").trim();

    if (!headingLine1 && !headingLine2) {
      return NextResponse.json(
        { error: "At least one heading line is required." },
        { status: 400 },
      );
    }

    const MAX = 120;
    if (eyebrow.length > MAX || headingLine1.length > MAX || headingLine2.length > MAX) {
      return NextResponse.json(
        { error: `Text must be ${MAX} characters or fewer.` },
        { status: 400 },
      );
    }

    await setHeroText({ eyebrow, headingLine1, headingLine2 });
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
