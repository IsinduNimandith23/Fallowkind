"use client";

import { useState } from "react";
import AnimateOnScroll from "@/components/AnimateOnScroll";

const categories = ["All", "Tops", "Bags", "Headwear", "Outerwear"];

const products = [
  { id: 1,  name: "Field Tee",         category: "Tops",      price: "$48",  tag: "New"        },
  { id: 2,  name: "Canvas Tote",        category: "Bags",      price: "$36"                     },
  { id: 3,  name: "Harvest Beanie",     category: "Headwear",  price: "$32",  tag: "Bestseller" },
  { id: 4,  name: "Linen Overshirt",    category: "Outerwear", price: "$95",  tag: "New"        },
  { id: 5,  name: "Earthwork Tee",      category: "Tops",      price: "$44"                     },
  { id: 6,  name: "Market Bag",         category: "Bags",      price: "$42"                     },
  { id: 7,  name: "Fallow Cap",         category: "Headwear",  price: "$38"                     },
  { id: 8,  name: "Moss Crew Sweater",  category: "Outerwear", price: "$120"                    },
];

export default function ShopPage() {
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

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

      {/* Category filters */}
      <AnimateOnScroll delay={100} className="flex gap-2 flex-wrap mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-lg text-[10px] tracking-widest uppercase px-5 py-2.5 border transition-all duration-300 ${
              active === cat
                ? "bg-forest text-linen border-forest"
                : "border-forest/25 text-forest/55 hover:border-forest hover:text-forest"
            }`}
          >
            {cat}
          </button>
        ))}
      </AnimateOnScroll>

      {/* Product grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((p, i) => (
          <AnimateOnScroll key={p.id} delay={i * 60}>
            <div className="group cursor-pointer">
              <div className="relative card-img bg-cream aspect-[3/4] mb-4">
                <div className="w-full h-full bg-gradient-to-br from-fern/25 to-sage/15" />
                {p.tag && (
                  <span className="absolute top-3 left-3 text-[9px] tracking-widest uppercase bg-forest text-linen px-2.5 py-1 z-10">
                    {p.tag}
                  </span>
                )}
                {/* Quick add overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-forest/90 backdrop-blur-sm text-linen text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  Quick Add
                </div>
              </div>
              <p className="text-[10px] tracking-widest uppercase text-moss mb-1">{p.category}</p>
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-forest group-hover:text-sage transition-colors duration-200">{p.name}</p>
                <p className="text-sm text-sage">{p.price}</p>
              </div>
            </div>
          </AnimateOnScroll>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-24 text-forest/40">
          <p className="text-sm tracking-widest uppercase">No items found</p>
        </div>
      )}

      {/* Load more (decorative) */}
      {filtered.length > 0 && (
        <AnimateOnScroll className="mt-16 text-center">
          <button className="btn-outline">Load more</button>
        </AnimateOnScroll>
      )}
    </div>
  );
}
