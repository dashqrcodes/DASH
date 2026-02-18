import { NextRequest, NextResponse } from "next/server";
import { sendPrintPdfEmail } from "@/lib/utils/emailPdf";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body?.slug || "";
    const photoUrl = body?.photoUrl || "";
    const fullName = body?.fullName || body?.name || "";
    const birthDate = body?.birthDate || body?.birth || "";
    const deathDate = body?.deathDate || body?.death || "";
    const counselorName = body?.counselorName || undefined;
    const counselorPhone = body?.counselorPhone || "323-476-8005";
    const passageIndex = typeof body?.passageIndex === "number" ? body.passageIndex : 0;

    if (!slug || !photoUrl) {
      return NextResponse.json({ error: "Missing slug or photoUrl" }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dashmemories.com";
    const qrTarget = `${appUrl}/h/${slug}`;
    const qrParams = (bg: string) =>
      `${appUrl}/api/qr?data=${encodeURIComponent(qrTarget)}&size=1000&bg=${bg}&ecl=H&fg=3B0066&margin=4`;
    const qrUrlCard = qrParams("transparent");
    const qrUrlPoster = qrParams("white");

    const origin = new URL(req.url).origin;
    const [cardFrontRes, cardBackRes, posterRes] = await Promise.all([
      fetch(`${origin}/api/generate-print-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          photoUrl,
          format: "card-front",
          fullName,
          birthDate,
          deathDate,
        }),
      }),
      fetch(`${origin}/api/generate-print-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          qrUrl: qrUrlCard,
          format: "card-back",
          fullName,
          birthDate,
          deathDate,
          counselorName: counselorName || "Groman Mortuary",
          counselorPhone,
          passageIndex,
        }),
      }),
      fetch(`${origin}/api/generate-print-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          photoUrl,
          qrUrl: qrUrlPoster,
          format: "poster",
          fullName,
          birthDate,
          deathDate,
        }),
      }),
    ]);

    const attachments: Array<{ filename: string; content: Buffer }> = [];
    if (cardFrontRes.ok) {
      attachments.push({ filename: "card-front.pdf", content: Buffer.from(await cardFrontRes.arrayBuffer()) });
    }
    if (cardBackRes.ok) {
      attachments.push({ filename: "card-back.pdf", content: Buffer.from(await cardBackRes.arrayBuffer()) });
    }
    if (posterRes.ok) {
      attachments.push({ filename: "poster.pdf", content: Buffer.from(await posterRes.arrayBuffer()) });
    }

    const recipientEmail = process.env.TEST_PDF_EMAIL || process.env.PRINT_SHOP_EMAIL || "";
    if (recipientEmail && attachments.length > 0) {
      await sendPrintPdfEmail({
        slug,
        fullName: fullName || "—",
        counselorName,
        recipientEmail,
        attachments,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("approve-print-order error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Approval failed" },
      { status: 500 }
    );
  }
}
