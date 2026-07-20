"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import type { Product } from "@/lib/products";
import { SIZE_OPTIONS } from "@/lib/sizes";
import { productLowStockLabel } from "@/lib/stock";
import { GENDER_OPTIONS, genderMatches, parseGender, type Gender } from "@/lib/gender";
import { CATEGORY_OPTIONS } from "@/lib/categories";

type SortKey = "default" | "price-asc" | "price-desc" | "name-asc";

const SORT_LABELS: Record<SortKey, string> = {
  "default": "Default",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "name-asc": "Name: A–Z",
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

const ALL_TAGS = ["New", "Bestseller", "Offer", "Limited"];

function displayTag(t: string): string {
  return t === "Sale" ? "Offer" : t;
}

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

export default function ShopGrid({
  products,
  bannerUrl,
  bannerMobileUrl,
}: {
  products: Product[];
  bannerUrl: string;
  bannerMobileUrl: string;
}) {
  // Fall back to the desktop banner on mobile if no mobile-specific image is set.
  const mobileSrc = bannerMobileUrl || bannerUrl;

  // The navbar's Shop dropdown links to /shop?gender=...&category=... . Seed the
  // filters from the URL, and re-sync when the shopper picks another entry from
  // that dropdown (same route, so this component is not remounted).
  const searchParams = useSearchParams();
  const genderParam = parseGender(searchParams.get("gender"));

  // Resolve the category against what products actually carry, so a link that
  // differs only in casing still matches. An unknown value is kept verbatim -
  // it shows as a chip over an empty grid rather than being silently dropped.
  const categoryParam = useMemo(() => {
    const raw = searchParams.get("category")?.trim();
    if (!raw) return null;
    const match = products.find(
      (p) => p.category.toLowerCase() === raw.toLowerCase()
    );
    return match?.category ?? raw;
  }, [searchParams, products]);

  const [selectedGender, setSelectedGender] = useState<Gender | null>(genderParam);
  useEffect(() => { setSelectedGender(genderParam); }, [genderParam]);

  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [filterBtnPulse, setFilterBtnPulse] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  useEffect(() => {
    setSelectedCategories(categoryParam ? [categoryParam] : []);
  }, [categoryParam]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<"in" | "out" | null>(null);
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
        setMobileFiltersVisible(false);
        window.setTimeout(() => setMobileFiltersOpen(false), 300);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Drive enter/exit transition for the mobile filter drawer
  useEffect(() => {
    if (mobileFiltersOpen) {
      const id = requestAnimationFrame(() => setMobileFiltersVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setMobileFiltersVisible(false);
  }, [mobileFiltersOpen]);

  // Signal to global floating UI (e.g. welcome-coupon FAB) to hide while drawer is open
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    document.body.classList.add("drawer-open");
    return () => document.body.classList.remove("drawer-open");
  }, [mobileFiltersOpen]);

  const openMobileFilters = () => {
    setFilterBtnPulse(true);
    setMobileFiltersOpen(true);
    window.setTimeout(() => setFilterBtnPulse(false), 450);
  };

  const closeMobileFilters = () => {
    setMobileFiltersVisible(false);
    window.setTimeout(() => setMobileFiltersOpen(false), 300);
  };

  // Derive filter options from products
  // Seeded with the canonical list - same as sizes below - so a category the
  // catalogue does not carry yet still appears in the filter and in the navbar
  // dropdown that links to it. Any ad-hoc category typed into the admin form is
  // picked up from the products themselves.
  const allCategories = useMemo(() => {
    const set = new Set<string>(CATEGORY_OPTIONS);
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [products]);

  const allSizes = useMemo(() => {
    const set = new Set<string>(SIZE_OPTIONS);
    products.forEach((p) => p.sizes.forEach((s) => set.add(s)));
    return sortSizes(Array.from(set));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (selectedGender && !genderMatches(p.gender, selectedGender)) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (selectedSizes.length > 0 && !p.sizes.some((s) => selectedSizes.includes(s))) return false;
      if (selectedTags.length > 0 && (!p.tag || !selectedTags.includes(displayTag(p.tag)))) return false;
      if (selectedAvailability === "in" && !p.inStock) return false;
      if (selectedAvailability === "out" && p.inStock) return false;
      return true;
    });

    if (sort === "price-asc") list = [...list].sort((a, b) => a.priceValue - b.priceValue);
    else if (sort === "price-desc") list = [...list].sort((a, b) => b.priceValue - a.priceValue);
    else if (sort === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));

    return list;
  }, [products, query, selectedGender, selectedCategories, selectedSizes, selectedTags, selectedAvailability, sort]);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  const activeFilterCount =
    selectedCategories.length + selectedSizes.length + selectedTags.length +
    (selectedAvailability ? 1 : 0) + (selectedGender ? 1 : 0);

  const clearAll = () => {
    setSelectedGender(null);
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedTags([]);
    setSelectedAvailability(null);
    setQuery("");
  };

  return (
    <>
      {/* Hero banner - admin-managed image, extends under the navbar like the homepage hero.
          Separate mobile/desktop images so each fills its viewport without awkward cropping. */}
      <section className="relative -mt-20 h-[340px] sm:h-[460px] md:h-[560px] overflow-hidden bg-linen">
        {/* Mobile (< md) */}
        <Image
          key={`m-${mobileSrc}`}
          src={mobileSrc}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover md:hidden"
        />
        {/* Desktop (>= md) */}
        <Image
          key={`d-${bannerUrl}`}
          src={bannerUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover hidden md:block"
        />
      </section>

      <div className="page-container px-6 md:px-12 lg:px-20 py-10 md:py-14">
        <div className="md:grid md:grid-cols-[240px_1fr] md:gap-x-12 lg:gap-x-16">
          {/* Sidebar - desktop */}
          <aside className="hidden md:block">
            <div className="sticky top-28">
              <FilterSidebar
                allCategories={allCategories}
                allSizes={allSizes}
                allTags={ALL_TAGS}
                selectedGender={selectedGender}
                onSelectGender={setSelectedGender}
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedTags={selectedTags}
                selectedAvailability={selectedAvailability}
                onToggleCategory={(c) => setSelectedCategories(toggle(selectedCategories, c))}
                onToggleSize={(s) => setSelectedSizes(toggle(selectedSizes, s))}
                onToggleTag={(t) => setSelectedTags(toggle(selectedTags, t))}
                onSelectAvailability={(a) => setSelectedAvailability(a)}
              />
            </div>
          </aside>

          {/* Main column */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 md:mb-8">
              {/* Mobile filters trigger */}
              <button
                type="button"
                onClick={openMobileFilters}
                className="md:hidden relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/55 backdrop-blur-md border border-white/70 text-sm text-forest transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-95"
                aria-label="Open filters"
              >
                <span
                  className={`pointer-events-none absolute inset-0 rounded-full border border-forest/40 ${
                    filterBtnPulse ? "animate-filter-pulse" : "opacity-0"
                  }`}
                  aria-hidden="true"
                />
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ease-out ${
                    filterBtnPulse ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  viewBox="0 0 24 24"
                >
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
              <div className="relative flex-1 min-w-[180px] max-w-md group order-last sm:order-none w-full sm:w-auto">
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
                {selectedGender && (
                  <Chip label={selectedGender} onClear={() => setSelectedGender(null)} />
                )}
                {selectedAvailability && (
                  <Chip
                    label={selectedAvailability === "in" ? "In Stock" : "Out of Stock"}
                    onClear={() => setSelectedAvailability(null)}
                  />
                )}
                {selectedCategories.map((c) => (
                  <Chip key={`cat-${c}`} label={c} onClear={() => setSelectedCategories(selectedCategories.filter((v) => v !== c))} />
                ))}
                {selectedSizes.map((s) => (
                  <Chip key={`sz-${s}`} label={s} onClear={() => setSelectedSizes(selectedSizes.filter((v) => v !== s))} />
                ))}
                {selectedTags.map((t) => (
                  <Chip key={`tg-${t}`} label={displayTag(t)} onClear={() => setSelectedTags(selectedTags.filter((v) => v !== t))} />
                ))}
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
                    <>
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(min-width: 768px) 33vw, 50vw"
                        className={`object-cover transition-all duration-500 ease-out ${
                          p.imageUrl2
                            ? "group-hover:opacity-0 group-hover:scale-105"
                            : "group-hover:scale-105"
                        }`}
                      />
                      {p.imageUrl2 && (
                        <Image
                          src={p.imageUrl2}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 33vw, 50vw"
                          className="object-cover opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out"
                        />
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-fern/30 to-sage/15" />
                  )}
                  {p.inStock && p.tag && (
                    <span className="absolute top-3 left-3 tag-pill z-10">
                      {displayTag(p.tag)}
                    </span>
                  )}
                  {!p.inStock && (
                    <span className="absolute top-3 left-3 tag-pill z-10 !bg-forest/50">
                      Sold Out
                    </span>
                  )}
                  {p.inStock && productLowStockLabel(p.sizes, p.sizeQuantities) && (
                    <span className="absolute top-3 right-3 tag-pill z-10 !bg-linen/90 !text-forest !border-forest/20 whitespace-nowrap">
                      {productLowStockLabel(p.sizes, p.sizeQuantities)}
                    </span>
                  )}
                  {p.inStock && (
                    <div className="absolute bottom-0 inset-x-0 bg-forest/80 backdrop-blur-md text-linen text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                      View Product
                    </div>
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
            className={`absolute inset-0 bg-forest/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              mobileFiltersVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMobileFilters}
          />
          <div
            className={`absolute inset-y-0 left-0 w-[85%] max-w-sm bg-linen shadow-xl flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0.24,1)] ${
              mobileFiltersVisible ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-forest/10">
              <span className="text-xs tracking-[0.28em] uppercase text-forest">Filters</span>
              <button
                type="button"
                onClick={closeMobileFilters}
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
                allTags={ALL_TAGS}
                selectedGender={selectedGender}
                onSelectGender={setSelectedGender}
                selectedCategories={selectedCategories}
                selectedSizes={selectedSizes}
                selectedTags={selectedTags}
                selectedAvailability={selectedAvailability}
                onToggleCategory={(c) => setSelectedCategories(toggle(selectedCategories, c))}
                onToggleSize={(s) => setSelectedSizes(toggle(selectedSizes, s))}
                onToggleTag={(t) => setSelectedTags(toggle(selectedTags, t))}
                onSelectAvailability={(a) => setSelectedAvailability(a)}
                showHeading={false}
              />
            </div>
            <div className="px-6 py-4 border-t border-forest/10">
              <button
                type="button"
                onClick={closeMobileFilters}
                className="w-full py-3 rounded-full bg-forest text-linen text-xs tracking-[0.2em] uppercase transition-transform duration-200 ease-out active:scale-[0.98]"
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

function FilterSidebar({
  allCategories,
  allSizes,
  allTags,
  selectedGender,
  onSelectGender,
  selectedCategories,
  selectedSizes,
  selectedTags,
  selectedAvailability,
  onToggleCategory,
  onToggleSize,
  onToggleTag,
  onSelectAvailability,
  showHeading = true,
}: {
  allCategories: string[];
  allSizes: string[];
  allTags: string[];
  selectedGender: Gender | null;
  onSelectGender: (g: Gender | null) => void;
  selectedCategories: string[];
  selectedSizes: string[];
  selectedTags: string[];
  selectedAvailability: "in" | "out" | null;
  onToggleCategory: (c: string) => void;
  onToggleSize: (s: string) => void;
  onToggleTag: (t: string) => void;
  onSelectAvailability: (a: "in" | "out" | null) => void;
  showHeading?: boolean;
}) {
  return (
    <div className="space-y-8">
      {showHeading && (
        <h2 className="text-xs tracking-[0.28em] uppercase text-forest">Filter</h2>
      )}

      <FilterSection title="Gender">
        <ul className="space-y-1">
          {GENDER_OPTIONS.map((g) => (
            <li key={g}>
              <SidebarCheck
                checked={selectedGender === g}
                onClick={() => onSelectGender(selectedGender === g ? null : g)}
                label={g}
                circle
              />
            </li>
          ))}
        </ul>
      </FilterSection>

      <FilterSection title="Availability">
        <ul className="space-y-1">
          <li>
            <SidebarCheck
              checked={selectedAvailability === "in"}
              onClick={() => onSelectAvailability(selectedAvailability === "in" ? null : "in")}
              label="In Stock"
              circle
            />
          </li>
          <li>
            <SidebarCheck
              checked={selectedAvailability === "out"}
              onClick={() => onSelectAvailability(selectedAvailability === "out" ? null : "out")}
              label="Out of Stock"
              circle
            />
          </li>
        </ul>
      </FilterSection>

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

      <FilterSection title="Tag">
        {allTags.length === 0 ? (
          <p className="text-xs text-forest/40">No tags</p>
        ) : (
          <ul className="space-y-1">
            {allTags.map((t) => (
              <li key={t}>
                <SidebarCheck
                  checked={selectedTags.includes(t)}
                  onClick={() => onToggleTag(t)}
                  label={displayTag(t)}
                />
              </li>
            ))}
          </ul>
        )}
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
