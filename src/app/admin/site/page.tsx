import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/siteSettings";
import HeroVideoForm from "./HeroVideoForm";

export const metadata: Metadata = { title: "Site" };
export const revalidate = 0;

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Site</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the storefront hero — swap the video for promotions or seasonal campaigns.
        </p>
      </div>

      <HeroVideoForm currentUrl={settings.heroVideoUrl} />
    </div>
  );
}
