"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "processing", "delivered"];

export default function StatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  async function handleUpdate() {
    if (status === currentStatus) return;
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_status: status }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setSaved(false); }}
        className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-forest/50 capitalize"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={loading || status === currentStatus}
        className="px-4 py-2 text-sm bg-forest text-linen rounded hover:bg-forest/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
      >
        {loading ? "Saving…" : saved ? "Saved ✓" : "Update"}
      </button>
    </div>
  );
}
