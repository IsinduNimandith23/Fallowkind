"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductColor } from "@/lib/products";
import { SIZE_OPTIONS } from "@/lib/sizes";
import { lowStockLabel, LOW_STOCK_THRESHOLD, aggregateColorStock } from "@/lib/stock";
import { GENDER_OPTIONS, DEFAULT_GENDER, type Gender } from "@/lib/gender";
import { CATEGORY_OPTIONS } from "@/lib/categories";

const TAG_OPTIONS = ["", "New", "Bestseller", "Offer", "Limited"];

type Props = {
  mode: "create" | "edit";
  product?: Product;
};

// Editable per-colour row. `qty` is keyed by size, holding raw input strings:
// "" = in stock, untracked (∞); a number = tracked; "0" = sold out for this
// colour/size.
type ColorDraft = {
  hex: string;
  name: string;
  imageUrl: string;
  imageUrl2: string;
  // Optional extra photos, always EXTRA_IMAGE_SLOTS long so each slot keeps its
  // position while editing. Blank entries are dropped on save.
  extraImages: string[];
  qty: Record<string, string>;
};

// How many optional photos a colour can carry on top of front/back.
const EXTRA_IMAGE_SLOTS = 3;

function initExtraImages(existing?: string[]): string[] {
  return Array.from({ length: EXTRA_IMAGE_SLOTS }, (_, i) => existing?.[i] ?? "");
}

function parsePriceDigits(s: string): number {
  // Drop currency prefixes like "Rs." or "USD." (letters + optional dot),
  // then drop everything except digits, commas, and decimal points,
  // then drop thousands separators.
  const noPrefix = s.replace(/[a-zA-Z]+\.?/g, "");
  const cleaned = noPrefix.replace(/[^\d.,]/g, "").replace(/,/g, "");
  return parseFloat(cleaned) || 0;
}

// Build the per-colour drafts from a product. New products (and legacy ones
// without per-colour stock) seed every colour from the product-level stock so
// the storefront keeps looking identical until the owner sets real per-colour
// numbers.
function initColorDrafts(product?: Product): ColorDraft[] {
  const perColor = !!product && product.colors.some((c) => Array.isArray(c.sizes));

  const productQty: Record<string, string> = {};
  for (const s of SIZE_OPTIONS) {
    const inStock = product ? product.sizes.includes(s) : true;
    const n = product?.sizeQuantities?.[s];
    productQty[s] = !inStock ? "0" : n != null ? String(n) : "";
  }

  const base: ProductColor[] = product?.colors?.length
    ? product.colors
    : [{ name: "", hex: "#EDE6D3" }];

  return base.map((c) => {
    const qty: Record<string, string> = {};
    if (perColor && Array.isArray(c.sizes)) {
      for (const s of SIZE_OPTIONS) {
        const avail = c.sizes.includes(s);
        const n = c.sizeQuantities?.[s];
        qty[s] = !avail ? "0" : n != null ? String(n) : "";
      }
    } else {
      for (const s of SIZE_OPTIONS) qty[s] = productQty[s];
    }
    return {
      hex: c.hex,
      name: c.name,
      imageUrl: c.imageUrl ?? "",
      imageUrl2: c.imageUrl2 ?? "",
      extraImages: initExtraImages(c.extraImages),
      qty,
    };
  });
}

function emptyQty(): Record<string, string> {
  const qty: Record<string, string> = {};
  for (const s of SIZE_OPTIONS) qty[s] = "";
  return qty;
}

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "T-Shirts");
  // A product saved before the list was trimmed may carry a category that is no
  // longer offered. Keep it as an option so opening and saving that product
  // does not silently re-categorise it - the select would otherwise fall back
  // to the first entry.
  const categoryChoices = useMemo(() => {
    const set = new Set(CATEGORY_OPTIONS);
    if (product?.category) set.add(product.category);
    return Array.from(set);
  }, [product?.category]);

  const [gender, setGender] = useState<Gender>(product?.gender ?? DEFAULT_GENDER);
  const [priceDisplay, setPriceDisplay] = useState(product?.price ?? "Rs. ");
  const [priceValue, setPriceValue] = useState<number>(
    product ? parsePriceDigits(product.price) : 0
  );
  const [priceValueTouched, setPriceValueTouched] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice ?? "");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [material, setMaterial] = useState(product?.details.material ?? "");
  const [fit, setFit] = useState(product?.details.fit ?? "");
  const [origin, setOrigin] = useState(product?.details.origin ?? "Responsibly made in Sri Lanka");
  const [colors, setColors] = useState<ColorDraft[]>(() => initColorDrafts(product));
  // In-flight image uploads, keyed by `${colorIndex}-${slot}`.
  const [uploading, setUploading] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updatePriceDisplay(value: string) {
    setPriceDisplay(value);
    if (!priceValueTouched) {
      setPriceValue(parsePriceDigits(value));
    }
  }

  function updateColor(idx: number, patch: Partial<ColorDraft>) {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function updateColorQty(idx: number, size: string, value: string) {
    setColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, qty: { ...c.qty, [size]: value } } : c))
    );
  }
  function addColor() {
    setColors((prev) => [
      ...prev,
      {
        hex: "#888888",
        name: "",
        imageUrl: "",
        imageUrl2: "",
        extraImages: initExtraImages(),
        qty: emptyQty(),
      },
    ]);
  }
  function removeColor(idx: number) {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateColorExtraImage(idx: number, slot: number, value: string) {
    setColors((prev) =>
      prev.map((c, i) =>
        i === idx
          ? { ...c, extraImages: c.extraImages.map((u, j) => (j === slot ? value : u)) }
          : c
      )
    );
  }

  // `slot` is 1 for the front photo, 2 for the back, and 3.. for the optional
  // extras (extra index = slot - 3).
  async function handleColorImageUpload(
    idx: number,
    slot: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = `${idx}-${slot}`;
    setUploading((prev) => new Set(prev).add(key));
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      if (slot === 1) updateColor(idx, { imageUrl: json.url });
      else if (slot === 2) updateColor(idx, { imageUrl2: json.url });
      else updateColorExtraImage(idx, slot - 3, json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Build each colour's images + per-size stock. Same blank/0 rules as the
    // storefront: blank = in stock (untracked), a number = tracked, 0 = sold out.
    const cleanColors: ProductColor[] = [];
    for (const c of colors) {
      const cname = c.name.trim();
      const hex = c.hex.trim();
      if (!cname || !hex) continue;

      const cSizes: string[] = [];
      const cQuant: Record<string, number> = {};
      for (const s of SIZE_OPTIONS) {
        const raw = (c.qty[s] ?? "").trim();
        if (raw === "") {
          cSizes.push(s);
          continue;
        }
        const n = Number(raw);
        if (!Number.isFinite(n) || n < 0)
          return setError(`Quantity for ${cname} / ${s} must be 0 or more`);
        const q = Math.floor(n);
        if (q === 0) continue; // sold out for this colour/size
        cSizes.push(s);
        cQuant[s] = q;
      }

      const color: ProductColor = { name: cname, hex, sizes: cSizes, sizeQuantities: cQuant };
      if (c.imageUrl.trim()) color.imageUrl = c.imageUrl.trim();
      if (c.imageUrl2.trim()) color.imageUrl2 = c.imageUrl2.trim();
      // Extras are optional - only keep the slots that were filled in.
      const extras = c.extraImages.map((u) => u.trim()).filter(Boolean);
      if (extras.length) color.extraImages = extras;
      cleanColors.push(color);
    }

    if (!name.trim()) return setError("Name is required");
    if (!category.trim()) return setError("Category is required");
    if (!priceDisplay.trim()) return setError("Price (display) is required");
    if (priceValue <= 0) return setError("Price value must be greater than zero");
    if (cleanColors.length === 0) return setError("Add at least one colour");

    // Roll the per-colour stock up into the product-level aggregate used by the
    // shop grid, filters, restock logic and metadata.
    const agg = aggregateColorStock(cleanColors);
    // The grid/OG image comes from the first colour that has a photo.
    const firstWithImg = cleanColors.find((c) => c.imageUrl) ?? cleanColors[0];

    const payload = {
      name: name.trim(),
      category: category.trim(),
      gender,
      price_display: priceDisplay.trim(),
      price_value: priceValue,
      original_price: originalPrice.trim() || null,
      tag: tag.trim() || null,
      description: description.trim(),
      in_stock: agg.inStock,
      material: material.trim(),
      fit: fit.trim(),
      origin: origin.trim(),
      colors: cleanColors,
      sizes: agg.sizes,
      size_quantities: agg.sizeQuantities,
      image_url: firstWithImg.imageUrl || null,
      image_url_2: firstWithImg.imageUrl2 || null,
    };

    setSubmitting(true);
    try {
      const url =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setError(msg);
      setSubmitting(false);
    }
  }

  // Live "any colour in stock" indicator for the section footer.
  const anyInStock = colors.some((c) =>
    SIZE_OPTIONS.some((s) => {
      const raw = (c.qty[s] ?? "").trim();
      return raw === "" || Number(raw) > 0;
    })
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Basic info */}
      <Section title="Basic info">
        <Grid>
          <Field label="Name" required>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input"
              required
            >
              {categoryChoices.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Gender" required>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="input"
              required
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tag (optional)">
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="input"
            >
              {TAG_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t || "- None -"}
                </option>
              ))}
            </select>
          </Field>
        </Grid>
      </Section>

      {/* Pricing */}
      <Section title="Pricing">
        <Grid>
          <Field label="Price (display)" required help="What customers see, e.g. “Rs. 14,500”">
            <input
              type="text"
              value={priceDisplay}
              onChange={(e) => updatePriceDisplay(e.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Price value (number)" required help="Used for cart totals & coupon math">
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceValue}
              onChange={(e) => {
                setPriceValueTouched(true);
                setPriceValue(parseFloat(e.target.value) || 0);
              }}
              className="input"
              required
            />
          </Field>
          <Field label="Original price (optional)" help="Strike-through for sale items">
            <input
              type="text"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="Rs. 18,000"
              className="input"
            />
          </Field>
        </Grid>
      </Section>

      {/* Description */}
      <Section title="Description">
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="input resize-y"
          />
        </Field>
      </Section>

      {/* Colours: each has its own photos + per-size stock */}
      <Section
        title="Colours, photos & stock"
        subtitle={`Each colour has its own front/back photos and its own stock. Blank qty = in stock (not counted). 0 = that colour/size is sold out. When a size has ${LOW_STOCK_THRESHOLD} or fewer left the store shows an "Only X left" badge.`}
      >
        <div className="space-y-5">
          {colors.map((c, idx) => {
            const soldOutColor = SIZE_OPTIONS.every((s) => {
              const raw = (c.qty[s] ?? "").trim();
              return raw !== "" && Number(raw) === 0;
            });
            return (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 space-y-4"
              >
                {/* Colour identity */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                  <input
                    type="color"
                    value={c.hex}
                    onChange={(e) => updateColor(idx, { hex: e.target.value })}
                    className="w-12 h-10 border border-gray-200 rounded cursor-pointer flex-shrink-0"
                    aria-label="Colour swatch"
                  />
                  <input
                    type="text"
                    value={c.hex}
                    onChange={(e) => updateColor(idx, { hex: e.target.value })}
                    placeholder="#2C335D"
                    className="w-28 flex-shrink-0 border border-gray-200 rounded px-3 py-2 text-sm font-mono uppercase bg-white text-gray-800 focus:outline-none focus:border-forest"
                  />
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateColor(idx, { name: e.target.value })}
                    placeholder="Colour name (e.g. Navy Blue)"
                    className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:border-forest"
                  />
                  {soldOutColor && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 flex-shrink-0">
                      Sold out
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="text-xs text-red-600 hover:underline px-2 flex-shrink-0 disabled:text-gray-300 disabled:no-underline"
                    disabled={colors.length <= 1}
                  >
                    Remove
                  </button>
                </div>

                {/* Colour photos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageSlot
                    label="Front image"
                    value={c.imageUrl}
                    onChange={(v) => updateColor(idx, { imageUrl: v })}
                    uploading={uploading.has(`${idx}-1`)}
                    onFile={(e) => handleColorImageUpload(idx, 1, e)}
                  />
                  <ImageSlot
                    label="Back image"
                    value={c.imageUrl2}
                    onChange={(v) => updateColor(idx, { imageUrl2: v })}
                    uploading={uploading.has(`${idx}-2`)}
                    onFile={(e) => handleColorImageUpload(idx, 2, e)}
                  />
                </div>

                {/* Optional extra photos - never required to save */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Extra photos (optional)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {c.extraImages.map((url, slot) => (
                      <ImageSlot
                        key={slot}
                        label={`Extra image ${slot + 1}`}
                        value={url}
                        onChange={(v) => updateColorExtraImage(idx, slot, v)}
                        uploading={uploading.has(`${idx}-${slot + 3}`)}
                        onFile={(e) => handleColorImageUpload(idx, slot + 3, e)}
                      />
                    ))}
                  </div>
                </div>

                {/* Per-size stock for this colour */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Stock per size
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SIZE_OPTIONS.map((s) => {
                      const raw = (c.qty[s] ?? "").trim();
                      const n = raw === "" ? null : Number(raw);
                      const valid = n != null && Number.isFinite(n) && n >= 0;
                      const soldOut = valid && n === 0;
                      const label = valid && !soldOut ? lowStockLabel(n) : null;
                      return (
                        <div key={s} className="border border-gray-200 rounded bg-white p-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                              {s}
                            </span>
                            <span className="text-[10px] font-semibold uppercase tracking-wider">
                              {soldOut ? (
                                <span className="text-red-600">Sold out</span>
                              ) : label ? (
                                <span className="text-amber-600">{label}</span>
                              ) : (
                                <span className="text-emerald-700">In stock</span>
                              )}
                            </span>
                          </div>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={c.qty[s] ?? ""}
                            onChange={(e) => updateColorQty(idx, s, e.target.value)}
                            placeholder="∞"
                            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white text-gray-800 focus:outline-none focus:border-forest"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addColor}
            className="text-xs text-forest hover:underline font-semibold uppercase tracking-wider"
          >
            + Add colour
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4 flex-wrap text-[11px] text-gray-500">
          <span className="ml-auto flex items-center gap-2 font-semibold uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full ${anyInStock ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className={anyInStock ? "text-emerald-700" : "text-red-600"}>
              Product status: {anyInStock ? "In Stock" : "Out of Stock"}
            </span>
          </span>
        </div>
      </Section>

      {/* Details */}
      <Section title="Product details">
        <Grid>
          <Field label="Material">
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="100% Organic Cotton, 180gsm"
              className="input"
            />
          </Field>
          <Field label="Fit">
            <input
              type="text"
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              placeholder="Regular fit - true to size"
              className="input"
            />
          </Field>
          <Field label="Origin">
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="input"
            />
          </Field>
        </Grid>
      </Section>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-4 py-2.5">
          {error}
        </p>
      )}

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploading.size > 0}
          className="bg-forest text-linen px-6 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting
            ? "Saving…"
            : mode === "create"
            ? "Create Product"
            : "Save Changes"}
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
          background: white;
          color: #1f2937;
          transition: border-color 0.15s;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #2a3d2a;
        }
      `}</style>
    </form>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function ImageSlot({
  label,
  value,
  onChange,
  uploading,
  onFile,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  uploading: boolean;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="border border-gray-100 rounded p-4 bg-white">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="w-28 h-36 bg-cream rounded overflow-hidden flex items-center justify-center flex-shrink-0">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-forest/30 tracking-wider uppercase text-center px-2">
              No image
            </span>
          )}
        </div>
        <div className="flex-1 w-full space-y-3">
          <Field label="Upload">
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:bg-forest file:text-linen hover:file:bg-forest/90 cursor-pointer"
            />
            {uploading && (
              <p className="text-xs text-gray-500 mt-1">Uploading…</p>
            )}
          </Field>
          <Field label="Or paste an image URL">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://…"
              className="input"
            />
          </Field>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-red-600 hover:underline"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
      {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
    </label>
  );
}
