import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductsTable from "./ProductsTable";

export const metadata: Metadata = { title: "Products" };
export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between gap-3 mb-6 md:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} product{products.length !== 1 ? "s" : ""} in the store
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="shrink-0 bg-forest text-linen px-3 md:px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-forest/90 transition-colors"
        >
          <span className="md:hidden">+ New</span>
          <span className="hidden md:inline">+ New Product</span>
        </Link>
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
