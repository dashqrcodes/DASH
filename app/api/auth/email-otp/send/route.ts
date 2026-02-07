import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateOtpCode, getOtpExpiry, hashOtp, sendEmailOtp } from "@/lib/utils/emailOtp";

export const runtime = "nodejs";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const code = generateOtpCode();
    const secret = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "otp";
    const codeHash = hashOtp(normalizedEmail, code, secret);
    const expiresAt = getOtpExpiry();

    const cleanupCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("email", normalizedEmail)
      .or(`expires_at.lt.${new Date().toISOString()},used_at.not.is.null`)
      .lt("created_at", cleanupCutoff);

    const { error } = await supabaseAdmin.from("email_otps").insert({
      email: normalizedEmail,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to save OTP." }, { status: 500 });
    }

    await sendEmailOtp({ recipientEmail: normalizedEmail, code });

    const debugEnabled = process.env.OTP_DEBUG_CODE === "true";
    return NextResponse.json({
      success: true,
      ...(debugEnabled ? { debugCode: code } : {}),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to send OTP." },
      { status: 500 }
    );
  }
}
