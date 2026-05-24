"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductColor } from "@/lib/products";

const SIZE_OPTIONS = ["S", "M", "L", "XL"];
const CATEGORY_OPTIONS = ["T-Shirts", "Graphic", "Heavyweight", "Oversized"];
const TAG_OPTIONS = ["", "New", "Bestseller", "Sale", "Limited"];

type Props = {
  mode: "create" | "edit";
  product?: Product;
};

function parsePriceDigits(s: string): number {
  // Drop currency prefixes like "Rs." or "USD." (letters + optional dot),
  // then drop everything except digits, commas, and decimal points,
  // then drop thousands separators.
  const noPrefix = s.replace(/[a-zA-Z]+\.?/g, "");
  const cleaned = noPrefix.replace(/[^\d.,]/g, "").replace(/,/g, "");
  return parseFloat(cleaned) || 0;
}

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "T-Shirts");
  const [priceDisplay, setPriceDisplay] = useState(product?.price ?? "Rs. ");
  const [priceValue, setPriceValue] = useState<number>(
    product ? parsePriceDigits(product.price) : 0
  );
  const [priceValueTouched, setPriceValueTouched] = useState(false);
  const [originalPrice, setOriginalPrice] = useState(product?.originalPrice ?? "");
  const [tag, setTag] = useState(product?.tag ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [material, setMaterial] = useState(product?.details.material ?? "");
  const [fit, setFit] = useState(product?.details.fit ?? "");
  const [care, setCare] = useState(product?.details.care ?? "");
  const [origin, setOrigin] = useState(product?.details.origin ?? "Responsibly made in Sri Lanka");
  const [colors, setColors] = useState<ProductColor[]>(
    product?.colors ?? [{ name: "Natural", hex: "#EDE6D3" }]
  );
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes ?? ["S", "M", "L", "XL"]
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updatePriceDisplay(value: string) {
    setPriceDisplay(value);
    if (!priceValueTouched) {
      setPriceValue(parsePriceDigits(value));
    }
  }

  function updateColor(idx: number, patch: Partial<ProductColor>) {
    setColors((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }
  function addColor() {
    setColors((prev) => [...prev, { name: "", hex: "#888888" }]);
  }
  function removeColor(idx: number) {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleSize(s: string) {
    setSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setImageUrl(json.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setUploadingImage(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanColors = colors
      .filter((c) => c.name.trim() && c.hex.trim())
      .map((c) => ({ name: c.name.trim(), hex: c.hex.trim() }));

    if (!name.trim()) return setError("Name is required");
    if (!category.trim()) return setError("Category is required");
    if (!priceDisplay.trim()) return setError("Price (display) is required");
    if (priceValue <= 0) return setError("Price value must be greater than zero");
    if (cleanColors.length === 0) return setError("Add at least one colour");
    if (sizes.length === 0) return setError("Choose at least one size");

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price_display: priceDisplay.trim(),
      price_value: priceValue,
      original_price: originalPrice.trim() || null,
      tag: tag.trim() || null,
      description: description.trim(),
      in_stock: inStock,
      material: material.trim(),
      fit: fit.trim(),
      care: care.trim(),
      origin: origin.trim(),
      colors: cleanColors,
      sizes,
      image_url: imageUrl.trim() || null,
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
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="category-options"
              className="input"
              required
            />
            <datalist id="category-options">
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Tag (optional)">
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="input"
            >
              {TAG_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t || "— None —"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="In stock">
            <label className="flex items-center gap-2 text-sm text-gray-700 pt-2">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 accent-forest"
              />
              Available for purchase
            </label>
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

      {/* Image */}
      <Section title="Product image">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          <div className="w-32 h-40 bg-cream rounded overflow-hidden flex items-center justify-center flex-shrink-0">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] text-forest/30 tracking-wider uppercase text-center px-2">
                No image
              </span>
            )}
          </div>
          <div className="flex-1 space-y-3">
            <Field label="Upload">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:bg-forest file:text-linen hover:file:bg-forest/90 cursor-pointer"
              />
              {uploadingImage && (
                <p className="text-xs text-gray-500 mt-1">Uploading…</p>
              )}
            </Field>
            <Field label="Or paste an image URL">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="input"
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Colors */}
      <Section title="Colours" subtitle="At least one">
        <div className="space-y-2">
          {colors.map((c, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="color"
                value={c.hex}
                onChange={(e) => updateColor(idx, { hex: e.target.value })}
                className="w-12 h-10 border border-gray-200 rounded cursor-pointer"
                aria-label="Colour swatch"
              />
              <input
                type="text"
                value={c.hex}
                onChange={(e) => updateColor(idx, { hex: e.target.value })}
                placeholder="#EDE6D3"
                className="input flex-shrink-0 w-32 font-mono uppercase"
              />
              <input
                type="text"
                value={c.name}
                onChange={(e) => updateColor(idx, { name: e.target.value })}
                placeholder="Colour name"
                className="input flex-1"
              />
              <button
                type="button"
                onClick={() => removeColor(idx)}
                className="text-xs text-red-600 hover:underline px-2"
                disabled={colors.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addColor}
            className="text-xs text-forest hover:underline font-semibold uppercase tracking-wider"
          >
            + Add colour
          </button>
        </div>
      </Section>

      {/* Sizes */}
      <Section title="Sizes" subtitle="At least one">
        <div className="flex gap-2 flex-wrap">
          {SIZE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSize(s)}
              className={`min-w-[48px] px-4 py-2 text-xs font-semibold uppercase tracking-wider border rounded transition-colors ${
                sizes.includes(s)
                  ? "bg-forest text-linen border-forest"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
              }`}
            >
              {s}
            </button>
          ))}
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
              placeholder="Regular fit — true to size"
              className="input"
            />
          </Field>
          <Field label="Care">
            <input
              type="text"
              value={care}
              onChange={(e) => setCare(e.target.value)}
              placeholder="Machine wash cold, tumble dry low"
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
          disabled={submitting || uploadingImage}
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
