import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

/** Dash print dark purple (#3B0066) - high contrast for grayscale */
const DARK_PURPLE = "#3B0066";
/** Transparent for PNG RGBA (per qrcode docs) */
const TRANSPARENT = "#0000";

export async function GET(req: NextRequest) {
  const data = req.nextUrl.searchParams.get("data");
  const sizeParam = parseInt(req.nextUrl.searchParams.get("size") || "240", 10) || 240;
  const size = Math.min(1000, Math.max(120, sizeParam));
  const bg = req.nextUrl.searchParams.get("bg") || "transparent";
  const ecl = req.nextUrl.searchParams.get("ecl") || "H";
  const fg = req.nextUrl.searchParams.get("fg") || "";
  const margin = Math.max(4, parseInt(req.nextUrl.searchParams.get("margin") || "4", 10) || 4);

  if (!data) {
    return NextResponse.json({ error: "Missing data parameter" }, { status: 400 });
  }

  const lightColor = bg === "white" ? "#ffffff" : TRANSPARENT;
  const errorLevel = ["L", "M", "Q", "H"].includes(ecl) ? ecl : "H";
  const darkColor =
    fg === "black"
      ? "#000000"
      : /^[0-9A-Fa-f]{6}$/.test(fg)
        ? `#${fg}`
        : DARK_PURPLE;

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      type: "image/png",
      width: size,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: errorLevel as "L" | "M" | "Q" | "H",
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
