import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

/** Dark purple (#581c87 = RGB 88,28,135) */
const DARK_PURPLE = "#581c87ff";
/** Transparent - use #0000 per qrcode docs */
const TRANSPARENT = "#0000";

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  const size = Math.min(600, Math.max(120, parseInt(req.nextUrl.searchParams.get("size") || "240", 10) || 240));

  if (!data) {
    return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
  }

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      type: "image/png",
      width: size,
      margin: 1,
      color: {
        dark: DARK_PURPLE,
        light: TRANSPARENT,
      },
      errorCorrectionLevel: "H",
    });

    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("QR generation failed:", err);
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
