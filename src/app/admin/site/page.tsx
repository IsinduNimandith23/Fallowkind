import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";
import HeroVideoForm from "./HeroVideoForm";
import ShopBannerForm from "./ShopBannerForm";

export const metadata: Metadata = { title: "Site" };
export const revalidate = 0;

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Site</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the storefront media — swap the hero video and shop banner for promotions or seasonal campaigns.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Home hero video</h2>
        <HeroVideoForm currentUrl={settings.heroVideoUrl} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Shop page banner</h2>
        <ShopBannerForm currentUrl={settings.shopBannerUrl} />
      </section>
    </div>
  );
}
