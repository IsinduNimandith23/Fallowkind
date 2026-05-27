import { getAllProducts, getProductById } from "@/lib/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "./ProductDetail";

const SITE_URL = "https://fallowkind.com";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) return { title: "Product" };

  const title = product.name;
  const description = product.description?.trim().slice(0, 160) || `${product.name} — ${product.category} from Fallowkind.`;
  const canonical = `/shop/${product.id}`;
  const images = [product.imageUrl, product.imageUrl2].filter((u): u is string => Boolean(u));

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${title} | Fallowkind`,
      description,
      images: images.length ? images : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Fallowkind`,
      description,
      images: images.length ? images : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const [product, allProducts] = await Promise.all([
    getProductById(numericId),
    getAllProducts(),
  ]);

  if (!product) notFound();

  const priceNumber = Number(product.priceValue);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: String(product.id),
    category: product.category,
    image: [product.imageUrl, product.imageUrl2].filter(Boolean),
    brand: { "@type": "Brand", name: "Fallowkind" },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.id}`,
      priceCurrency: "LKR",
      price: Number.isFinite(priceNumber) ? priceNumber.toFixed(2) : undefined,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} allProducts={allProducts} />
    </>
  );
}
