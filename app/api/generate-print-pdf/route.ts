import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  generateCardPdf,
  generatePosterPdf,
} from "@/lib/utils/printPdfGenerator";
import { getBaseUrl } from "@/lib/utils/baseUrl";
import { getRawCloudinaryUrl } from "@/lib/utils/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      photoUrl,
      qrUrl,
      format,
      fullName,
      birthDate,
      deathDate,
      counselorName,
      counselorPhone,
      passageIndex,
    } = body;

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const isCard = format === "card";
    const isPoster = format === "poster";

    if (!["card", "poster"].includes(format)) {
      return NextResponse.json({ error: "Invalid format. Use card or poster." }, { status: 400 });
    }

    if ((isCard || isPoster) && !photoUrl) {
      return NextResponse.json({ error: "Missing photoUrl" }, { status: 400 });
    }
    if ((isCard || isPoster) && !qrUrl) {
      return NextResponse.json({ error: "Missing qrUrl" }, { status: 400 });
    }

    let qrBuf: Buffer | undefined;
    let photoBuf: Buffer | undefined;
    let photoContentType = "image/jpeg";

    if (isCard || isPoster) {
      const qrRes = await fetch(qrUrl);
      if (!qrRes.ok) return NextResponse.json({ error: "Failed to fetch QR" }, { status: 400 });
      qrBuf = Buffer.from(await qrRes.arrayBuffer());
    }
    if (isCard || isPoster) {
      const rawPhotoUrl = getRawCloudinaryUrl(photoUrl!);
      const photoRes = await fetch(rawPhotoUrl);
      if (!photoRes.ok) return NextResponse.json({ error: "Failed to fetch photo" }, { status: 400 });
      photoBuf = Buffer.from(await photoRes.arrayBuffer());
      photoContentType = photoRes.headers.get("content-type") || "image/jpeg";
      const embedFn = photoContentType.includes("jpeg") || photoContentType.includes("jpg") ? "embedJpg" : "embedPng";
      console.log("[generate-print-pdf] imageUrl:", rawPhotoUrl, "contentType:", photoContentType, "embedFn:", embedFn);
    }

    let pdfBytes: Buffer;

    if (isCard) {
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
        photoBuf: photoBuf!,
        photoContentType,
        qrBuf: qrBuf!,
        fullName: fullName || "",
        birthDate: birthDate || "",
        deathDate: deathDate || "",
        counselorName: counselorName || "Groman Mortuary",
        counselorPhone: counselorPhone || "323-476-8005",
        passageIndex: typeof passageIndex === "number" ? passageIndex : 0,
        skyBackgroundBuf,
      });
      const pageCount = 2;
      console.log("[generate-print-pdf] card PDF pageCount:", pageCount, "pageSize: 4x6 inches");
    } else {
      pdfBytes = await generatePosterPdf({
        photoBuf: photoBuf!,
        photoContentType,
        qrBuf: qrBuf!,
        fullName: fullName || "",
        birthDate: birthDate || "",
        deathDate: deathDate || "",
      });
    }

    const suffix = format === "poster" ? "-poster" : "-card";
    const path = `prints/${slug}${suffix}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("prints")
      .upload(path, Buffer.from(pdfBytes), { upsert: true, contentType: "application/pdf" });

    if (uploadError) {
      console.error("Print PDF upload failed", uploadError);
      return NextResponse.json({ error: "Failed to store PDF" }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from("prints").getPublicUrl(path);
    const printUrl = urlData.publicUrl;

    if (isCard) {
      await supabaseAdmin.from("drafts").update({ print_pdf_url: printUrl }).eq("slug", slug);
    }

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${slug}-${format}.pdf"`,
        "X-Print-Url": printUrl,
      },
    });
  } catch (error: unknown) {
    console.error("generate-print-pdf error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
