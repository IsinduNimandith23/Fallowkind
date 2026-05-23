"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  currentEyebrow: string;
  currentHeadingLine1: string;
  currentHeadingLine2: string;
};

export default function HeroTextForm({
  currentEyebrow,
  currentHeadingLine1,
  currentHeadingLine2,
}: Props) {
  const router = useRouter();
  const [eyebrow, setEyebrow]           = useState(currentEyebrow);
  const [headingLine1, setHeadingLine1] = useState(currentHeadingLine1);
  const [headingLine2, setHeadingLine2] = useState(currentHeadingLine2);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  function showMessage(setter: (m: string) => void, msg: string) {
    setter(msg);
    setTimeout(() => setter(""), 3500);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!headingLine1.trim() && !headingLine2.trim()) {
      setError("At least one heading line is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/hero-text", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eyebrow:      eyebrow.trim(),
          headingLine1: headingLine1.trim(),
          headingLine2: headingLine2.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      showMessage(setSuccess, "Hero text updated.");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      showMessage(setError, msg);
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setEyebrow(currentEyebrow);
    setHeadingLine1(currentHeadingLine1);
    setHeadingLine2(currentHeadingLine2);
    setError("");
    setSuccess("");
  }

  const dirty =
    eyebrow !== currentEyebrow ||
    headingLine1 !== currentHeadingLine1 ||
    headingLine2 !== currentHeadingLine2;

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live preview</p>
        </div>
        <div className="bg-forest text-linen px-6 py-10">
          {eyebrow.trim() && (
            <p className="text-[10px] tracking-[0.35em] uppercase text-fern mb-4">
              {eyebrow}
            </p>
          )}
          <div
            className="font-bold leading-[0.95] tracking-tight text-3xl sm:text-4xl"
            style={{
              fontFamily:
                '"Myriad Pro", "Myriad Pro Regular", Myriad, "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {headingLine1.trim() && <div>{headingLine1}</div>}
            {headingLine2.trim() && <div>{headingLine2}</div>}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Eyebrow (small line above the heading)
          </label>
          <input
            type="text"
            value={eyebrow}
            onChange={(e) => setEyebrow(e.target.value)}
            maxLength={120}
            placeholder="e.g. Spring Sale — 20% off all jackets"
            className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
          />
          <p className="text-xs text-gray-400 mt-1.5">Leave blank to hide this line.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Heading — line 1
            </label>
            <input
              type="text"
              value={headingLine1}
              onChange={(e) => setHeadingLine1(e.target.value)}
              maxLength={120}
              placeholder="e.g. The Future"
              className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Heading — line 2
            </label>
            <input
              type="text"
              value={headingLine2}
              onChange={(e) => setHeadingLine2(e.target.value)}
              maxLength={120}
              placeholder="e.g. is Conscious."
              className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={saving || !dirty}
            className="bg-forest text-linen px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || !dirty}
            className="px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </form>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-4 py-2.5">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-4 py-2.5">{success}</p>
      )}
    </div>
  );
}
