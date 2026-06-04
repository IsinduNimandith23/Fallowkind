import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";
import HeroVideoForm from "./HeroVideoForm";
import HeroTextForm from "./HeroTextForm";
import ShopBannerForm from "./ShopBannerForm";
import CommitmentBannerForm from "./CommitmentBannerForm";
import OurStoryImagesForm from "./OurStoryImagesForm";
import SiteTabs, { type SiteTab } from "./SiteTabs";

export const metadata: Metadata = { title: "Site" };
export const revalidate = 0;

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  const tabs: SiteTab[] = [
    {
      id: "home",
      label: "Home page",
      description: "Hero video, hero text, and the commitment banner shown on the homepage.",
      content: (
        <div className="space-y-12">
          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Hero video</h2>
            <HeroVideoForm currentUrl={settings.heroVideoUrl} />
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Hero text</h2>
            <p className="text-sm text-gray-500 mb-4 -mt-2">
              Swap the headline for seasonal offers or campaigns. Leave the eyebrow blank to hide it.
            </p>
            <HeroTextForm
              currentEyebrow={settings.heroEyebrow}
              currentHeadingLine1={settings.heroHeadingLine1}
              currentHeadingLine2={settings.heroHeadingLine2}
            />
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Commitment banner</h2>
            <p className="text-sm text-gray-500 mb-4 -mt-2">
              Image shown in the &ldquo;Our commitment&rdquo; strip on the homepage. Leave empty to fall back to the plain sage background.
            </p>
            <CommitmentBannerForm currentUrl={settings.commitmentBannerUrl} />
          </section>
        </div>
      ),
    },
    {
      id: "shop",
      label: "Shop page",
      description: "Banner image shown above the product grid.",
      content: (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Shop banner</h2>
          <ShopBannerForm
            currentUrl={settings.shopBannerUrl}
            currentMobileUrl={settings.shopBannerMobileUrl}
          />
        </section>
      ),
    },
    {
      id: "our-story",
      label: "Our Story page",
      description: "Photos shown on the /our-story page - the “Our beginning” image and the three principle images.",
      content: (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Story images</h2>
          <OurStoryImagesForm
            beginningUrl={settings.ourStoryBeginningUrl}
            principle1Url={settings.ourStoryPrinciple1Url}
            principle2Url={settings.ourStoryPrinciple2Url}
            principle3Url={settings.ourStoryPrinciple3Url}
          />
        </section>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Site</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the storefront media - pick a page to edit its hero video, banners, and images.
        </p>
      </div>

      <SiteTabs tabs={tabs} />
    </div>
  );
}
