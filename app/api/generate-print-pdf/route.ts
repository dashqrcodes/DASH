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

export async function POST(req: NextRequest) {
  try {
    const { slug, photoUrl, qrUrl, format } = await req.json();
    if (!slug || !photoUrl || !qrUrl) {
      return NextResponse.json({ error: "Missing slug, photoUrl, or qrUrl" }, { status: 400 });
    }

    const [photoRes, qrRes] = await Promise.all([fetch(photoUrl), fetch(qrUrl)]);
    if (!photoRes.ok || !qrRes.ok) {
      return NextResponse.json({ error: "Failed to fetch photo or QR" }, { status: 400 });
    }

    const photoBuf = Buffer.from(await photoRes.arrayBuffer());
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

    const path = `prints/${slug}${isPoster ? "-poster" : ""}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("prints")
      .upload(path, Buffer.from(pdfBytes), { upsert: true, contentType: "application/pdf" });

    if (uploadError) {
      console.error("Print PDF upload failed", uploadError);
      return NextResponse.json({ error: "Failed to store PDF" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("prints").getPublicUrl(path);
    const printUrl = urlData.publicUrl;

    if (!isPoster) {
      await supabaseAdmin.from("drafts").update({ print_pdf_url: printUrl }).eq("slug", slug);
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug}.pdf"`,
        "X-Print-Url": printUrl,
      },
    });
  } catch (error: any) {
    console.error("generate-print-pdf error", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
