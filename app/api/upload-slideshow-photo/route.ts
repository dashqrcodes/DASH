import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const slug = (formData.get("slug") as string | null) || "slideshow";
    const index = (formData.get("index") as string | null) || "0";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const cloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (!cloudinaryConfigured) {
      return NextResponse.json(
        { error: "Cloudinary is not configured" },
        { status: 500 }
      );
    }

    const uploadBuffer = Buffer.from(await file.arrayBuffer());
    const publicId = `${slug}-${Date.now()}-${index}`;

    const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "slideshows",
          public_id: publicId,
          resource_type: "image",
          format: "jpg",
          overwrite: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            reject(error || new Error("Cloudinary upload failed"));
            return;
          }
          resolve(result.secure_url);
        }
      );
      stream.end(uploadBuffer);
    });

    return NextResponse.json({ photoUrl: cloudinaryUrl });
  } catch (error: any) {
    console.error("Upload slideshow photo error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload slideshow photo" },
      { status: 500 }
    );
  }
}
