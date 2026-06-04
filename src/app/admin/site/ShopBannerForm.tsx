"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ShopBannerForm({
  currentUrl,
  currentMobileUrl,
}: {
  currentUrl: string;
  currentMobileUrl: string;
}) {
  return (
    <div className="space-y-10">
      <BannerEditor
        title="Desktop banner"
        currentUrl={currentUrl}
        endpoint="/api/admin/settings/shop-banner"
        previewAspectClass="aspect-[24/7]"
        uploadHint="Shown on screens ≥ 768px wide. Recommended ~24:7 - e.g. 3840 × 1120 px. JPG, PNG, WebP, or GIF. Max 10MB."
        allowClear={false}
      />
      <BannerEditor
        title="Mobile banner"
        currentUrl={currentMobileUrl}
        endpoint="/api/admin/settings/shop-banner-mobile"
        previewAspectClass="aspect-[10/9]"
        uploadHint="Shown on screens < 768px wide. Recommended ~10:9 to 1:1 - e.g. 1200 × 1080 px. Leave empty to use the desktop banner on phones too."
        allowClear={true}
      />
    </div>
  );
}

function BannerEditor({
  title,
  currentUrl,
  endpoint,
  previewAspectClass,
  uploadHint,
  allowClear,
}: {
  title: string;
  currentUrl: string;
  endpoint: string;
  previewAspectClass: string;
  uploadHint: string;
  allowClear: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(currentUrl);

  function showMessage(setter: (m: string) => void, msg: string) {
    setter(msg);
    setTimeout(() => setter(""), 3500);
  }

  async function saveUrl(nextUrl: string) {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: nextUrl }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Save failed");
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

      await saveUrl(upJson.url);

      setPreview(upJson.url);
      if (fileRef.current) fileRef.current.value = "";
      showMessage(setSuccess, `${title} updated.`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      showMessage(setError, msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleClear() {
    setError("");
    setSuccess("");
    setClearing(true);
    try {
      await saveUrl("");
      setPreview("");
      if (fileRef.current) fileRef.current.value = "";
      showMessage(setSuccess, `${title} cleared.`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Clear failed";
      showMessage(setError, msg);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        {allowClear && preview && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="text-xs text-gray-500 hover:text-red-600 underline underline-offset-4 disabled:opacity-50"
          >
            {clearing ? "Clearing…" : "Clear"}
          </button>
        )}
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current</p>
        </div>
        <div className={`relative ${previewAspectClass} bg-linen`}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={preview}
              src={preview}
              alt={`${title} preview`}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-forest/40 text-sm">
              No banner set
            </div>
          )}
        </div>
        <div className="px-5 py-3 text-xs text-gray-500 break-all">
          <span className="font-medium text-gray-700">URL: </span>{preview || "-"}
        </div>
      </div>

      {/* Upload form */}
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
          <p className="text-xs text-gray-400 mt-2">{uploadHint}</p>
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="bg-forest text-linen px-5 py-2.5 rounded text-xs font-semibold uppercase tracking-wider hover:bg-forest/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading…" : "Upload & Save"}
        </button>
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
