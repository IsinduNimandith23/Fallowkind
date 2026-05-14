import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]);

function extFromType(mime: string): string {
  switch (mime) {
    case "image/jpeg": return "jpg";
    case "image/png":  return "png";
    case "image/webp": return "webp";
    case "image/heic": return "heic";
    case "application/pdf": return "pdf";
    default: return "bin";
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, WEBP, HEIC, or PDF files are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File is too large (max 5 MB)" },
        { status: 400 }
      );
    }

    const ext = extFromType(file.type);
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from("payment-receipts")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Receipt upload error:", error);
      return NextResponse.json({ error: "Failed to upload receipt" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      path,
      filename: file.name,
      contentType: file.type,
    });
  } catch (err) {
    console.error("Receipt upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
