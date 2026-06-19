"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  currentName: string;
  currentImageUrl: string;
  currentPerk1: string;
  currentPerk2: string;
};

export default function SpotlightForm({
  currentName,
  currentImageUrl,
  currentPerk1,
  currentPerk2,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName]   = useState(currentName);
  const [perk1, setPerk1] = useState(currentPerk1);
  const [perk2, setPerk2] = useState(currentPerk2);
  // The image URL is held in state so an upload updates it immediately; the
  // single "Save changes" then persists name + perks + this URL together.
  const [imageUrl, setImageUrl] = useState(currentImageUrl);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  function showMessage(setter: (m: string) => void, msg: string) {
    setter(msg);
    setTimeout(() => setter(""), 3500);
  }

  async function handleUpload() {
    setError("");
    setSuccess("");
    const file = fileRef.current?.files?.[0];
    if (!file) {
      showMessage(setError, "Choose an image file first.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const upRes = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error || "Upload failed");
      setImageUrl(upJson.url);
      if (fileRef.current) fileRef.current.value = "";
      showMessage(setSuccess, "Photo uploaded - remember to Save changes.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      showMessage(setError, msg);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/spotlight", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          imageUrl: imageUrl.trim(),
          perk1: perk1.trim(),
          perk2: perk2.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Save failed");
      showMessage(setSuccess, "Spotlight updated.");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Save failed";
      showMessage(setError, msg);
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    name !== currentName ||
    imageUrl !== currentImageUrl ||
    perk1 !== currentPerk1 ||
    perk2 !== currentPerk2;

  const inputClass =
    "w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-forest";
  const labelClass =
    "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2";

  return (
    <form
      onSubmit={handleSave}
      className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-6"
    >
      <div className="flex items-start gap-5">
        {/* Avatar preview */}
        <div className="shrink-0">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-linen">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={imageUrl}
                src={imageUrl}
                alt="Spotlight avatar"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                No photo
              </div>
            )}
          </div>
        </div>

        {/* Photo upload */}
        <div className="flex-1 min-w-0">
          <label className={labelClass}>Featured photo</label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:uppercase file:tracking-wider file:bg-forest file:text-linen hover:file:bg-forest/90 cursor-pointer"
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading…" : "Upload photo"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs text-gray-500 hover:text-red-600 underline underline-offset-4"
              >
                Remove photo
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Square image works best. JPG, PNG, WebP, or GIF. Max 10MB.
          </p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Featured name / handle</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          placeholder="e.g. @nimeshi"
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Leave blank to hide the spotlight card on the community page.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Perk 1</label>
          <input
            type="text"
            value={perk1}
            onChange={(e) => setPerk1(e.target.value)}
            maxLength={120}
            placeholder="e.g. 15% Off Discount Code"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Perk 2</label>
          <input
            type="text"
            value={perk2}
            onChange={(e) => setPerk2(e.target.value)}
            maxLength={120}
            placeholder="e.g. Featured on Instagram"
            className={inputClass}
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
