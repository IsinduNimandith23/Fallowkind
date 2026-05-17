import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;  //  10 MB

function safeName(name: string): string {
  const dot = name.lastIndexOf(".");
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "file";
  const ext = (dot >= 0 ? name.slice(dot + 1) : "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return ext ? `${base}.${ext}` : base;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "image"); // "image" | "video" | "banner"

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = kind === "video";
    const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File too large (max ${Math.round(maxBytes / 1024 / 1024)}MB)` },
        { status: 400 }
      );
    }

    const folder = kind === "video" ? "hero" : kind === "banner" ? "banner" : "products";
    const path = `${folder}/${Date.now()}-${safeName(file.name)}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error: uploadErr } = await supabase.storage
      .from("media")
      .upload(path, arrayBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadErr) {
      console.error("Upload error:", uploadErr);
      return NextResponse.json({ error: uploadErr.message }, { status: 500 });
    }

    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl, path });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
