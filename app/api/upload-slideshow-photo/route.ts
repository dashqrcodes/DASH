import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const slug = (formData.get("slug") as string | null) || "slideshow";
    const index = (formData.get("index") as string | null) || "0";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const uploadBuffer = Buffer.from(await file.arrayBuffer());
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filename = `${safeSlug}-${Date.now()}-${index}.jpg`;
    const filePath = `slideshows/${safeSlug}/${filename}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("photos")
      .upload(filePath, uploadBuffer, {
        upsert: true,
        contentType: file.type || "image/jpeg",
        cacheControl: "31536000",
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("photos").getPublicUrl(filePath);

    return NextResponse.json({ photoUrl: publicUrl });
  } catch (error: any) {
    console.error("Upload slideshow photo error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload slideshow photo" },
      { status: 500 }
    );
  }
}
