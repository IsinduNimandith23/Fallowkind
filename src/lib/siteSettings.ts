import { supabase } from "./supabase";

export type SiteSettings = {
  heroVideoUrl: string;
  shopBannerUrl: string;
  shopBannerMobileUrl: string;
  commitmentBannerUrl: string;
  heroEyebrow: string;
  heroHeadingLine1: string;
  heroHeadingLine2: string;
  ourStoryBeginningUrl: string;
  ourStoryPrinciple1Url: string;
  ourStoryPrinciple2Url: string;
  ourStoryPrinciple3Url: string;
};

const DEFAULTS: SiteSettings = {
  heroVideoUrl: "/hero.mp4",
  shopBannerUrl: "/banner.png",
  shopBannerMobileUrl: "",
  commitmentBannerUrl: "",
  heroEyebrow: "",
  heroHeadingLine1: "The Future",
  heroHeadingLine2: "is Conscious.",
  ourStoryBeginningUrl: "/ModuraShop.jpg",
  ourStoryPrinciple1Url: "/Rooted in Land.jpg",
  ourStoryPrinciple2Url: "/ModuraShop.jpg",
  ourStoryPrinciple3Url: "/banner.png",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("hero_video_url, shop_banner_url, commitment_banner_url, hero_eyebrow, hero_heading_line1, hero_heading_line2")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("[siteSettings] base select failed:", error.message);
    return DEFAULTS;
  }

  // Mobile banner column was added in migration 011 - fetch it separately so an
  // un-migrated database doesn't break the whole settings response.
  let shopBannerMobileUrl = DEFAULTS.shopBannerMobileUrl;
  const mobile = await supabase
    .from("site_settings")
    .select("shop_banner_mobile_url")
    .eq("id", 1)
    .maybeSingle();
  if (mobile.error) {
    console.warn("[siteSettings] shop_banner_mobile_url not available - run migration 011:", mobile.error.message);
  } else if (mobile.data?.shop_banner_mobile_url) {
    shopBannerMobileUrl = mobile.data.shop_banner_mobile_url;
  }

  // Our-story image columns were added in migration 012 - fetch separately so
  // an un-migrated database still returns the rest of the settings.
  let ourStoryBeginningUrl  = DEFAULTS.ourStoryBeginningUrl;
  let ourStoryPrinciple1Url = DEFAULTS.ourStoryPrinciple1Url;
  let ourStoryPrinciple2Url = DEFAULTS.ourStoryPrinciple2Url;
  let ourStoryPrinciple3Url = DEFAULTS.ourStoryPrinciple3Url;
  const story = await supabase
    .from("site_settings")
    .select("our_story_beginning_url, our_story_principle1_url, our_story_principle2_url, our_story_principle3_url")
    .eq("id", 1)
    .maybeSingle();
  if (story.error) {
    console.warn("[siteSettings] our_story_*_url not available - run migration 012:", story.error.message);
  } else if (story.data) {
    if (story.data.our_story_beginning_url)  ourStoryBeginningUrl  = story.data.our_story_beginning_url;
    if (story.data.our_story_principle1_url) ourStoryPrinciple1Url = story.data.our_story_principle1_url;
    if (story.data.our_story_principle2_url) ourStoryPrinciple2Url = story.data.our_story_principle2_url;
    if (story.data.our_story_principle3_url) ourStoryPrinciple3Url = story.data.our_story_principle3_url;
  }

  return {
    heroVideoUrl:        data.hero_video_url        || DEFAULTS.heroVideoUrl,
    shopBannerUrl:       data.shop_banner_url       || DEFAULTS.shopBannerUrl,
    shopBannerMobileUrl,
    commitmentBannerUrl: data.commitment_banner_url || DEFAULTS.commitmentBannerUrl,
    heroEyebrow:         data.hero_eyebrow          || DEFAULTS.heroEyebrow,
    heroHeadingLine1:    data.hero_heading_line1    || DEFAULTS.heroHeadingLine1,
    heroHeadingLine2:    data.hero_heading_line2    || DEFAULTS.heroHeadingLine2,
    ourStoryBeginningUrl,
    ourStoryPrinciple1Url,
    ourStoryPrinciple2Url,
    ourStoryPrinciple3Url,
  };
}

export type OurStoryImageKey =
  | "beginning"
  | "principle1"
  | "principle2"
  | "principle3";

const OUR_STORY_COLUMNS: Record<OurStoryImageKey, string> = {
  beginning:  "our_story_beginning_url",
  principle1: "our_story_principle1_url",
  principle2: "our_story_principle2_url",
  principle3: "our_story_principle3_url",
};

export async function setOurStoryImageUrl(key: OurStoryImageKey, url: string): Promise<void> {
  const column = OUR_STORY_COLUMNS[key];
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, [column]: url, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
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

export async function setShopBannerMobileUrl(url: string): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, shop_banner_mobile_url: url, updated_at: new Date().toISOString() });
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
