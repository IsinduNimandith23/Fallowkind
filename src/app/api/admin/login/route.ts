import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  adminCookieOptions,
  REFRESH_COOKIE_MAX_AGE,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const { data, error } = await createAuthClient().auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  if (data.user.app_metadata?.role !== "admin") {
    return NextResponse.json(
      { error: "This account does not have admin access" },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token, {
    ...adminCookieOptions,
    maxAge: data.session.expires_in,
  });
  response.cookies.set(ADMIN_REFRESH_COOKIE, data.session.refresh_token, {
    ...adminCookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
  return response;
}
