import { NextRequest, NextResponse } from "next/server";
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

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    let resolvedPhotoUrl = photoUrl;
    if (!resolvedPhotoUrl) {
      const { data: draft } = await supabaseAdmin
        .from("drafts")
        .select("photo_url")
        .eq("slug", slug)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      resolvedPhotoUrl = draft?.photo_url || null;
    }

    if (!resolvedPhotoUrl) {
      return NextResponse.json(
        { error: "No photo found. Add a photo in the memorial flow first." },
        { status: 400 }
      );
    }

    const qrTarget = `${APP_URL}/h/${slug}`;
    const qrUrl = `${APP_URL}/api/qr?data=${encodeURIComponent(qrTarget)}&size=600&bg=white&ecl=L`;

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

    const qrRes = await fetch(qrUrl);
    if (!qrRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate QR code. Please try again." },
        { status: 500 }
      );
    }
    const qrBuf = Buffer.from(await qrRes.arrayBuffer());

    const isPoster = format === "poster";
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
    const qrSize = IN(isPoster ? posterUnderlaySize - posterBorder * 2 : 0.75);
    const pad = IN(isPoster ? 1.0 : 0.5);
    const qrX = pad;
    const qrY = pad;

    if (isPoster) {
      const underlayPad = IN(posterBorder);
      const underlaySize = IN(posterUnderlaySize);
      const underlayX = qrX - underlayPad;
      const underlayY = qrY - underlayPad;
      page.drawRectangle({
        x: underlayX,
        y: underlayY,
        width: underlaySize,
        height: underlaySize,
        color: rgb(1, 1, 1),
      });
    }

    const qrImage = await pdfDoc.embedPng(qrBuf);
    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    const pdfBytes = await pdfDoc.save();

    const filename = `${slug}${isPoster ? "-poster" : ""}.pdf`;
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
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
