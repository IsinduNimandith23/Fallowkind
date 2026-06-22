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
  spotlightName: string;
  spotlightImageUrl: string;
  spotlightPerk1: string;
  spotlightPerk2: string;
  communityBannerUrl: string;
  impactStats: ImpactStat[];
};

export type ImpactStat = { value: string; label: string };

// Number of "Our Impact Together" stats. Icons are paired by position in the
// community page (see IMPACT_STAT_ICONS there); only value + label are editable.
export const IMPACT_STAT_COUNT = 6;

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
  spotlightName: "@nimeshi",
  spotlightImageUrl: "",
  spotlightPerk1: "15% Off Discount Code",
  spotlightPerk2: "Featured on Instagram",
  communityBannerUrl: "",
  impactStats: [
    { value: "100%", label: "Organic & natural fibres used" },
    { value: "100+", label: "Plastic-free garments sold" },
    { value: "100+", label: "Trees supported" },
    { value: "0", label: "Fast-fashion shortcuts" },
    { value: "200+", label: "Community members" },
    { value: "1", label: "Countries reached" },
  ],
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

  // Spotlight columns were added in migration 020 - fetch separately so an
  // un-migrated database still returns the rest of the settings. Unlike the
  // image fallbacks above, values are taken as-is (an empty name intentionally
  // hides the spotlight card on the storefront).
  let spotlightName      = DEFAULTS.spotlightName;
  let spotlightImageUrl  = DEFAULTS.spotlightImageUrl;
  let spotlightPerk1     = DEFAULTS.spotlightPerk1;
  let spotlightPerk2     = DEFAULTS.spotlightPerk2;
  const spotlight = await supabase
    .from("site_settings")
    .select("spotlight_name, spotlight_image_url, spotlight_perk1, spotlight_perk2")
    .eq("id", 1)
    .maybeSingle();
  if (spotlight.error) {
    console.warn("[siteSettings] spotlight_* not available - run migration 020:", spotlight.error.message);
  } else if (spotlight.data) {
    spotlightName     = spotlight.data.spotlight_name      ?? "";
    spotlightImageUrl = spotlight.data.spotlight_image_url ?? "";
    spotlightPerk1    = spotlight.data.spotlight_perk1     ?? "";
    spotlightPerk2    = spotlight.data.spotlight_perk2     ?? "";
  }

  // Community banner column was added in migration 021 - fetch separately so an
  // un-migrated database still returns the rest of the settings.
  let communityBannerUrl = DEFAULTS.communityBannerUrl;
  const communityBanner = await supabase
    .from("site_settings")
    .select("community_banner_url")
    .eq("id", 1)
    .maybeSingle();
  if (communityBanner.error) {
    console.warn("[siteSettings] community_banner_url not available - run migration 021:", communityBanner.error.message);
  } else if (communityBanner.data?.community_banner_url) {
    communityBannerUrl = communityBanner.data.community_banner_url;
  }

  // Impact stats columns were added in migration 022 - fetch separately so an
  // un-migrated database still returns the rest of the settings. Once migrated,
  // values are taken as-is (the migration seeds them with today's numbers); an
  // empty value intentionally hides that stat row on the storefront.
  let impactStats = DEFAULTS.impactStats;
  const impact = await supabase
    .from("site_settings")
    .select(
      "impact_stat1_value, impact_stat1_label, impact_stat2_value, impact_stat2_label, impact_stat3_value, impact_stat3_label, impact_stat4_value, impact_stat4_label, impact_stat5_value, impact_stat5_label, impact_stat6_value, impact_stat6_label",
    )
    .eq("id", 1)
    .maybeSingle();
  if (impact.error) {
    console.warn("[siteSettings] impact_stat* not available - run migration 022:", impact.error.message);
  } else if (impact.data) {
    const row = impact.data as Record<string, string | null>;
    impactStats = Array.from({ length: IMPACT_STAT_COUNT }, (_, i) => ({
      value: (row[`impact_stat${i + 1}_value`] ?? "").trim(),
      label: (row[`impact_stat${i + 1}_label`] ?? "").trim(),
    }));
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
    spotlightName,
    spotlightImageUrl,
    spotlightPerk1,
    spotlightPerk2,
    communityBannerUrl,
    impactStats,
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

export async function setCommunityBannerUrl(url: string): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, community_banner_url: url, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export async function setImpactStats(stats: ImpactStat[]): Promise<void> {
  const row: Record<string, string> = {};
  for (let i = 0; i < IMPACT_STAT_COUNT; i++) {
    const stat = stats[i] ?? { value: "", label: "" };
    row[`impact_stat${i + 1}_value`] = stat.value;
    row[`impact_stat${i + 1}_label`] = stat.label;
  }
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...row, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

export type SpotlightInput = {
  name: string;
  imageUrl: string;
  perk1: string;
  perk2: string;
};

export async function setSpotlight(input: SpotlightInput): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      id: 1,
      spotlight_name: input.name,
      spotlight_image_url: input.imageUrl,
      spotlight_perk1: input.perk1,
      spotlight_perk2: input.perk2,
      updated_at: new Date().toISOString(),
    });
  if (error) throw new Error(error.message);
}
