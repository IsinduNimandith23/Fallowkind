import type { Metadata } from "next";
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import DeleteButton from "./DeleteButton";

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {products.length === 0 ? (
            <p className="text-center py-16 text-sm text-gray-400">
              No products yet. <Link href="/admin/products/new" className="text-forest underline">Add one</Link>.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <Th>Image</Th>
                  <Th>Name</Th>
                  <Th>Category</Th>
                  <Th>Price</Th>
                  <Th>Tag</Th>
                  <Th>Stock</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-3">
                      <div className="w-12 h-12 bg-cream rounded overflow-hidden flex items-center justify-center">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] text-forest/30 tracking-wider uppercase">No img</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 font-medium text-gray-800">
                      <Link href={`/admin/products/${p.id}`} className="hover:text-forest hover:underline">
                        {p.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {p.id}</p>
                    </td>
                    <td className="px-4 md:px-6 py-3 text-gray-600">{p.category}</td>
                    <td className="px-4 md:px-6 py-3 text-gray-700">{p.price}</td>
                    <td className="px-4 md:px-6 py-3">
                      {p.tag ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-forest text-linen">
                          {p.tag === "Sale" ? "Offer" : p.tag}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            p.inStock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {p.inStock ? "In stock" : "Out of stock"}
                        </span>
                        {p.sizes.some((s) => p.sizeQuantities[s] != null) && (
                          <span className="text-[11px] text-gray-500">
                            {p.sizes
                              .filter((s) => p.sizeQuantities[s] != null)
                              .map((s) => `${s}:${p.sizeQuantities[s]}`)
                              .join("  ")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-xs text-forest hover:underline"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/shop/${p.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          View
                        </Link>
                        <DeleteButton id={p.id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 md:px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
