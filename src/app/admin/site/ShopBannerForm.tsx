"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "upload" | "url";

export default function ShopBannerForm({ currentUrl }: { currentUrl: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("upload");
  const [url, setUrl] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(currentUrl);

  function showMessage(setter: (m: string) => void, msg: string) {
    setter(msg);
    setTimeout(() => setter(""), 3500);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image file first.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "banner");
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error || "Upload failed");

      const saveRes = await fetch("/api/admin/settings/shop-banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: upJson.url }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveJson.error || "Save failed");

      setUrl(upJson.url);
      setPreview(upJson.url);
      if (fileRef.current) fileRef.current.value = "";
      showMessage(setSuccess, "Shop banner updated.");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      showMessage(setError, msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveUrl(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!url.trim()) {
      setError("Enter an image URL.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/shop-banner", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      setPreview(url.trim());
      showMessage(setSuccess, "Shop banner URL saved.");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      showMessage(setError, msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current shop banner</p>
        </div>
        <div className="aspect-[16/7] bg-linen relative">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={preview}
              src={preview}
              alt="Shop banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-forest/40 text-sm">
              No banner set
            </div>
          )}
        </div>
        <div className="px-5 py-3 text-xs text-gray-500 break-all">
          <span className="font-medium text-gray-700">URL: </span>{preview || "—"}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === "upload"
              ? "border-forest text-forest"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Upload file
        </button>
        <button
          onClick={() => setMode("url")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            mode === "url"
              ? "border-forest text-forest"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Paste URL
        </button>
      </div>

      {/* Upload form */}
      {mode === "upload" && (
        <form onSubmit={handleUpload} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Banner image
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:bg-forest file:text-linen hover:file:bg-forest/90 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG, WebP, or GIF. Max 10MB. Recommended a wide image (≈ 16:7) — its left edge fades into the page background. Goes to <code className="bg-gray-100 px-1 rounded">media/banner</code>.
            </p>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-forest text-linen px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading…" : "Upload & Save"}
          </button>
        </form>
      )}

      {/* URL form */}
      {mode === "url" && (
        <form onSubmit={handleSaveUrl} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://… or /banner.png"
              className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-forest"
            />
            <p className="text-xs text-gray-400 mt-2">
              Any direct image URL (CDN, public Supabase Storage link, or a path under <code className="bg-gray-100 px-1 rounded">/public</code>).
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-forest text-linen px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save URL"}
          </button>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-4 py-2.5">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-4 py-2.5">{success}</p>
      )}
    </div>
  );
}
