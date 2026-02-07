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

    const getOrCreateUser = async () => {
      const { data: existingUser, error: userLookupError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (userLookupError) {
        return {
          error: `Unable to verify account: ${userLookupError.message}`,
          userId: null as string | null,
        };
      }

      let userId = existingUser?.id || null;
      if (!userId) {
        const { data: createdUser, error: userCreateError } = await supabaseAdmin
          .from("users")
          .insert({ email: normalizedEmail })
          .select("id")
          .single();

        if (userCreateError || !createdUser?.id) {
          return {
            error: `Unable to verify account: ${
              userCreateError?.message || "Account creation failed."
            }`,
            userId: null as string | null,
          };
        }
        userId = createdUser.id;
      }

      return { error: null as string | null, userId };
    };

    const bypassEnabled = process.env.NEXT_PUBLIC_OTP_BYPASS === "true";
    const testEmail = process.env.OTP_TEST_EMAIL?.trim().toLowerCase();
    const testCode = process.env.OTP_TEST_CODE || "123456";
    if (
      (bypassEnabled && token === String(testCode)) ||
      (testEmail && normalizedEmail === testEmail && token === String(testCode))
    ) {
      const { error, userId } = await getOrCreateUser();
      if (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
      return NextResponse.json({ success: true, userId, email: normalizedEmail });
    }

    const cleanupCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabaseAdmin
      .from("email_otps")
      .delete()
      .eq("email", normalizedEmail)
      .or(`expires_at.lt.${new Date().toISOString()},used_at.not.is.null`)
      .lt("created_at", cleanupCutoff);

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

    const candidates = [
      process.env.OTP_SECRET,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      "otp",
      "",
    ]
      .filter((value, index, list) => value !== undefined && list.indexOf(value) === index)
      .map((value) => String(value ?? ""));
    const candidateHashes = new Set(
      candidates.map((secret) => hashOtp(normalizedEmail, token, secret))
    );
    const now = Date.now();
    let matchedId: string | null = null;
    let hasUnexpired = false;

    for (const row of data) {
      const expiresAt = new Date(row.expires_at).getTime();
      if (!Number.isNaN(expiresAt) && now <= expiresAt) {
        hasUnexpired = true;
        if (candidateHashes.has(row.code_hash)) {
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

    const { error: userError, userId } = await getOrCreateUser();
    if (userError) {
      return NextResponse.json({ error: userError }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId, email: normalizedEmail });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Verification failed." },
      { status: 500 }
    );
  }
}
