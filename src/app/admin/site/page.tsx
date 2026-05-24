import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";
import HeroVideoForm from "./HeroVideoForm";
import HeroTextForm from "./HeroTextForm";
import ShopBannerForm from "./ShopBannerForm";
import CommitmentBannerForm from "./CommitmentBannerForm";

export const metadata: Metadata = { title: "Site" };
export const revalidate = 0;

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Site</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the storefront media — swap the hero video and shop banner for promotions or seasonal campaigns.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Home hero video</h2>
        <HeroVideoForm currentUrl={settings.heroVideoUrl} />
      </section>

      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Home hero text</h2>
        <p className="text-sm text-gray-500 mb-4 -mt-2">
          Swap the headline for seasonal offers or campaigns. Leave the eyebrow blank to hide it.
        </p>
        <HeroTextForm
          currentEyebrow={settings.heroEyebrow}
          currentHeadingLine1={settings.heroHeadingLine1}
          currentHeadingLine2={settings.heroHeadingLine2}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Shop page banner</h2>
        <ShopBannerForm currentUrl={settings.shopBannerUrl} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Home commitment banner</h2>
        <p className="text-sm text-gray-500 mb-4 -mt-2">
          Image shown in the &ldquo;Our commitment&rdquo; strip on the homepage. Leave empty to fall back to the plain sage background.
        </p>
        <CommitmentBannerForm currentUrl={settings.commitmentBannerUrl} />
      </section>
    </div>
  );
}
