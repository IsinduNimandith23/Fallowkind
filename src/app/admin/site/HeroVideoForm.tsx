"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroVideoForm({ currentUrl }: { currentUrl: string }) {
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
      setError("Choose a video file first.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "video");
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error || "Upload failed");

      const saveRes = await fetch("/api/admin/settings/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: upJson.url }),
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveJson.error || "Save failed");

      setPreview(upJson.url);
      if (fileRef.current) fileRef.current.value = "";
      showMessage(setSuccess, "Hero video updated.");
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
      {/* Preview */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current hero</p>
        </div>
        <div className="aspect-video bg-forest relative">
          {preview ? (
            <video
              key={preview}
              src={preview}
              autoPlay muted loop playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-linen/50 text-sm">
              No video set
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
            Video file
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:bg-forest file:text-linen hover:file:bg-forest/90 cursor-pointer"
          />
          <p className="text-xs text-gray-400 mt-2">
            MP4, WebM, or MOV. Max 100MB. Goes to Supabase Storage → bucket <code className="bg-gray-100 px-1 rounded">media/hero</code>.
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

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded px-4 py-2.5">{error}</p>
      )}
      {success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded px-4 py-2.5">{success}</p>
      )}
    </div>
  );
}
