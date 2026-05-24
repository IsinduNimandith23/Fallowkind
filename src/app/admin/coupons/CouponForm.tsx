"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type CouponInitial = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number | string;
  min_order_value: number | string | null;
  max_uses: number | null;
  expires_at: string | null;
};

type Props = {
  mode: "create" | "edit";
  initial?: CouponInitial;
  onDone: () => void;
  onCancel: () => void;
};

export default function CouponForm({ mode, initial, onDone, onCancel }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: initial?.code ?? "",
    discount_type: (initial?.discount_type as string) ?? "percentage",
    discount_value: initial?.discount_value != null ? String(initial.discount_value) : "",
    min_order_value:
      initial?.min_order_value != null && Number(initial.min_order_value) > 0
        ? String(initial.min_order_value)
        : "",
    max_uses: initial?.max_uses != null ? String(initial.max_uses) : "",
    expires_at: initial?.expires_at ? initial.expires_at.slice(0, 10) : "",
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discount_type,
      discountValue: Number(form.discount_value),
      minOrderValue: form.min_order_value ? Number(form.min_order_value) : 0,
      maxUses: form.max_uses ? Number(form.max_uses) : null,
      expiresAt: form.expires_at || null,
    };

    const res = await fetch("/api/admin/coupons", {
      method: mode === "edit" ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mode === "edit" ? { id: initial?.id, ...payload } : payload),
    });

    if (res.ok) {
      router.refresh();
      onDone();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Failed to ${mode === "edit" ? "update" : "create"} coupon.`);
    }
    setLoading(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
    >
      <div className="sm:col-span-1">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Code</label>
        <input
          required
          value={form.code}
          onChange={(e) => set("code", e.target.value)}
          placeholder="e.g. SUMMER20"
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-forest/50 uppercase placeholder:normal-case"
        />
      </div>

      <div className="sm:col-span-1">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Discount Type</label>
        <select
          value={form.discount_type}
          onChange={(e) => set("discount_type", e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-forest/50"
        >
          <option value="percentage">Percentage (%)</option>
          <option value="fixed">Fixed Amount (Rs.)</option>
        </select>
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
          {form.discount_type === "percentage" ? "Discount %" : "Discount Amount (Rs.)"}
        </label>
        <input
          required
          type="number"
          min="1"
          value={form.discount_value}
          onChange={(e) => set("discount_value", e.target.value)}
          placeholder={form.discount_type === "percentage" ? "10" : "500"}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-forest/50"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Min Order Value (Rs.)</label>
        <input
          type="number"
          min="0"
          value={form.min_order_value}
          onChange={(e) => set("min_order_value", e.target.value)}
          placeholder="0"
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-forest/50"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Max Uses (leave blank = unlimited)</label>
        <input
          type="number"
          min="1"
          value={form.max_uses}
          onChange={(e) => set("max_uses", e.target.value)}
          placeholder="Unlimited"
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-forest/50"
        />
      </div>

      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Expires At (optional)</label>
        <input
          type="date"
          value={form.expires_at}
          onChange={(e) => set("expires_at", e.target.value)}
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-forest/50"
        />
      </div>

      {error && <p className="sm:col-span-2 text-xs text-red-600">{error}</p>}

      <div className="sm:col-span-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-50 transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-forest text-linen text-sm rounded hover:bg-forest/90 disabled:opacity-50 transition-colors duration-150"
        >
          {loading
            ? mode === "edit"
              ? "Saving…"
              : "Creating…"
            : mode === "edit"
              ? "Save Changes"
              : "Create Coupon"}
        </button>
      </div>
    </form>
  );
}
