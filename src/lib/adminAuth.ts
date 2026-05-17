import type { User } from "@supabase/supabase-js";
import { createAuthClient } from "./supabase";

export const ADMIN_ACCESS_COOKIE = "fk_admin";
export const ADMIN_REFRESH_COOKIE = "fk_admin_refresh";

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function isAdmin(user: User): boolean {
  return user.app_metadata?.role === "admin";
}

export async function getAdminUserFromAccessToken(
  accessToken: string | undefined
): Promise<User | null> {
  if (!accessToken) return null;
  const { data, error } = await createAuthClient().auth.getUser(accessToken);
  if (error || !data.user) return null;
  return isAdmin(data.user) ? data.user : null;
}

export type RefreshedSession = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export async function refreshAdminSession(
  refreshToken: string | undefined
): Promise<RefreshedSession | null> {
  if (!refreshToken) return null;
  const { data, error } = await createAuthClient().auth.refreshSession({
    refresh_token: refreshToken,
  });
  if (error || !data.session || !data.user) return null;
  if (!isAdmin(data.user)) return null;
  return {
    user: data.user,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresIn: data.session.expires_in,
  };
}
