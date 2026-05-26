import type { Metadata } from "next";
import { getAllProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/siteSettings";
import ShopGrid from "./ShopGrid";

export const metadata: Metadata = { title: "Shop" };
export const revalidate = 3600;

export default async function ShopPage() {
  const [products, settings] = await Promise.all([
    getAllProducts(),
    getSiteSettings(),
  ]);
  return (
    <ShopGrid
      products={products}
      bannerUrl={settings.shopBannerUrl}
      bannerMobileUrl={settings.shopBannerMobileUrl}
    />
  );
}
