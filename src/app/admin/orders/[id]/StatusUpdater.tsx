"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["pending", "processing", "delivered"];

export default function StatusUpdater({
  orderId,
  currentStatus,
  currentTrackingNumber,
}: {
  orderId: string;
  currentStatus: string;
  currentTrackingNumber: string | null;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(currentTrackingNumber ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const trackingChanged = tracking.trim() !== (currentTrackingNumber ?? "");
  const statusChanged = status !== currentStatus;
  const nothingToSave = !statusChanged && !trackingChanged;

  async function handleUpdate() {
    if (nothingToSave) return;

    if (status === "processing" && !tracking.trim()) {
      setError("Tracking number is required to move this order to processing.");
      return;
    }

    setError(null);
    setLoading(true);

    const payload: Record<string, string> = {};
    if (statusChanged) payload.order_status = status;
    if (trackingChanged) payload.tracking_number = tracking.trim();

    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update order.");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setSaved(false); setError(null); }}
          className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-forest/50 capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <input
          type="text"
          value={tracking}
          onChange={(e) => { setTracking(e.target.value); setSaved(false); setError(null); }}
          placeholder={status === "pending" ? "Move to Processing to enter tracking" : "Tracking number"}
          disabled={status === "pending" || !!currentTrackingNumber}
          className="border border-gray-200 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-forest/50 flex-1 min-w-[180px] disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
        />

        <button
          onClick={handleUpdate}
          disabled={loading || nothingToSave}
          className="px-4 py-2 text-sm bg-forest text-linen rounded hover:bg-forest/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {loading ? "Saving…" : saved ? "Saved ✓" : "Update"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {status === "processing" && !tracking.trim() && !error && (
        <p className="text-xs text-gray-400">
          Enter a tracking number - the customer will be emailed with a tracking link once you save.
        </p>
      )}
    </div>
  );
}
