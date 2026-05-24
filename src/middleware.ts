import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  adminCookieOptions,
  getAdminUserFromAccessToken,
  refreshAdminSession,
  REFRESH_COOKIE_MAX_AGE,
  type RefreshedSession,
} from "@/lib/adminAuth";

const COMING_SOON_PATH = "/coming-soon";

function isAdminScopedPath(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
}

async function resolveAdminSession(request: NextRequest) {
  const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const user = await getAdminUserFromAccessToken(accessToken);
  if (user) return { user, refreshed: null as RefreshedSession | null };

  const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;
  const refreshed = await refreshAdminSession(refreshToken);
  if (refreshed) return { user: refreshed.user, refreshed };

  return { user: null, refreshed: null };
}

function applyRefreshedCookies(res: NextResponse, refreshed: RefreshedSession) {
  res.cookies.set(ADMIN_ACCESS_COOKIE, refreshed.accessToken, {
    ...adminCookieOptions,
    maxAge: refreshed.expiresIn,
  });
  res.cookies.set(ADMIN_REFRESH_COOKIE, refreshed.refreshToken, {
    ...adminCookieOptions,
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const comingSoonEnabled = process.env.COMING_SOON === "true";

  if (comingSoonEnabled && pathname !== COMING_SOON_PATH && !isAdminScopedPath(pathname)) {
    const { user, refreshed } = await resolveAdminSession(request);
    if (user) {
      const res = NextResponse.next();
      if (refreshed) applyRefreshedCookies(res, refreshed);
      return res;
    }

    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Site is not yet live" }, { status: 503 });
    }
    return NextResponse.redirect(new URL(COMING_SOON_PATH, request.url));
  }

  if (!isAdminScopedPath(pathname)) {
    return NextResponse.next();
  }

  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/admin/accept-invite" ||
    pathname === "/api/admin/accept-invite"
  ) {
    return NextResponse.next();
  }

  const { user, refreshed } = await resolveAdminSession(request);
  if (user) {
    const res = NextResponse.next();
    if (refreshed) applyRefreshedCookies(res, refreshed);
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.[^/]+$).*)",
  ],
};
