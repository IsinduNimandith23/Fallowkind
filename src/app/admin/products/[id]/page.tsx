import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import ProductForm from "../ProductForm";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProductById(Number(id));
  return { title: p ? `Edit ${p.name}` : "Edit Product" };
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) notFound();

  const product = await getProductById(numericId);
  if (!product) notFound();

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <Link
          href="/admin/products"
          className="text-xs text-gray-500 hover:text-gray-700 tracking-wider uppercase"
        >
          ← Back to products
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mt-3 break-words">Edit: {product.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Product ID: {product.id}</p>
      </div>

      <ProductForm mode="edit" product={product} />
    </div>
  );
}
