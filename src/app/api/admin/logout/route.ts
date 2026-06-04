import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;

  if (accessToken) {
    // Best-effort: revoke the session in Supabase. Ignore failures - we still
    // want to clear the cookies even if the token is already expired.
    await supabase.auth.admin.signOut(accessToken).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, "", { maxAge: 0, path: "/" });
  response.cookies.set(ADMIN_REFRESH_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}
