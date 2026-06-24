import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { setImpactStats, IMPACT_STAT_COUNT, type ImpactStat } from "@/lib/siteSettings";

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { stats?: ImpactStat[] };
    const input = Array.isArray(body.stats) ? body.stats : [];

    const MAX = 120;
    const stats: ImpactStat[] = Array.from({ length: IMPACT_STAT_COUNT }, (_, i) => ({
      value: (input[i]?.value ?? "").trim(),
      label: (input[i]?.label ?? "").trim(),
    }));

    if (stats.some((s) => s.value.length > MAX || s.label.length > MAX)) {
      return NextResponse.json(
        { error: `Text must be ${MAX} characters or fewer.` },
        { status: 400 },
      );
    }

    await setImpactStats(stats);
    revalidatePath("/fallowfam");
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Failed to update";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
