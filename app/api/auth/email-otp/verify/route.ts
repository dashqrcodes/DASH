import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashOtp } from "@/lib/utils/emailOtp";

export const runtime = "nodejs";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const token = String(code || "").trim();

    if (!isValidEmail(normalizedEmail) || !/^\d{6}$/.test(token)) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("email_otps")
      .select("id, code_hash, expires_at, used_at")
      .eq("email", normalizedEmail)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    const expiresAt = new Date(data.expires_at).getTime();
    if (Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      return NextResponse.json({ error: "Code expired." }, { status: 400 });
    }

    const secret = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "otp";
    const codeHash = hashOtp(normalizedEmail, token, secret);
    if (codeHash !== data.code_hash) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    await supabaseAdmin
      .from("email_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", data.id);

    const { data: existingUser, error: userLookupError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userLookupError) {
      return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
    }

    let userId = existingUser?.id || null;
    if (!userId) {
      const { data: createdUser, error: userCreateError } = await supabaseAdmin
        .from("users")
        .insert({ email: normalizedEmail })
        .select("id")
        .single();

      if (userCreateError || !createdUser?.id) {
        return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
      }
      userId = createdUser.id;
    }

    return NextResponse.json({ success: true, userId, email: normalizedEmail });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Verification failed." },
      { status: 500 }
    );
  }
}
