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
      .limit(5);

    if (error || !data || data.length === 0) {
      return NextResponse.json({ error: "Invalid code." }, { status: 400 });
    }

    const secret = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "otp";
    const codeHash = hashOtp(normalizedEmail, token, secret);
    const now = Date.now();
    let matchedId: string | null = null;
    let hasUnexpired = false;

    for (const row of data) {
      const expiresAt = new Date(row.expires_at).getTime();
      if (!Number.isNaN(expiresAt) && now <= expiresAt) {
        hasUnexpired = true;
        if (row.code_hash === codeHash) {
          matchedId = row.id;
          break;
        }
      }
    }

    if (!matchedId) {
      return NextResponse.json(
        { error: hasUnexpired ? "Invalid code." : "Code expired." },
        { status: 400 }
      );
    }

    await supabaseAdmin
      .from("email_otps")
      .update({ used_at: new Date().toISOString() })
      .eq("id", matchedId);

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
