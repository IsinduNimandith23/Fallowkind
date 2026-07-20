import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/siteSettings";
import ShopGrid from "./ShopGrid";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop the Fallowkind collection - clothing made from 100% natural fibres like organic cotton, linen and hemp. Slow-made, plastic-free, designed for everyday wear.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop | Fallowkind",
    description:
      "Slow-fashion essentials in 100% natural fibres. Browse our latest pieces - cotton, linen and hemp, made to last.",
    url: "/shop",
    type: "website",
  },
};
export const revalidate = 3600;

export default async function ShopPage() {
  const [products, settings] = await Promise.all([
    getAllProducts(),
    getSiteSettings(),
  ]);
  // ShopGrid reads ?gender= via useSearchParams, which needs a Suspense
  // boundary to keep this page statically rendered under `revalidate`.
  return (
    <Suspense>
      <ShopGrid
        products={products}
        bannerUrl={settings.shopBannerUrl}
        bannerMobileUrl={settings.shopBannerMobileUrl}
      />
    </Suspense>
  );
}
