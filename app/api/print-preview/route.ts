import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import sharp from "sharp";
import { PDFDocument, rgb } from "pdf-lib";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const DPI = 72;
const IN = (v: number) => v * DPI;
const CARD_WIDTH_IN = 4;
const CARD_HEIGHT_IN = 6;
const POSTER_WIDTH_IN = 20;
const POSTER_HEIGHT_IN = 30;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://dashmemories.com";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const format = searchParams.get("format") || "card";
    const photoUrl = searchParams.get("photo");
    const forceRefresh = searchParams.get("refresh") === "1";

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
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

    if (!resolvedPhotoUrl) {
      return NextResponse.json(
        { error: "No photo found. Add a photo in the memorial flow first." },
        { status: 400 }
      );
    }

    const versionInput = resolvedPhotoUrl + (draftUpdatedAt || "");
    const version = crypto.createHash("md5").update(versionInput).digest("hex").slice(0, 8);
    const isPoster = format === "poster";
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

    const qrTarget = `${APP_URL}/h/${slug}`;
    const qrUrl = `${APP_URL}/api/qr?data=${encodeURIComponent(qrTarget)}&size=600&bg=white&ecl=L&fg=black`;

    const photoRes = await fetch(resolvedPhotoUrl);
    if (!photoRes.ok) {
      const text = await photoRes.text();
      const msg = text?.toLowerCase().includes("object not found") || text?.toLowerCase().includes("not_found")
        ? "Photo not found at storage URL. Make sure you added a photo in the memorial flow."
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

    const minCardShort = 1200;
    const minCardLong = 1800;
    const minPosterShort = 6000;
    const minPosterLong = 9000;

    const metadata = await sharp(photoBuf).metadata();
    const imgWidth = metadata.width ?? 0;
    const imgHeight = metadata.height ?? 0;
    const imgShort = Math.min(imgWidth, imgHeight);
    const imgLong = Math.max(imgWidth, imgHeight);

    const minShort = isPoster ? minPosterShort : minCardShort;
    const minLong = isPoster ? minPosterLong : minCardLong;

    if (imgShort < minShort || imgLong < minLong) {
      return NextResponse.json(
        { error: "Image resolution too low for print quality" },
        { status: 422 }
      );
    }

    const qrRes = await fetch(qrUrl);
    if (!qrRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate QR code. Please try again." },
        { status: 500 }
      );
    }
    const qrBuf = Buffer.from(await qrRes.arrayBuffer());

    const widthPt = IN(isPoster ? POSTER_WIDTH_IN : CARD_WIDTH_IN);
    const heightPt = IN(isPoster ? POSTER_HEIGHT_IN : CARD_HEIGHT_IN);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([widthPt, heightPt]);

    const contentType = photoRes.headers.get("content-type") || "";
    const photoImage =
      contentType.includes("jpeg") || contentType.includes("jpg")
        ? await pdfDoc.embedJpg(photoBuf)
        : await pdfDoc.embedPng(photoBuf);

    page.drawImage(photoImage, {
      x: 0,
      y: 0,
      width: widthPt,
      height: heightPt,
    });

    const posterUnderlaySize = 1.25;
    const posterBorder = 3 / 16;
    const cardQrSize = 0.75;
    const cardUnderlaySize = 1.0;
    const cardPad = 0.5;
    const qrSize = IN(isPoster ? posterUnderlaySize - posterBorder * 2 : cardQrSize);
    const pad = IN(isPoster ? 1.0 : cardPad);

    const qrX = isPoster ? pad : widthPt - pad - qrSize;
    const qrY = pad;

    const underlaySize = IN(isPoster ? posterUnderlaySize : cardUnderlaySize);
    const underlayPad = IN(isPoster ? posterBorder : (cardUnderlaySize - cardQrSize) / 2);
    const underlayX = qrX - underlayPad;
    const underlayY = qrY - underlayPad;

    page.drawRectangle({
      x: underlayX,
      y: underlayY,
      width: underlaySize,
      height: underlaySize,
      color: rgb(1, 1, 1),
    });

    const qrImage = await pdfDoc.embedPng(qrBuf);
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    const pdfBytes = await pdfDoc.save();

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
  } catch (error: any) {
    console.error("print-preview error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate preview" },
      { status: 500 }
    );
  }
}
