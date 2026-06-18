// Instagram feed via the Instagram Graph API.
//
// Token handling:
//   The long-lived access token is stored in the `site_settings` table
//   (instagram_access_token) and kept fresh by the scheduled refresh route
//   (/api/instagram/refresh). The INSTAGRAM_ACCESS_TOKEN env var is used as the
//   initial seed / fallback when nothing is stored yet.
//
// Optional env vars (depend on how the Meta app is set up):
//   INSTAGRAM_USER_ID        IG user id (default "me" - works with Instagram
//                            Login tokens; for Facebook Login set the ig-user-id)
//   INSTAGRAM_GRAPH_HOST     "graph.instagram.com" (default, Instagram Login) or
//                            "graph.facebook.com"  (Facebook Login)

import { supabase } from "./supabase";

export type InstagramMedia = {
  id: string;
  caption: string | null;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl: string;
  thumbnailUrl: string | null;
  permalink: string;
  timestamp: string;
};

type RawMedia = {
  id: string;
  caption?: string;
  media_type: InstagramMedia["mediaType"];
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

const GRAPH_HOST = process.env.INSTAGRAM_GRAPH_HOST || "graph.instagram.com";
const USER_ID = process.env.INSTAGRAM_USER_ID || "me";
const FIELDS =
  "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

// Facebook-login setups use a Page access token (graph.facebook.com) which is
// non-expiring, so it can't (and needn't) be refreshed like an Instagram-login
// token. Instagram-login setups use graph.instagram.com and a 60-day token.
const USES_FACEBOOK_LOGIN = GRAPH_HOST.includes("facebook");

/**
 * The active access token: prefer the one persisted in `site_settings`
 * (kept fresh by the refresh cron); fall back to the env seed. Returns null
 * when neither is available so callers can render a fallback.
 */
async function getActiveToken(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("instagram_access_token")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data?.instagram_access_token) {
      return data.instagram_access_token as string;
    }
  } catch {
    // table/column may not exist yet (migration not run) - fall back to env
  }
  return process.env.INSTAGRAM_ACCESS_TOKEN ?? null;
}

/**
 * Fetch media where the account has been *tagged* (UGC from customers), not the
 * account's own posts. Uses the /tags edge (requires instagram_manage_comments).
 * Cached + revalidated by Next (ISR) so the feed auto-updates on a schedule.
 * Returns [] on any failure (missing token, API error) so callers can fall back.
 */
export async function getInstagramFeed(limit = 8): Promise<InstagramMedia[]> {
  const token = await getActiveToken();
  if (!token) return [];

  const url =
    `https://${GRAPH_HOST}/${USER_ID}/tags` +
    `?fields=${FIELDS}&limit=${limit}&access_token=${token}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Instagram feed fetch failed:", res.status, detail);
      return [];
    }
    const json = (await res.json()) as { data?: RawMedia[] };
    const data = Array.isArray(json.data) ? json.data : [];
    return data.map((m) => ({
      id: m.id,
      caption: m.caption ?? null,
      mediaType: m.media_type,
      mediaUrl: m.media_url,
      thumbnailUrl: m.thumbnail_url ?? null,
      permalink: m.permalink,
      timestamp: m.timestamp,
    }));
  } catch (err) {
    console.error("Instagram feed error:", err);
    return [];
  }
}

export type InstagramTokenStatus = {
  configured: boolean;
  source: "database" | "env" | "none";
  expiresAt: string | null;
  daysLeft: number | null;
  // false for non-expiring Facebook-login Page tokens (no refresh needed)
  refreshable: boolean;
};

/** Where the active token comes from and (if persisted) when it expires. */
export async function getInstagramTokenStatus(): Promise<InstagramTokenStatus> {
  const refreshable = !USES_FACEBOOK_LOGIN;

  let dbToken: string | null = null;
  let expiresAt: string | null = null;
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("instagram_access_token, instagram_token_expires_at")
      .eq("id", 1)
      .maybeSingle();
    dbToken = (data?.instagram_access_token as string | null) ?? null;
    expiresAt = (data?.instagram_token_expires_at as string | null) ?? null;
  } catch {
    // migration 018 not run yet
  }

  if (dbToken) {
    const daysLeft = expiresAt
      ? Math.round((Date.parse(expiresAt) - Date.now()) / 86_400_000)
      : null;
    return { configured: true, source: "database", expiresAt, daysLeft, refreshable };
  }
  if (process.env.INSTAGRAM_ACCESS_TOKEN) {
    return { configured: true, source: "env", expiresAt: null, daysLeft: null, refreshable };
  }
  return { configured: false, source: "none", expiresAt: null, daysLeft: null, refreshable };
}

export type RefreshResult =
  | { ok: true; expiresAt: string | null; note?: string }
  | { ok: false; error: string };

/**
 * Refresh the long-lived Instagram Login token (extends it ~60 days) and
 * persist the new token + expiry to `site_settings`. Designed to be called from
 * the scheduled /api/instagram/refresh route. Only valid for
 * graph.instagram.com tokens.
 */
export async function refreshInstagramToken(): Promise<RefreshResult> {
  if (USES_FACEBOOK_LOGIN) {
    return {
      ok: true,
      expiresAt: null,
      note: "Facebook Page token is non-expiring - no refresh needed.",
    };
  }

  const token = await getActiveToken();
  if (!token) return { ok: false, error: "No Instagram token configured" };

  const url =
    `https://graph.instagram.com/refresh_access_token` +
    `?grant_type=ig_refresh_token&access_token=${token}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const json = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
      error?: { message?: string };
    };
    if (!res.ok || !json.access_token) {
      return {
        ok: false,
        error: json.error?.message || `Refresh failed (${res.status})`,
      };
    }

    const expiresAt = new Date(
      Date.now() + (json.expires_in ?? 0) * 1000
    ).toISOString();

    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      instagram_access_token: json.access_token,
      instagram_token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, error: error.message };

    return { ok: true, expiresAt };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
