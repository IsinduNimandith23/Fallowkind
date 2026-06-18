// Facebook Page posts via the Graph API.
//
// Required env vars:
//   FACEBOOK_PAGE_ID             numeric id of the Facebook Page
//   FACEBOOK_PAGE_ACCESS_TOKEN   a Page access token. Derive it from a
//                                long-lived user token via /me/accounts - Page
//                                tokens minted that way do not expire.
//
// Note: this is unrelated to supabase/functions/facebook-feed (that one is a
// product-catalog CSV for Facebook Shops, not Page posts).

export type FacebookPost = {
  id: string;
  caption: string | null;
  image: string;
  permalink: string;
  timestamp: string;
};

type RawPost = {
  id: string;
  message?: string;
  full_picture?: string;
  permalink_url?: string;
  created_time: string;
};

const GRAPH = "https://graph.facebook.com/v21.0";
const FIELDS = "id,message,full_picture,permalink_url,created_time";

/**
 * Fetch posts where the Page has been *tagged* (UGC from customers/influencers),
 * not the Page's own posts. Cached + revalidated by Next (ISR) so the feed
 * auto-updates. Returns [] on any failure so callers can fall back.
 */
export async function getFacebookFeed(limit = 8): Promise<FacebookPost[]> {
  const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!token || !pageId) return [];

  // Over-fetch a little since text-only posts (no image) get filtered out.
  const url =
    `${GRAPH}/${pageId}/tagged` +
    `?fields=${FIELDS}&limit=${limit * 2}&access_token=${token}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Facebook feed fetch failed:", res.status, detail);
      return [];
    }
    const json = (await res.json()) as { data?: RawPost[] };
    const data = Array.isArray(json.data) ? json.data : [];
    return data
      .filter((p) => p.full_picture && p.permalink_url)
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        caption: p.message ?? null,
        image: p.full_picture as string,
        permalink: p.permalink_url as string,
        timestamp: p.created_time,
      }));
  } catch (err) {
    console.error("Facebook feed error:", err);
    return [];
  }
}
