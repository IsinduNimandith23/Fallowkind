import { NextResponse } from "next/server";
import { refreshInstagramToken } from "@/lib/instagram";

// Admin-triggered token refresh (the "Refresh now" button on the Site page).
// Protected by the admin middleware on /api/admin/*.
export async function POST() {
  const result = await refreshInstagramToken();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true, expiresAt: result.expiresAt });
}
