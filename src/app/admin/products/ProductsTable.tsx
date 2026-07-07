"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import DeleteButton from "./DeleteButton";

export default function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [order, setOrder] = useState<Product[]>(products);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep local order in sync when the server sends a fresh list (after a save,
  // delete or add). This never runs during a purely-local reorder because the
  // parent only re-renders on router.refresh().
  useEffect(() => {
    setOrder(products);
  }, [products]);

  const dirty =
    order.length !== products.length ||
    order.some((p, i) => p.id !== products[i]?.id);

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    setOrder((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }

  function handleDrop(targetId: number) {
    const from = order.findIndex((p) => p.id === dragId);
    const to = order.findIndex((p) => p.id === targetId);
    setDragId(null);
    setOverId(null);
    if (from === -1 || to === -1 || from === to) return;
    move(from, to);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: order.map((p) => p.id) }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to save order");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save order");
    } finally {
      setSaving(false);
    }
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <p className="text-center py-16 text-sm text-gray-400">
          No products yet.{" "}
          <Link href="/admin/products/new" className="text-forest underline">
            Add one
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <p className="text-xs text-gray-400">
          Drag the <span className="text-gray-500">⠿</span> handle or use the
          arrows to set the order shoppers see. Remember to save.
        </p>
        {dirty && (
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-600">{error}</span>}
            <button
              onClick={() => {
                setOrder(products);
                setError(null);
              }}
              disabled={saving}
              className="text-xs px-3 py-2 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="text-xs px-4 py-2 rounded bg-forest text-linen font-semibold uppercase tracking-wider hover:bg-forest/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save order"}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <Th>Order</Th>
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
              {order.map((p, i) => (
                <tr
                  key={p.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (overId !== p.id) setOverId(p.id);
                  }}
                  onDrop={() => handleDrop(p.id)}
                  className={`border-b border-gray-50 transition-colors ${
                    dragId === p.id ? "opacity-40" : "hover:bg-gray-50"
                  } ${
                    overId === p.id && dragId !== p.id
                      ? "border-t-2 border-t-forest"
                      : ""
                  }`}
                >
                  <td className="px-3 md:px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        draggable
                        onDragStart={() => setDragId(p.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverId(null);
                        }}
                        title="Drag to reorder"
                        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 select-none text-base leading-none"
                      >
                        ⠿
                      </span>
                      <div className="flex flex-col">
                        <button
                          onClick={() => move(i, i - 1)}
                          disabled={i === 0}
                          title="Move up"
                          className="text-gray-400 hover:text-forest disabled:opacity-25 disabled:hover:text-gray-400 leading-none text-[10px]"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => move(i, i + 1)}
                          disabled={i === order.length - 1}
                          title="Move down"
                          className="text-gray-400 hover:text-forest disabled:opacity-25 disabled:hover:text-gray-400 leading-none text-[10px]"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3">
                    <div className="w-12 h-12 bg-cream rounded overflow-hidden flex items-center justify-center">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[9px] text-forest/30 tracking-wider uppercase">
                          No img
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-3 font-medium text-gray-800">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="hover:text-forest hover:underline"
                    >
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
                          p.inStock
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
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
        </div>
      </div>
    </>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 md:px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
