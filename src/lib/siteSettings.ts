import { supabase } from "./supabase";

export type SiteSettings = {
  heroVideoUrl: string;
  shopBannerUrl: string;
};

const DEFAULTS: SiteSettings = {
  heroVideoUrl: "/mp5.mp4",
  shopBannerUrl: "/banner.png",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_video_url, shop_banner_url")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULTS;
  return {
    heroVideoUrl: data.hero_video_url || DEFAULTS.heroVideoUrl,
    shopBannerUrl: data.shop_banner_url || DEFAULTS.shopBannerUrl,
  };
}

export async function setHeroVideoUrl(url: string): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, hero_video_url: url, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export async function setShopBannerUrl(url: string): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, shop_banner_url: url, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
