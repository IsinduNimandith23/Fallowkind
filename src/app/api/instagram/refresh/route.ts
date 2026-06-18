import { NextResponse } from "next/server";
import { refreshInstagramToken } from "@/lib/instagram";

// Scheduled endpoint (Vercel Cron) that refreshes the Instagram long-lived
// token and persists it. Also callable manually for testing.
//
// Auth: if CRON_SECRET is set, the request must include it. Vercel Cron sends
// it automatically as `Authorization: Bearer <CRON_SECRET>`; for manual calls
// you can pass `?secret=<CRON_SECRET>` instead.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const provided =
      auth?.replace(/^Bearer\s+/i, "") ??
      new URL(request.url).searchParams.get("secret") ??
      "";
    if (provided !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const result = await refreshInstagramToken();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, expiresAt: result.expiresAt });
}
