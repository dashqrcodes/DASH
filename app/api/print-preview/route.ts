import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  generateCardPdf,
  generatePosterPdf,
} from "@/lib/utils/printPdfGenerator";
import { getBaseUrl } from "@/lib/utils/baseUrl";
import { getCardFrontPhotoUrl } from "@/lib/utils/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dashmemories.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const format = searchParams.get("format") || "card";
    const photoUrl = searchParams.get("photo");
    const forceRefresh = searchParams.get("refresh") === "1";
    const fullName = searchParams.get("name") || "";
    const birthDate = searchParams.get("birth") || "";
    const deathDate = searchParams.get("death") || "";
    const counselorName = searchParams.get("counselorName") || "Groman Mortuary";
    const counselorPhone = searchParams.get("counselorPhone") || "323-476-8005";
    const passageIndex = parseInt(searchParams.get("passageIndex") || "0", 10) || 0;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const isCard = format === "card";
    const isPoster = format === "poster";

    if (!["card", "poster"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Use card or poster." },
        { status: 400 }
      );
    }

    let resolvedPhotoUrl = photoUrl;
    let draftUpdatedAt: string | null = null;
    if (!resolvedPhotoUrl) {
      const { data: draft } = await supabaseAdmin
        .from("drafts")
        .select("photo_url, updated_at")
        .eq("slug", slug)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      resolvedPhotoUrl = draft?.photo_url || null;
      draftUpdatedAt = draft?.updated_at || null;
    }

    if ((isCard || isPoster) && !resolvedPhotoUrl) {
      return NextResponse.json(
        { error: "No photo found. Add a photo in the memorial flow first." },
        { status: 400 }
      );
    }

    const versionInput =
      (isCard || isPoster ? resolvedPhotoUrl || "" : "") +
      (draftUpdatedAt || "") +
      fullName +
      birthDate +
      deathDate +
      (isCard ? `${passageIndex}` : "");
    const version = crypto.createHash("md5").update(versionInput).digest("hex").slice(0, 8);
    const storagePath = `prints/${slug}-${format}-${version}.pdf`;

    if (!forceRefresh) {
      const { data: storedPdf, error: downloadError } = await supabaseAdmin.storage
        .from("prints")
        .download(storagePath);

      if (!downloadError && storedPdf) {
        const arrayBuffer = await storedPdf.arrayBuffer();
        const pdfBytes = Buffer.from(arrayBuffer);
        const filename = `${slug}-${format}.pdf`;
        return new NextResponse(pdfBytes, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${filename}"`,
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    }

    let pdfBytes: Buffer;

    if (isCard) {
      const photoUrlForPdf = getCardFrontPhotoUrl(resolvedPhotoUrl!);
      const photoRes = await fetch(photoUrlForPdf);
      if (!photoRes.ok) {
        const text = await photoRes.text();
        const msg =
          text?.toLowerCase().includes("object not found") ||
          text?.toLowerCase().includes("not_found")
            ? "Photo not found at storage URL. Add a photo in the memorial flow."
            : `Failed to fetch photo (${photoRes.status})`;
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      const photoBuf = Buffer.from(await photoRes.arrayBuffer());
      if (photoBuf.length === 0) {
        return NextResponse.json(
          { error: "Photo URL returned empty. Try uploading the photo again." },
          { status: 400 }
        );
      }
      const contentType = photoRes.headers.get("content-type") || "image/jpeg";
      const embedFn = contentType.includes("jpeg") || contentType.includes("jpg") ? "embedJpg" : "embedPng";
      console.log("[print-preview] imageUrl:", photoUrlForPdf, "contentType:", contentType, "embedFn:", embedFn);

      const qrTarget = `${APP_URL}/h/${slug}`;
      const qrUrl = `${APP_URL}/api/qr?data=${encodeURIComponent(qrTarget)}&size=1000&bg=transparent&ecl=H&fg=3B0066&margin=4`;
      const qrRes = await fetch(qrUrl);
      if (!qrRes.ok) {
        return NextResponse.json(
          { error: "Failed to generate QR code. Please try again." },
          { status: 500 }
        );
      }
      const qrBuf = Buffer.from(await qrRes.arrayBuffer());
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || getBaseUrl() || "https://dashmemories.com";
      const skyUrl = `${baseUrl.replace(/\/$/, "")}/sky%20background%20rear.jpg`;
      let skyBackgroundBuf: Buffer | undefined;
      try {
        const skyRes = await fetch(skyUrl);
        if (skyRes.ok) skyBackgroundBuf = Buffer.from(await skyRes.arrayBuffer());
      } catch {
        // fallback to solid color in generator
      }
      pdfBytes = await generateCardPdf({
        photoBuf,
        photoContentType: contentType,
        qrBuf,
        fullName,
        birthDate,
        deathDate,
        counselorName,
        counselorPhone,
        passageIndex,
        skyBackgroundBuf,
      });
      console.log("[print-preview] card PDF pageCount: 2, pageSize: 4x6 inches");
    } else {
      const qrTarget = `${APP_URL}/h/${slug}`;
      const qrUrl = `${APP_URL}/api/qr?data=${encodeURIComponent(qrTarget)}&size=1000&bg=white&ecl=H&fg=3B0066&margin=4`;
      const [qrRes, photoRes] = await Promise.all([fetch(qrUrl), fetch(resolvedPhotoUrl!)]);
      if (!qrRes.ok) {
        return NextResponse.json(
          { error: "Failed to generate QR code. Please try again." },
          { status: 500 }
        );
      }
      if (!photoRes.ok) {
        const text = await photoRes.text();
        const msg =
          text?.toLowerCase().includes("object not found") ||
          text?.toLowerCase().includes("not_found")
            ? "Photo not found at storage URL. Add a photo in the memorial flow."
            : `Failed to fetch photo (${photoRes.status})`;
        return NextResponse.json({ error: msg }, { status: 400 });
      }
      const photoBuf = Buffer.from(await photoRes.arrayBuffer());
      if (photoBuf.length === 0) {
        return NextResponse.json(
          { error: "Photo URL returned empty. Try uploading the photo again." },
          { status: 400 }
        );
      }
      const qrBuf = Buffer.from(await qrRes.arrayBuffer());
      const contentType = photoRes.headers.get("content-type") || "image/jpeg";
      pdfBytes = await generatePosterPdf({
        photoBuf,
        photoContentType: contentType,
        qrBuf,
        fullName,
        birthDate,
        deathDate,
      });
    }

    await supabaseAdmin.storage
      .from("prints")
      .upload(storagePath, Buffer.from(pdfBytes), { upsert: true, contentType: "application/pdf" });

    const filename = `${slug}-${format}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error: unknown) {
    console.error("print-preview error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate preview" },
      { status: 500 }
    );
  }
}
