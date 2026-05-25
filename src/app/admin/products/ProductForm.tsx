"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductColor } from "@/lib/products";
import { SIZE_OPTIONS } from "@/lib/sizes";

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
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);

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
  const [material, setMaterial] = useState(product?.details.material ?? "");
  const [fit, setFit] = useState(product?.details.fit ?? "");
  const [origin, setOrigin] = useState(product?.details.origin ?? "Responsibly made in Sri Lanka");
  const [colors, setColors] = useState<ProductColor[]>(
    product?.colors ?? [{ name: "", hex: "#EDE6D3" }]
  );
  const [sizes, setSizes] = useState<string[]>(
    product?.sizes ?? ["S", "M", "L", "XL"]
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [imageUrl2, setImageUrl2] = useState(product?.imageUrl2 ?? "");
  const [uploadingImage1, setUploadingImage1] = useState(false);
  const [uploadingImage2, setUploadingImage2] = useState(false);

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

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 1 | 2
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const setUploading = slot === 1 ? setUploadingImage1 : setUploadingImage2;
    const setUrl = slot === 1 ? setImageUrl : setImageUrl2;
    const inputRef = slot === 1 ? fileRef1 : fileRef2;

    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setUrl(json.url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
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

    const payload = {
      name: name.trim(),
      category: category.trim(),
      price_display: priceDisplay.trim(),
      price_value: priceValue,
      original_price: originalPrice.trim() || null,
      tag: tag.trim() || null,
      description: description.trim(),
      in_stock: sizes.length > 0,
      material: material.trim(),
      fit: fit.trim(),
      origin: origin.trim(),
      colors: cleanColors,
      sizes,
      image_url: imageUrl.trim() || null,
      image_url_2: imageUrl2.trim() || null,
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

      {/* Images */}
      <Section title="Product images" subtitle="Primary is required-ish; secondary is optional">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageSlot
            label="Primary image"
            value={imageUrl}
            onChange={setImageUrl}
            uploading={uploadingImage1}
            inputRef={fileRef1}
            onFile={(e) => handleImageUpload(e, 1)}
          />
          <ImageSlot
            label="Secondary image"
            value={imageUrl2}
            onChange={setImageUrl2}
            uploading={uploadingImage2}
            inputRef={fileRef2}
            onFile={(e) => handleImageUpload(e, 2)}
          />
        </div>
      </Section>

      {/* Colors */}
      <Section title="Colours" subtitle="At least one">
        <div className="space-y-2">
          {colors.map((c, idx) => (
            <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
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
                placeholder="#EDE6D3"
                className="w-28 flex-shrink-0 border border-gray-200 rounded px-3 py-2 text-sm font-mono uppercase bg-white text-gray-800 focus:outline-none focus:border-forest"
              />
              <input
                type="text"
                value={c.name}
                onChange={(e) => updateColor(idx, { name: e.target.value })}
                placeholder="Colour name (e.g. Natural)"
                className="flex-1 min-w-0 border border-gray-200 rounded px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:border-forest"
              />
              <button
                type="button"
                onClick={() => removeColor(idx)}
                className="text-xs text-red-600 hover:underline px-2 flex-shrink-0"
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
      <Section
        title="Sizes"
        subtitle="Ticked = in stock. Untick to mark a size as sold out — it still shows on the product page with a strikethrough. If all sizes are unticked the product is marked Out of Stock."
      >
        <div className="flex gap-2 flex-wrap">
          {SIZE_OPTIONS.map((s) => {
            const inStock = sizes.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                title={inStock ? "In stock — click to mark sold out" : "Sold out — click to mark in stock"}
                className={`min-w-[48px] px-4 py-2 text-xs font-semibold uppercase tracking-wider border-2 rounded transition-colors ${
                  inStock
                    ? "bg-forest text-linen border-forest"
                    : "bg-red-50 text-red-700/70 border-red-200 line-through decoration-2 hover:border-red-300"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 flex-wrap text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-forest" />
            In stock
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-50 border-2 border-red-200" />
            Sold out
          </span>
          <span className="ml-auto flex items-center gap-2 font-semibold uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full ${sizes.length > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
            <span className={sizes.length > 0 ? "text-emerald-700" : "text-red-600"}>
              Product status: {sizes.length > 0 ? "In Stock" : "Out of Stock"}
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
              placeholder="Regular fit — true to size"
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
          disabled={submitting || uploadingImage1 || uploadingImage2}
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
  inputRef,
  onFile,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  uploading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="border border-gray-100 rounded p-4 bg-gray-50/40">
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
              ref={inputRef}
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
