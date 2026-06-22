"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ImpactStat } from "@/lib/siteSettings";

type Props = {
  currentStats: ImpactStat[];
};

export default function ImpactStatsForm({ currentStats }: Props) {
  const router = useRouter();

  const [stats, setStats] = useState<ImpactStat[]>(
    currentStats.map((s) => ({ value: s.value, label: s.label })),
  );

  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  function showMessage(setter: (m: string) => void, msg: string) {
    setter(msg);
    setTimeout(() => setter(""), 3500);
  }

  function updateStat(index: number, field: keyof ImpactStat, value: string) {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/impact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: stats.map((s) => ({
            value: s.value.trim(),
            label: s.label.trim(),
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      showMessage(setSuccess, "Impact stats updated.");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      showMessage(setError, msg);
    } finally {
      setSaving(false);
    }
  }

  const dirty = stats.some(
    (s, i) =>
      s.value !== currentStats[i]?.value || s.label !== currentStats[i]?.label,
  );

  const inputClass =
    "w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-forest";
  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6"
    >
      <p className="text-sm text-gray-500">
        The six headline numbers in the &ldquo;Our Impact Together&rdquo;
        section. Each stat keeps its fixed icon; leave a stat&rsquo;s number blank
        to hide that row. Changes go live immediately.
      </p>

      <div className="space-y-5">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="grid sm:grid-cols-[8rem_1fr] gap-4 sm:gap-5 sm:items-start"
          >
            <div>
              <label className={labelClass}>Stat {i + 1} number</label>
              <input
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(i, "value", e.target.value)}
                maxLength={120}
                placeholder="e.g. 12,580"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Label</label>
              <input
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(i, "label", e.target.value)}
                maxLength={120}
                placeholder="e.g. Plastic-free garments sold"
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving || !dirty}
          className="bg-forest text-linen px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-4 py-2.5">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-4 py-2.5">{success}</p>
      )}
    </form>
  );
}
