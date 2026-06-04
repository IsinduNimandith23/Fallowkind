import { NextResponse } from "next/server";
import { supabase, createAuthClient } from "@/lib/supabase";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  adminCookieOptions,
  REFRESH_COOKIE_MAX_AGE,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  const { token_hash, password } = await request.json();

  if (!token_hash || !password) {
    return NextResponse.json(
      { error: "Invite token and password are required" },
      { status: 400 }
    );
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const { data: verifyData, error: verifyError } = await createAuthClient().auth.verifyOtp({
    token_hash,
    type: "invite",
  });

  if (verifyError || !verifyData.session || !verifyData.user) {
    return NextResponse.json(
      { error: "This invite link is invalid or has expired" },
      { status: 401 }
    );
  }

  if (verifyData.user.app_metadata?.role !== "admin") {
    return NextResponse.json(
      { error: "This account does not have admin access" },
      { status: 403 }
    );
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    verifyData.user.id,
    { password }
  );

  if (updateError) {
    return NextResponse.json(
      { error: "Could not set password - try again" },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_ACCESS_COOKIE, verifyData.session.access_token, {
    ...adminCookieOptions,
    maxAge: verifyData.session.expires_in,
  });
  response.cookies.set(ADMIN_REFRESH_COOKIE, verifyData.session.refresh_token, {
    ...adminCookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
  return response;
}
