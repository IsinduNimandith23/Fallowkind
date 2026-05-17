"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import type { Product, ProductColor } from "@/lib/products";

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
  const [openMenu, setOpenMenu] = useState<null | "category" | "color" | "size" | "price" | "sort">(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("default");

  const filterBarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click / escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
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

  const allColors = useMemo(() => {
    const map = new Map<string, ProductColor>();
    products.forEach((p) => p.colors.forEach((c) => map.set(c.name, c)));
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
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
      if (selectedColors.length > 0 && !p.colors.some((c) => selectedColors.includes(c.name))) return false;
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
  }, [products, query, selectedCategories, selectedColors, selectedSizes, selectedPrice, sort]);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const activeFilterCount =
    selectedCategories.length + selectedColors.length + selectedSizes.length + (selectedPrice ? 1 : 0);

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedPrice(null);
    setQuery("");
  };

  return (
    <>
      {/* Hero banner — admin-managed image, extends under the navbar like the homepage hero */}
      <section className="relative -mt-20 h-[460px] md:h-[560px] overflow-hidden bg-linen">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={bannerUrl}
          src={bannerUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </section>

      <div className="page-container px-6 md:px-12 lg:px-24 py-10 md:py-14">
        {/* Filter bar */}
        <div
          ref={filterBarRef}
          className="relative flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-forest/15 pb-5 mb-10"
        >
          <span className="text-xs tracking-[0.25em] uppercase text-forest/55 mr-2">Filter by</span>

          <FilterDropdown
            label="Categories"
            active={selectedCategories.length}
            open={openMenu === "category"}
            onToggle={() => setOpenMenu(openMenu === "category" ? null : "category")}
          >
            <div className="py-2 min-w-[180px]">
              {allCategories.length === 0 && (
                <p className="px-4 py-2 text-xs text-forest/40">No categories</p>
              )}
              {allCategories.map((c) => (
                <CheckRow
                  key={c}
                  checked={selectedCategories.includes(c)}
                  onClick={() => setSelectedCategories(toggle(selectedCategories, c))}
                  label={c}
                />
              ))}
            </div>
          </FilterDropdown>

          <FilterDropdown
            label="Color"
            active={selectedColors.length}
            open={openMenu === "color"}
            onToggle={() => setOpenMenu(openMenu === "color" ? null : "color")}
          >
            <div className="py-3 min-w-[180px]">
              <p className="px-4 pb-2 text-[10px] tracking-[0.25em] uppercase text-forest/45">Colors</p>
              {allColors.length === 0 && (
                <p className="px-4 py-2 text-xs text-forest/40">No colors</p>
              )}
              {allColors.map((c) => {
                const selected = selectedColors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColors(toggle(selectedColors, c.name))}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                      selected ? "bg-fern/25 text-forest" : "text-forest/80 hover:bg-white/40"
                    }`}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-forest/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="flex-1">{c.name}</span>
                    {selected && (
                      <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </FilterDropdown>

          <FilterDropdown
            label="Size"
            active={selectedSizes.length}
            open={openMenu === "size"}
            onToggle={() => setOpenMenu(openMenu === "size" ? null : "size")}
          >
            <div className="p-3 min-w-[180px]">
              {allSizes.length === 0 && (
                <p className="px-2 py-2 text-xs text-forest/40">No sizes</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {allSizes.map((s) => {
                  const selected = selectedSizes.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSizes(toggle(selectedSizes, s))}
                      className={`text-xs tracking-wider uppercase py-2 rounded-full border backdrop-blur-md transition-colors ${
                        selected
                          ? "border-forest bg-forest text-linen"
                          : "border-white/55 bg-white/30 text-forest/70 hover:border-forest hover:bg-white/50"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </FilterDropdown>

          <FilterDropdown
            label="Price"
            active={selectedPrice ? 1 : 0}
            open={openMenu === "price"}
            onToggle={() => setOpenMenu(openMenu === "price" ? null : "price")}
          >
            <div className="py-2 min-w-[200px]">
              {PRICE_RANGES.map((r) => (
                <CheckRow
                  key={r.label}
                  checked={selectedPrice === r.label}
                  onClick={() => setSelectedPrice(selectedPrice === r.label ? null : r.label)}
                  label={r.label}
                />
              ))}
            </div>
          </FilterDropdown>

          {/* Search input */}
          <div className="relative flex-1 min-w-[160px] max-w-xs ml-auto md:ml-2">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-forest/40 pointer-events-none"
              fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full glass-input pl-10 pr-4 py-2 text-sm text-forest placeholder:text-forest/35"
              aria-label="Search products"
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}
              className="flex items-center gap-1.5 text-sm text-forest hover:text-sage transition-colors"
              aria-haspopup="true"
              aria-expanded={openMenu === "sort"}
            >
              <span>{SORT_LABELS[sort]}</span>
              <svg
                className={`w-3 h-3 transition-transform ${openMenu === "sort" ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openMenu === "sort" && (
              <div className="absolute top-full right-0 mt-3 glass-panel overflow-hidden z-30 min-w-[200px]">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => { setSort(k); setOpenMenu(null); }}
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
          <div className="flex flex-wrap gap-2 mb-8">
            {selectedCategories.map((c) => (
              <Chip key={`cat-${c}`} label={c} onClear={() => setSelectedCategories(selectedCategories.filter((v) => v !== c))} />
            ))}
            {selectedColors.map((c) => (
              <Chip key={`col-${c}`} label={c} onClear={() => setSelectedColors(selectedColors.filter((v) => v !== c))} />
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

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
          {filtered.map((p, i) => (
            <AnimateOnScroll key={p.id} delay={i * 50}>
              <Link href={`/shop/${p.id}`} className="group block">
                <div className="relative card-img bg-cream/40 backdrop-blur-sm border border-white/40 shadow-sm aspect-[4/5] mb-4">
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
                  <div className="absolute bottom-0 inset-x-0 bg-forest/80 backdrop-blur-md text-linen text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    View Product
                  </div>
                </div>
                <p className="text-sm text-forest group-hover:text-sage transition-colors duration-200">
                  {p.name}
                </p>
                <p className="text-sm text-forest/70 mt-1">{p.price}</p>
                {p.colors.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    {p.colors.slice(0, 5).map((c) => (
                      <span
                        key={c.name}
                        title={c.name}
                        className="inline-block w-3 h-3 rounded-full border border-forest/20"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                    {p.colors.length > 5 && (
                      <span className="text-[10px] text-forest/50 ml-1">+{p.colors.length - 5}</span>
                    )}
                  </div>
                )}
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
    </>
  );
}

function FilterDropdown({
  label,
  active,
  open,
  onToggle,
  children,
}: {
  label: string;
  active: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-1.5 text-sm transition-colors ${
          active > 0 ? "text-forest font-medium" : "text-forest/75 hover:text-forest"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{label}</span>
        {active > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-forest text-linen text-[10px] px-1">
            {active}
          </span>
        )}
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-3 glass-panel overflow-hidden z-30">
          {children}
        </div>
      )}
    </div>
  );
}

function CheckRow({ checked, onClick, label }: { checked: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
        checked ? "bg-fern/25 text-forest" : "text-forest/80 hover:bg-white/40"
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-full border ${
          checked ? "border-forest bg-forest text-linen" : "border-forest/30 bg-white/40"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
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
