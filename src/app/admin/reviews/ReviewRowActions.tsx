"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewRowActions({
  id,
  approved,
}: {
  id: number;
  approved: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function setApproved(next: boolean) {
    setBusy(true);
    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved: next }),
    });
    if (res.ok) router.refresh();
    else alert("Failed to update review.");
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setBusy(true);
    const res = await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) router.refresh();
    else alert("Failed to delete review.");
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {approved ? (
        <button
          onClick={() => setApproved(false)}
          disabled={busy}
          className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Unpublish
        </button>
      ) : (
        <button
          onClick={() => setApproved(true)}
          disabled={busy}
          className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          Approve
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={busy}
        className="text-xs px-3 py-1.5 rounded text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
