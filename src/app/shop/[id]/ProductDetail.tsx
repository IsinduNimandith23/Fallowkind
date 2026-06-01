"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { SIZE_OPTIONS } from "@/lib/sizes";
import { useCart } from "@/contexts/CartContext";

type Props = {
  product: Product;
  allProducts: Product[];
};

export default function ProductDetail({ product, allProducts }: Props) {
  const productImages = [product.imageUrl2, product.imageUrl].filter(
    (u): u is string => Boolean(u)
  );
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeThumb, setActiveThumb] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [washingOpen, setWashingOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  const { addItem, openCart } = useCart();
  const router = useRouter();

  const selectedSizeOutOfStock = !!selectedSize && !product.sizes.includes(selectedSize);
  const purchaseDisabled = selectedSizeOutOfStock;

  const scalePrice = (display: string, unitValue: number) =>
    display.replace(/\d[\d,]*/, String(unitValue * qty));

  const displayedPrice = scalePrice(product.price, product.priceValue);
  const displayedOriginalPrice = (() => {
    if (!product.originalPrice) return undefined;
    const match = product.originalPrice.match(/\d[\d,]*/);
    if (!match) return product.originalPrice;
    const unit = parseInt(match[0].replace(/,/g, ""), 10);
    if (Number.isNaN(unit)) return product.originalPrice;
    return product.originalPrice.replace(/\d[\d,]*/, String(unit * qty));
  })();

  function addCurrentSelection() {
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
        imageUrl: product.imageUrl,
        imageUrl2: product.imageUrl2,
      },
      qty
    );
  }

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 1800);
      return;
    }
    if (purchaseDisabled) return;
    addCurrentSelection();
    setAdded(true);
    openCart();
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 1800);
      return;
    }
    if (purchaseDisabled) return;
    addCurrentSelection();
    router.push("/checkout");
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
      <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] tracking-widest uppercase text-forest/40 mb-8 md:mb-10">
        <Link href="/" className="hover:text-forest transition-colors duration-200">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-forest transition-colors duration-200">Shop</Link>
        <span>/</span>
        <span className="text-forest/70 break-words">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[3fr_2fr] gap-8 md:gap-10 xl:gap-20">
        {/* ── Gallery ── */}
        <div>
          <div
            className="aspect-[3/4] w-full mb-3 relative overflow-hidden rounded-3xl bg-cream/40 backdrop-blur-sm border border-white/40 shadow-md"
            style={productImages.length === 0 ? thumbStyles[activeThumb] : undefined}
          >
            {productImages.length > 0 ? (
              <>
                <Image
                  src={productImages[activeImage] ?? productImages[0]}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  priority
                  className="object-cover"
                />
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImage((i) => (i - 1 + productImages.length) % productImages.length)
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/45 backdrop-blur-md border border-white/60 flex items-center justify-center hover:bg-white/65 transition-colors duration-200 text-forest text-xl leading-none shadow-sm"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={() =>
                        setActiveImage((i) => (i + 1) % productImages.length)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/45 backdrop-blur-md border border-white/60 flex items-center justify-center hover:bg-white/65 transition-colors duration-200 text-forest text-xl leading-none shadow-sm"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
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

          {productImages.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
              <span className="tag-pill">{product.tag === "Sale" ? "Offer" : product.tag}</span>
            </div>
          )}

          {/* Name */}
          <h1 className="font-display text-3xl md:text-4xl text-forest leading-tight mb-5">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-semibold text-forest">{displayedPrice}</span>
            {displayedOriginalPrice && (
              <span className="text-sm text-forest/35 line-through">{displayedOriginalPrice}</span>
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
              {SIZE_OPTIONS.map((s) => {
                const available = product.sizes.includes(s);
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    title={available ? undefined : "Sold out"}
                    aria-label={available ? s : `${s} — sold out`}
                    className={
                      available
                        ? `min-w-[44px] px-4 py-2 text-xs rounded-full backdrop-blur-md border transition-all duration-200 ${
                            isSelected
                              ? "bg-forest text-linen border-forest"
                              : "bg-white/30 border-white/55 text-forest/65 hover:bg-white/50 hover:text-forest hover:border-forest/40"
                          }`
                        : `min-w-[44px] px-4 py-2 text-xs rounded-full backdrop-blur-md border line-through decoration-2 transition-all duration-200 ${
                            isSelected
                              ? "bg-red-50/80 border-red-400/60 text-red-700/80"
                              : "bg-cream/50 border-forest/25 text-forest/45 hover:bg-cream/70 hover:border-forest/40"
                          }`
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {sizeError && (
              <p className="text-xs text-red-500/70 mt-1.5">Please select a size before adding to cart.</p>
            )}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`relative inline-flex w-2.5 h-2.5 rounded-full ${
                product.inStock && !selectedSizeOutOfStock ? "bg-moss" : "bg-red-500"
              }`}
            >
              {product.inStock && !selectedSizeOutOfStock && (
                <span className="absolute inset-0 rounded-full bg-moss/60 animate-ping" aria-hidden="true" />
              )}
            </span>
            <span
              className={`text-[11px] tracking-[0.18em] uppercase font-semibold ${
                product.inStock && !selectedSizeOutOfStock ? "text-moss" : "text-red-600"
              }`}
            >
              {product.inStock && !selectedSizeOutOfStock ? "In Stock" : "Out of Stock"}
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
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={purchaseDisabled}
              className={`flex-1 btn-primary text-xs tracking-widest uppercase transition-all duration-200 ${
                purchaseDisabled
                  ? "opacity-50 cursor-not-allowed hover:!bg-forest/90 hover:!tracking-widest hover:!shadow-sm"
                  : added
                  ? "opacity-80"
                  : ""
              }`}
            >
              {purchaseDisabled ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={purchaseDisabled}
              className={`flex-1 btn-outline text-xs tracking-widest uppercase text-center transition-all duration-200 ${
                purchaseDisabled
                  ? "opacity-50 cursor-not-allowed hover:!bg-white/30 hover:!text-forest hover:!border-forest/50 hover:!tracking-widest"
                  : ""
              }`}
            >
              Buy Now
            </button>
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
                  { label: "Origin",   value: product.details.origin   },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-3">
                    <span className="text-forest/35 tracking-wide shrink-0 w-16">{label}</span>
                    <span className="text-forest/65">{value}</span>
                  </div>
                ))}
                <p className="pt-2 text-xs text-forest/45 leading-relaxed italic">
                  Note: Slight color variations may occur due to lighting, photography, and screen display settings. The actual product color may differ slightly from the images shown on the website.
                </p>
              </div>
            )}
          </div>

          {/* Washing & Care accordion */}
          <div className="border-t border-forest/15">
            <button
              onClick={() => setWashingOpen((o) => !o)}
              className="flex items-center justify-between w-full py-4"
            >
              <span className="text-sm font-medium text-forest">Washing & Care</span>
              <svg
                className={`w-4 h-4 text-forest/40 transition-transform duration-200 ${washingOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {washingOpen && (
              <ul className="pb-5 space-y-2 text-sm text-forest/65 list-disc pl-5 marker:text-forest/30">
                <li>Wash on gentle with like colors</li>
                <li>Wash on cold</li>
                <li>Hang dry only to avoid shrinking — do not place in the dryer</li>
                <li>For best results, allow to dry in the sun</li>
              </ul>
            )}
          </div>

          {/* Shipping & Returns accordion */}
          <div className="border-t border-forest/15">
            <button
              onClick={() => setShippingOpen((o) => !o)}
              className="flex items-center justify-between w-full py-4"
            >
              <span className="text-sm font-medium text-forest">Shipping & Returns</span>
              <svg
                className={`w-4 h-4 text-forest/40 transition-transform duration-200 ${shippingOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {shippingOpen && (
              <div className="pb-5 space-y-4 text-sm text-forest/65">
                <div>
                  <p className="text-forest mb-2">Shipping</p>
                  <ul className="space-y-2 list-disc pl-5 marker:text-forest/30">
                    <li>Standard shipping: Rs. 400</li>
                    <li>All orders ship within 1–5 business days</li>
                    <li>Island-wide delivery available</li>
                  </ul>
                </div>
                <div>
                  <p className="text-forest mb-2">Returns</p>
                  <ul className="space-y-2 list-disc pl-5 marker:text-forest/30">
                    <li>
                      We have a 7-day return policy, which means you have 7 days after receiving your item to request a return.
                    </li>
                    <li>
                      Item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging.
                    </li>
                  </ul>
                </div>
              </div>
            )}
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
                <div className="relative card-img bg-cream/40 backdrop-blur-sm border border-white/40 shadow-sm aspect-[3/4] mb-4 overflow-hidden">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-fern/30 to-sage/15" />
                  )}
                  {p.tag && (
                    <span className="absolute top-3 left-3 tag-pill z-10">
                      {p.tag === "Sale" ? "Offer" : p.tag}
                    </span>
                  )}
                </div>
                <div className="px-3 space-y-1">
                  <p className="text-sm text-forest group-hover:text-sage transition-colors duration-200">
                    {p.name}
                  </p>
                  <p className="text-sm text-forest/70">
                    {p.price}
                    {p.originalPrice && (
                      <span className="ml-2 text-forest/40 line-through">{p.originalPrice}</span>
                    )}
                  </p>
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-forest/40 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-panel max-w-xl w-full p-4 sm:p-5 relative max-h-[92vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-forest font-semibold">Fit</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/55 flex items-center justify-center text-forest/55 hover:text-forest hover:bg-white/60 transition-colors duration-200 shrink-0"
            aria-label="Close size guide"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="glass-card relative w-full overflow-hidden mb-3">
          <Image
            src="/fallowkind-size_guide.png"
            alt="Fallowkind size guide chart"
            width={1200}
            height={900}
            sizes="(max-width: 640px) 92vw, 36rem"
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="glass-card px-3 py-2.5 sm:py-3">
          <p className="text-[11px] font-bold text-forest/85 leading-relaxed text-center sm:whitespace-nowrap">
            Prefer a relaxed, oversized fit? We recommend purchasing one size up from your usual size.
          </p>
        </div>
      </div>
    </div>
  );
}
