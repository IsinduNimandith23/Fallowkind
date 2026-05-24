import { supabase } from "./supabase";

export type SiteSettings = {
  heroVideoUrl: string;
  shopBannerUrl: string;
  commitmentBannerUrl: string;
  heroEyebrow: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
};

const DEFAULTS: SiteSettings = {
  heroVideoUrl: "/mp5.mp4",
  shopBannerUrl: "/banner.png",
  commitmentBannerUrl: "",
  heroEyebrow: "",
  heroHeadingLine1: "The Future",
  heroHeadingLine2: "is Conscious.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_video_url, shop_banner_url, commitment_banner_url, hero_eyebrow, hero_heading_line1, hero_heading_line2")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) return DEFAULTS;
  return {
    heroVideoUrl:        data.hero_video_url        || DEFAULTS.heroVideoUrl,
    shopBannerUrl:       data.shop_banner_url       || DEFAULTS.shopBannerUrl,
    commitmentBannerUrl: data.commitment_banner_url || DEFAULTS.commitmentBannerUrl,
    heroEyebrow:         data.hero_eyebrow          || DEFAULTS.heroEyebrow,
    heroHeadingLine1:    data.hero_heading_line1    || DEFAULTS.heroHeadingLine1,
    heroHeadingLine2:    data.hero_heading_line2    || DEFAULTS.heroHeadingLine2,
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

export async function setCommitmentBannerUrl(url: string): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, commitment_banner_url: url, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export type HeroTextInput = {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
};

export async function setHeroText(input: HeroTextInput): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      id: 1,
      hero_eyebrow: input.eyebrow,
      hero_heading_line1: input.headingLine1,
      hero_heading_line2: input.headingLine2,
      updated_at: new Date().toISOString(),
    });
  if (error) throw new Error(error.message);
}
