"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CouponForm, { type CouponInitial } from "./CouponForm";

export default function CouponRowActions({ coupon }: { coupon: CouponInitial }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Failed to delete coupon.");
    }
    setDeleting(false);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-gray-500 hover:text-forest transition-colors duration-150"
        >
          Edit
        </button>
        <span className="text-gray-200">|</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors duration-150 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[240] flex items-start justify-center bg-black/40 p-4 overflow-y-auto"
          onClick={() => setEditing(false)}
        >
          <div
            className="mt-6 md:mt-16 w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Edit coupon</h2>
              <button
                onClick={() => setEditing(false)}
                className="text-white/70 hover:text-white text-sm"
              >
                Close
              </button>
            </div>
            <CouponForm
              mode="edit"
              initial={coupon}
              onDone={() => setEditing(false)}
              onCancel={() => setEditing(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
