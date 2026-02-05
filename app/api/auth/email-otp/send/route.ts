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

    const { error } = await supabaseAdmin.from("email_otps").insert({
      email: normalizedEmail,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to save OTP." }, { status: 500 });
    }

    await sendEmailOtp({ recipientEmail: normalizedEmail, code });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to send OTP." },
      { status: 500 }
    );
  }
}
