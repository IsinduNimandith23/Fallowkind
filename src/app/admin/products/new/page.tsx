import type { Metadata } from "next";
import Link from "next/link";
import ProductForm from "../ProductForm";

export const metadata: Metadata = { title: "New Product" };

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link
          href="/admin/products"
          className="text-xs text-gray-500 hover:text-gray-700 tracking-wider uppercase"
        >
          ← Back to products
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-3">New Product</h1>
        <p className="text-sm text-gray-500 mt-1">Add a new item to the store.</p>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
