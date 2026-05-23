import { getAllProducts, getProductById } from "@/lib/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "./ProductDetail";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id));
  return { title: product?.name ?? "Product" };
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
  return <ProductDetail product={product} allProducts={allProducts} />;
}
