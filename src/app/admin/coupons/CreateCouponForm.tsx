"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCouponForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_value: "",
    max_uses: "",
    expires_at: "",
  });

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code.trim().toUpperCase(),
        discountType: form.discount_type,
        discountValue: Number(form.discount_value),
        minOrderValue: form.min_order_value ? Number(form.min_order_value) : 0,
        maxUses: form.max_uses ? Number(form.max_uses) : null,
        expiresAt: form.expires_at || null,
      }),
    });

    if (res.ok) {
      setOpen(false);
      setForm({ code: "", discount_type: "percentage", discount_value: "", min_order_value: "", max_uses: "", expires_at: "" });
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create coupon.");
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-4 py-2 bg-forest text-linen text-sm rounded hover:bg-forest/90 transition-colors duration-150"
      >
        {open ? "Cancel" : "+ New Coupon"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white border border-gray-100 rounded-lg shadow-sm p-6 grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Code</label>
            <input
              required
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="e.g. SUMMER20"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-forest/50 uppercase placeholder:normal-case"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
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

          {error && <p className="col-span-2 text-xs text-red-600">{error}</p>}

          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-forest text-linen text-sm rounded hover:bg-forest/90 disabled:opacity-50 transition-colors duration-150"
            >
              {loading ? "Creating…" : "Create Coupon"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
