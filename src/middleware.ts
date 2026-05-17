import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  adminCookieOptions,
  getAdminUserFromAccessToken,
  refreshAdminSession,
  REFRESH_COOKIE_MAX_AGE,
} from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/admin/accept-invite" ||
    pathname === "/api/admin/accept-invite"
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;

  const user = await getAdminUserFromAccessToken(accessToken);
  if (user) {
    return NextResponse.next();
  }

  const refreshed = await refreshAdminSession(refreshToken);
  if (refreshed) {
    const res = NextResponse.next();
    res.cookies.set(ADMIN_ACCESS_COOKIE, refreshed.accessToken, {
      ...adminCookieOptions,
      maxAge: refreshed.expiresIn,
    });
    res.cookies.set(ADMIN_REFRESH_COOKIE, refreshed.refreshToken, {
      ...adminCookieOptions,
      maxAge: REFRESH_COOKIE_MAX_AGE,
    });
    return res;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const res = NextResponse.redirect(new URL("/admin/login", request.url));
  res.cookies.delete(ADMIN_ACCESS_COOKIE);
  res.cookies.delete(ADMIN_REFRESH_COOKIE);
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
