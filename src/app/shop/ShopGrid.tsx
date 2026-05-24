"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import type { Product } from "@/lib/products";

type SortKey = "default" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortKey, string> = {
  "default": "Default",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A–Z",
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export default function ShopGrid({ products, bannerUrl }: { products: Product[]; bannerUrl: string }) {
  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("default");

  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click / escape; close mobile drawer on escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSortOpen(false);
        setMobileFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Derive filter options from products
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return sortSizes(Array.from(set));
  }, [products]);

  const PRICE_RANGES = [
    { label: "Under LKR 5,000", min: 0, max: 5000 },
    { label: "LKR 5,000 – 10,000", min: 5000, max: 10000 },
    { label: "LKR 10,000 – 20,000", min: 10000, max: 20000 },
    { label: "Over LKR 20,000", min: 20000, max: Infinity },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (selectedSizes.length > 0 && !p.sizes.some((s) => selectedSizes.includes(s))) return false;
      if (selectedPrice) {
        const range = PRICE_RANGES.find((r) => r.label === selectedPrice);
        if (range && (p.priceValue < range.min || p.priceValue > range.max)) return false;
      }
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.priceValue - b.priceValue);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.priceValue - a.priceValue);
    else if (sort === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, query, selectedCategories, selectedSizes, selectedPrice, sort]);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const activeFilterCount =
    selectedCategories.length + selectedSizes.length + (selectedPrice ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedPrice(null);
    setQuery("");
  };

  return (
    <>
      {/* Hero banner — admin-managed image, extends under the navbar like the homepage hero */}
      <section className="relative -mt-20 h-[460px] md:h-[560px] overflow-hidden bg-linen">
        <Image
          key={bannerUrl}
          src={bannerUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </section>

      <div className="page-container px-6 md:px-12 lg:px-20 py-10 md:py-14">
        <div className="md:grid md:grid-cols-[240px_1fr] md:gap-x-12 lg:gap-x-16">
          {/* Sidebar — desktop */}
          <aside className="hidden md:block">
            <div className="sticky top-28">
              <FilterSidebar
                allCategories={allCategories}
                allSizes={allSizes}
                priceRanges={PRICE_RANGES}
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedPrice={selectedPrice}
                onToggleCategory={(c) => setSelectedCategories(toggle(selectedCategories, c))}
                onToggleSize={(s) => setSelectedSizes(toggle(selectedSizes, s))}
                onSelectPrice={(p) => setSelectedPrice(p)}
              />
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              {/* Mobile filters trigger */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/55 backdrop-blur-md border border-white/70 text-sm text-forest"
                aria-label="Open filters"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M6 12h12M10 18h4" />
                </svg>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-forest text-linen text-[10px] px-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Search */}
              <div className="relative flex-1 max-w-md group">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest pointer-events-none z-10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products"
                  className="w-full bg-white/60 backdrop-blur-md border border-forest/30 hover:border-forest/50 rounded-full pl-12 pr-10 py-2.5 text-sm text-forest placeholder:text-forest/40 focus:bg-white/70 focus:border-forest/50 focus:outline-none focus:ring-4 focus:ring-forest/10 transition-[background-color,border-color,box-shadow] duration-300 ease-out [&::-webkit-search-cancel-button]:hidden [appearance:none]"
                  aria-label="Search products"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 inline-flex items-center justify-center rounded-full text-forest/50 hover:text-forest hover:bg-forest/10 transition-colors duration-200 z-10"
                    aria-label="Clear search"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="relative ml-auto" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm text-forest/80 hover:text-forest hover:bg-white/50 transition-colors"
                  aria-haspopup="true"
                  aria-expanded={sortOpen}
                >
                  <span className="hidden sm:inline text-xs tracking-[0.2em] uppercase text-forest/45">Sort</span>
                  <span>{SORT_LABELS[sort]}</span>
                  <svg
                    className={`w-3 h-3 transition-transform ${sortOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {sortOpen && (
                  <div className="absolute top-full right-0 mt-3 glass-panel overflow-hidden z-30 min-w-[200px]">
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => { setSort(k); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sort === k ? "bg-fern/25 text-forest" : "text-forest/75 hover:bg-white/40"
                        }`}
                      >
                        {SORT_LABELS[k]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
                {selectedCategories.map((c) => (
                  <Chip key={`cat-${c}`} label={c} onClear={() => setSelectedCategories(selectedCategories.filter((v) => v !== c))} />
                ))}
                {selectedSizes.map((s) => (
                  <Chip key={`sz-${s}`} label={s} onClear={() => setSelectedSizes(selectedSizes.filter((v) => v !== s))} />
                ))}
                {selectedPrice && <Chip label={selectedPrice} onClear={() => setSelectedPrice(null)} />}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs tracking-widest uppercase text-forest/55 hover:text-forest underline underline-offset-4 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Result count */}
            <p className="text-xs tracking-[0.2em] uppercase text-forest/45 mb-5 md:mb-6">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>

            {/* Product grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-7 md:gap-y-14">
          {filtered.map((p, i) => (
            <AnimateOnScroll key={p.id} delay={i * 50}>
              <Link href={`/shop/${p.id}`} className="group block">
                <div className="relative card-img bg-cream/40 backdrop-blur-sm border border-white/40 shadow-sm aspect-[4/5] mb-4 overflow-hidden">
                  {p.imageUrl ? (
                    <Image
                      src={p.imageUrl}
                      alt={p.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-fern/30 to-sage/15" />
                  )}
                  {p.tag && (
                    <span className="absolute top-3 left-3 tag-pill z-10">
                      {p.tag}
                    </span>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-forest/80 backdrop-blur-md text-linen text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    View Product
                  </div>
                </div>
                <div className="px-3 flex items-baseline justify-between gap-3">
                  <p className="text-sm text-forest group-hover:text-sage transition-colors duration-200">
                    {p.name}
                  </p>
                  <p className="text-sm text-forest/70 whitespace-nowrap">
                    {p.price}
                    {p.originalPrice && (
                      <span className="ml-2 text-forest/40 line-through">{p.originalPrice}</span>
                    )}
                  </p>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>

            {/* Empty state */}
            {filtered.length === 0 && (
              <div className="text-center py-24 text-forest/40">
                <p className="text-sm tracking-widest uppercase">
                  {query || activeFilterCount > 0 ? "No items match your filters" : "No items yet"}
                </p>
                {(query || activeFilterCount > 0) && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-4 text-xs tracking-widest uppercase text-forest underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-forest/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-linen shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-forest/10">
              <span className="text-xs tracking-[0.28em] uppercase text-forest">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-forest/60 hover:text-forest"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <FilterSidebar
                allCategories={allCategories}
                allSizes={allSizes}
                priceRanges={PRICE_RANGES}
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedPrice={selectedPrice}
                onToggleCategory={(c) => setSelectedCategories(toggle(selectedCategories, c))}
                onToggleSize={(s) => setSelectedSizes(toggle(selectedSizes, s))}
                onSelectPrice={(p) => setSelectedPrice(p)}
              />
            </div>
            <div className="px-6 py-4 border-t border-forest/10">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 rounded-full bg-forest text-linen text-xs tracking-[0.2em] uppercase"
              >
                View {filtered.length} {filtered.length === 1 ? "item" : "items"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type PriceRange = { label: string; min: number; max: number };

function FilterSidebar({
  allCategories,
  allSizes,
  priceRanges,
  selectedCategories,
  selectedSizes,
  selectedPrice,
  onToggleCategory,
  onToggleSize,
  onSelectPrice,
}: {
  allCategories: string[];
  allSizes: string[];
  priceRanges: PriceRange[];
  selectedCategories: string[];
  selectedSizes: string[];
  selectedPrice: string | null;
  onToggleCategory: (c: string) => void;
  onToggleSize: (s: string) => void;
  onSelectPrice: (p: string | null) => void;
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-xs tracking-[0.28em] uppercase text-forest">Filter</h2>

      <FilterSection title="Category">
        {allCategories.length === 0 ? (
          <p className="text-xs text-forest/40">No categories</p>
        ) : (
          <ul className="space-y-1">
            {allCategories.map((c) => (
              <li key={c}>
                <SidebarCheck
                  checked={selectedCategories.includes(c)}
                  onClick={() => onToggleCategory(c)}
                  label={c}
                />
              </li>
            ))}
          </ul>
        )}
      </FilterSection>

      <FilterSection title="Size">
        {allSizes.length === 0 ? (
          <p className="text-xs text-forest/40">No sizes</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {allSizes.map((s) => {
              const selected = selectedSizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onToggleSize(s)}
                  className={`text-[11px] tracking-wider uppercase py-1.5 rounded-full border transition-colors ${
                    selected
                      ? "border-forest bg-forest text-linen"
                      : "border-forest/20 bg-transparent text-forest/70 hover:border-forest/60 hover:text-forest"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
      </FilterSection>

      <FilterSection title="Price">
        <ul className="space-y-1">
          {priceRanges.map((r) => (
            <li key={r.label}>
              <SidebarCheck
                checked={selectedPrice === r.label}
                onClick={() => onSelectPrice(selectedPrice === r.label ? null : r.label)}
                label={r.label}
                circle
              />
            </li>
          ))}
        </ul>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] tracking-[0.28em] uppercase text-forest/55 mb-3 pb-2 border-b border-forest/10">
        {title}
      </h3>
      {children}
    </div>
  );
}

function SidebarCheck({
  checked,
  onClick,
  label,
  circle = false,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  circle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center gap-3 py-1.5 text-sm text-left transition-colors ${
        checked ? "text-forest" : "text-forest/70 hover:text-forest"
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-[15px] h-[15px] border transition-colors ${
          circle ? "rounded-full" : "rounded-[3px]"
        } ${
          checked
            ? "border-forest bg-forest text-linen"
            : "border-forest/30 bg-white/40 group-hover:border-forest/60"
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={3.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

function Chip({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 bg-fern/20 text-forest text-xs px-3 py-1.5 rounded-full">
      {label}
      <button
        type="button"
        onClick={onClear}
        className="text-forest/55 hover:text-forest"
        aria-label={`Remove ${label}`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}
