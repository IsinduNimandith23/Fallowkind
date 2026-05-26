"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ImageKey = "beginning" | "principle1" | "principle2" | "principle3";

export default function OurStoryImagesForm({
  beginningUrl,
  principle1Url,
  principle2Url,
  principle3Url,
}: {
  beginningUrl: string;
  principle1Url: string;
  principle2Url: string;
  principle3Url: string;
}) {
  return (
    <div className="space-y-10">
      <ImageEditor
        title='"Our beginning" photo'
        imageKey="beginning"
        currentUrl={beginningUrl}
        previewAspectClass="aspect-[4/5]"
        uploadHint="Shown beside the 'We imagine a world where' list. Portrait orientation works best — recommended ~4:5 (e.g. 1200 × 1500 px). JPG, PNG, WebP, or GIF. Max 10MB."
      />
      <ImageEditor
        title="Principle 1 — Pure Materials, Pure Living"
        imageKey="principle1"
        currentUrl={principle1Url}
        previewAspectClass="aspect-[4/5]"
        uploadHint="First principle image in the 'What we stand for' section. Portrait ~4:5. JPG, PNG, WebP, or GIF. Max 10MB."
      />
      <ImageEditor
        title="Principle 2 — Slow Fashion, Thoughtful Production"
        imageKey="principle2"
        currentUrl={principle2Url}
        previewAspectClass="aspect-[4/5]"
        uploadHint="Second principle image. Portrait ~4:5. JPG, PNG, WebP, or GIF. Max 10MB."
      />
      <ImageEditor
        title="Principle 3 — Cruelty-Free by Nature"
        imageKey="principle3"
        currentUrl={principle3Url}
        previewAspectClass="aspect-[4/5]"
        uploadHint="Third principle image. Portrait ~4:5. JPG, PNG, WebP, or GIF. Max 10MB."
      />
    </div>
  );
}

function ImageEditor({
  title,
  imageKey,
  currentUrl,
  previewAspectClass,
  uploadHint,
}: {
  title: string;
  imageKey: ImageKey;
  currentUrl: string;
  previewAspectClass: string;
  uploadHint: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
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

      const saveRes = await fetch("/api/admin/settings/our-story-image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: imageKey, url: upJson.url }),
      });
      const saveJson = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) throw new Error(saveJson.error || "Save failed");

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

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>

      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current</p>
        </div>
        <div className={`relative ${previewAspectClass} bg-linen max-w-xs`}>
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
              No image set
            </div>
          )}
        </div>
        <div className="px-5 py-3 text-xs text-gray-500 break-all">
          <span className="font-medium text-gray-700">URL: </span>{preview || "—"}
        </div>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Image
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
