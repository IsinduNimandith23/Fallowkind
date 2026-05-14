"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import type { Product } from "@/lib/products";

export default function ShopGrid({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  return (
    <div className="section-padding page-container">
      {/* Header */}
      <AnimateOnScroll className="mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Browse</p>
        <h1 className="text-4xl md:text-6xl mb-5">The Collection</h1>
        <p className="text-forest/55 max-w-lg leading-relaxed">
          Pieces made for the land and the long run — natural fibres, considered cuts.
        </p>
      </AnimateOnScroll>

      {/* Search */}
      <AnimateOnScroll delay={100} className="mb-12 max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40 pointer-events-none"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search t-shirts by name"
            className="w-full border border-forest/20 bg-transparent pl-10 pr-10 py-3 text-sm text-forest placeholder:text-forest/35 focus:outline-none focus:border-forest/55 transition-colors duration-200"
            aria-label="Search products"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest/40 hover:text-forest transition-colors duration-200"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </AnimateOnScroll>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((p, i) => (
          <AnimateOnScroll key={p.id} delay={i * 60}>
            <Link href={`/shop/${p.id}`} className="group block">
              <div className="relative card-img bg-cream aspect-[3/4] mb-4 overflow-hidden">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-fern/25 to-sage/15" />
                )}
                {p.tag && (
                  <span className="absolute top-3 left-3 text-[9px] tracking-widest uppercase bg-forest text-linen px-2.5 py-1 z-10">
                    {p.tag}
                  </span>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-forest/90 backdrop-blur-sm text-linen text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  View Product
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-forest group-hover:text-sage transition-colors duration-200">
                  {p.name}
                </p>
                <p className="text-sm text-sage">{p.price}</p>
              </div>
            </Link>
          </AnimateOnScroll>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24 text-forest/40">
          <p className="text-sm tracking-widest uppercase">
            {query ? `No results for "${query}"` : "No items yet"}
          </p>
        </div>
      )}
    </div>
  );
}
