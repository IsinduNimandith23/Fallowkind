"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";

type Props = {
  product: Product;
  allProducts: Product[];
};

export default function ProductDetail({ product, allProducts }: Props) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const { addItem, openCart } = useCart();

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 1800);
      return;
    }
    addItem(
      {
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        priceValue: product.priceValue,
        color: selectedColor.name,
        colorHex: selectedColor.hex,
        size: selectedSize,
      },
      qty
    );
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  }

  const related = allProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const singleColor = product.colors.length <= 1;

  const thumbLabels = ["Front View", "Side View", "Detail", "Lifestyle"];
  const thumbStyles = [
    { background: `linear-gradient(145deg, ${selectedColor.hex}88 0%, #A8B89A55 100%)` },
    { background: `linear-gradient(165deg, #A8B89A99 0%, ${selectedColor.hex}44 100%)` },
    { background: `linear-gradient(125deg, ${selectedColor.hex}44 0%, #4F6B4A55 100%)` },
    { background: `linear-gradient(155deg, #EDE6D3 0%, ${selectedColor.hex}99 100%)` },
  ];

  return (
    <div className="section-padding page-container">
      {showSizeGuide && <SizeGuideModal onClose={() => setShowSizeGuide(false)} />}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] tracking-widest uppercase text-forest/40 mb-10">
        <Link href="/" className="hover:text-forest transition-colors duration-200">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-forest transition-colors duration-200">Shop</Link>
        <span>/</span>
        <span className="text-forest/70">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[3fr_2fr] gap-10 xl:gap-20">
        {/* ── Gallery ── */}
        <div>
          <div
            className="aspect-[3/4] w-full mb-3 relative overflow-hidden rounded-3xl bg-cream/40 backdrop-blur-sm border border-white/40 shadow-md"
            style={product.imageUrl ? undefined : thumbStyles[activeThumb]}
          >
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <>
                <button
                  onClick={() => setActiveThumb((t) => (t - 1 + 4) % 4)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/45 backdrop-blur-md border border-white/60 flex items-center justify-center hover:bg-white/65 transition-colors duration-200 text-forest text-xl leading-none shadow-sm"
                  aria-label="Previous view"
                >
                  ‹
                </button>
                <button
                  onClick={() => setActiveThumb((t) => (t + 1) % 4)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/45 backdrop-blur-md border border-white/60 flex items-center justify-center hover:bg-white/65 transition-colors duration-200 text-forest text-xl leading-none shadow-sm"
                  aria-label="Next view"
                >
                  ›
                </button>
                <div className="absolute bottom-5 left-0 right-0 flex justify-center">
                  <span className="rounded-full text-[9px] tracking-[0.3em] uppercase text-forest/60 bg-white/40 backdrop-blur-md border border-white/55 px-3 py-1">
                    {thumbLabels[activeThumb]}
                  </span>
                </div>
              </>
            )}
          </div>

          {!product.imageUrl && (
            <div className="grid grid-cols-4 gap-2">
              {thumbStyles.map((style, i) => (
                <button
                  key={i}
                  onClick={() => setActiveThumb(i)}
                  className={`aspect-square rounded-2xl border border-white/40 transition-all duration-200 ${
                    activeThumb === i
                      ? "ring-2 ring-forest ring-offset-2"
                      : "opacity-60 hover:opacity-90"
                  }`}
                  style={style}
                  aria-label={thumbLabels[i]}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="flex flex-col">
          {/* Tag */}
          {product.tag && (
            <div className="flex items-center gap-3 mb-3">
              <span className="tag-pill">{product.tag}</span>
            </div>
          )}

          {/* Name */}
          <h1 className="font-display text-3xl md:text-4xl text-forest leading-tight mb-5">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-semibold text-forest">{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-forest/35 line-through">{product.originalPrice}</span>
            )}
          </div>

          <div className="border-t border-forest/10 pt-6 mb-6">
            <p className="text-sm text-forest/65 leading-relaxed">{product.description}</p>
          </div>

          {/* Color */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-forest mb-3">
                Color:{" "}
                <span className="font-medium normal-case tracking-normal">{selectedColor.name}</span>
              </p>
              {singleColor ? (
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-7 h-7 rounded-full border-2 border-forest/20"
                    style={{ backgroundColor: selectedColor.hex }}
                    aria-label={selectedColor.name}
                  />
                </div>
              ) : (
                <div className="flex gap-2.5">
                  {product.colors.map((col) => (
                    <button
                      key={col.name}
                      title={col.name}
                      onClick={() => setSelectedColor(col)}
                      className={`w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                        selectedColor.name === col.name
                          ? "border-forest scale-110 shadow-sm ring-2 ring-forest/20 ring-offset-1"
                          : "border-forest/20 hover:border-forest/50"
                      }`}
                      style={{ backgroundColor: col.hex }}
                      aria-label={col.name}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Size */}
          <div className="mb-6">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-xs tracking-widest uppercase text-forest">
                Size{selectedSize ? `: ${selectedSize}` : ""}
              </p>
              <button
                onClick={() => setShowSizeGuide(true)}
                className="text-[10px] tracking-wide text-moss underline underline-offset-2 hover:text-forest transition-colors duration-200"
              >
                View Size Guide →
              </button>
            </div>
            <div className={`flex flex-wrap gap-2 transition-all duration-200 ${sizeError ? "ring-2 ring-red-400/60 ring-offset-2 rounded-2xl p-1" : ""}`}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedSize(s); setSizeError(false); }}
                  className={`min-w-[44px] px-4 py-2 text-xs rounded-full backdrop-blur-md border transition-all duration-200 ${
                    selectedSize === s
                      ? "bg-forest text-linen border-forest"
                      : "bg-white/30 border-white/55 text-forest/65 hover:bg-white/50 hover:text-forest hover:border-forest/40"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && (
              <p className="text-xs text-red-500/70 mt-1.5">Please select a size before adding to cart.</p>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 mb-6">
            <span className={`w-2 h-2 rounded-full ${product.inStock ? "bg-moss" : "bg-forest/20"}`} />
            <span className="text-xs text-forest/55 tracking-wide">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Qty */}
          <div className="flex items-center mb-3">
            <div className="inline-flex items-center rounded-full bg-white/35 backdrop-blur-md border border-white/55 shadow-sm">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="pl-4 pr-2 py-2.5 text-forest hover:text-sage transition-colors duration-200 leading-none"
              >
                −
              </button>
              <span className="px-3 py-2.5 text-sm font-medium text-forest min-w-[40px] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="pl-2 pr-4 py-2.5 text-forest hover:text-sage transition-colors duration-200 leading-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart + Buy Now */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              className={`flex-1 btn-primary text-xs tracking-widest uppercase transition-all duration-200 ${added ? "opacity-80" : ""}`}
            >
              {added ? "Added ✓" : "Add to Cart"}
            </button>
            <Link
              href="/checkout"
              className="flex-1 btn-outline text-xs tracking-widest uppercase text-center"
            >
              Buy Now
            </Link>
          </div>

          {/* Product details accordion */}
          <div className="border-t border-forest/15">
            <button
              onClick={() => setDetailsOpen((o) => !o)}
              className="flex items-center justify-between w-full py-4"
            >
              <span className="text-sm font-medium text-forest">Product details</span>
              <svg
                className={`w-4 h-4 text-forest/40 transition-transform duration-200 ${detailsOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {detailsOpen && (
              <div className="pb-5 space-y-2.5 text-sm">
                {[
                  { label: "Material", value: product.details.material },
                  { label: "Fit",      value: product.details.fit      },
                  { label: "Care",     value: product.details.care     },
                  { label: "Origin",   value: product.details.origin   },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-forest/35 tracking-wide shrink-0 w-16">{label}</span>
                    <span className="text-forest/65">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shipping info */}
          <div className="border-t border-forest/15 py-3">
            <div className="flex items-center gap-3 px-4 py-3 glass-card rounded-full">
              <svg
                className="w-5 h-5 text-forest/40 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
              <span className="text-sm text-forest/60">Standard shipping: Rs. 400</span>
            </div>
          </div>
          <div className="border-t border-forest/15" />
        </div>
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div className="mt-24 border-t border-forest/10 pt-16">
          <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">More like this</p>
          <h2 className="text-2xl md:text-3xl text-forest mb-10">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="group">
                <div className="relative card-img bg-cream/40 backdrop-blur-sm border border-white/40 shadow-sm aspect-[3/4] mb-4">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-fern/30 to-sage/15" />
                  )}
                  {p.tag && (
                    <span className="absolute top-3 left-3 tag-pill z-10">
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-baseline">
                  <p className="text-sm font-medium text-forest group-hover:text-sage transition-colors duration-200">
                    {p.name}
                  </p>
                  <p className="text-sm text-sage">{p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SizeGuideModal({ onClose }: { onClose: () => void }) {
  const rows = [
    { size: "S",  chest: "86–91",   length: "68", shoulder: "41" },
    { size: "M",  chest: "96–101",  length: "70", shoulder: "43" },
    { size: "L",  chest: "106–111", length: "72", shoulder: "45" },
    { size: "XL", chest: "116–121", length: "74", shoulder: "47" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-md w-full p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/55 flex items-center justify-center text-forest/55 hover:text-forest hover:bg-white/60 transition-colors duration-200"
          aria-label="Close size guide"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <p className="text-[10px] tracking-[0.3em] uppercase text-moss mb-2">Fit</p>
        <h2 className="font-display text-2xl text-forest mb-6">Size Guide</h2>

        {/* Image placeholder — replace src with actual chart image when ready */}
        <div className="glass-card aspect-video flex items-center justify-center mb-6">
          <p className="text-[10px] tracking-widest uppercase text-forest/30">Size chart image coming soon</p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-forest/10">
              {["Size", "Chest (cm)", "Length (cm)", "Shoulder (cm)"].map((h) => (
                <th key={h} className="text-left pb-2.5 pr-3 text-[10px] tracking-widest uppercase text-forest/35 font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.size} className="border-b border-forest/5">
                <td className="py-2.5 pr-3 font-semibold text-forest">{row.size}</td>
                <td className="py-2.5 pr-3 text-forest/65">{row.chest}</td>
                <td className="py-2.5 pr-3 text-forest/65">{row.length}</td>
                <td className="py-2.5 text-forest/65">{row.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-forest/35 mt-5 leading-relaxed">
          All measurements are in centimetres. Measure over light clothing for the most accurate fit.
        </p>
      </div>
    </div>
  );
}
