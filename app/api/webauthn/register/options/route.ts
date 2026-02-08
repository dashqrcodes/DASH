import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const getOrigin = () => {
  const hdrs = headers();
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
  const proto = hdrs.get("x-forwarded-proto") || "https";
  const envOrigin = process.env.NEXT_PUBLIC_APP_URL || "";
  return envOrigin || (host ? `${proto}://${host}` : "");
};

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!userId && !normalizedEmail) {
      return NextResponse.json({ error: "Missing user." }, { status: 400 });
    }

    type UserRecord = { id: string; email: string | null };
    let user: UserRecord | null = null;
    if (userId) {
      const { data } = await supabaseAdmin
        .from("users")
        .select("id, email")
        .eq("id", userId)
        .maybeSingle();
      if (data) user = data as UserRecord;
    }

    if (!user && normalizedEmail) {
      const { data } = await supabaseAdmin
        .from("users")
        .select("id, email")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (data) user = data as UserRecord;
    }

    if (!user && normalizedEmail) {
      const { data: created } = await supabaseAdmin
        .from("users")
        .insert({ email: normalizedEmail })
        .select("id, email")
        .single();
      if (created) user = created as UserRecord;
    }

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { data: existing } = await supabaseAdmin
      .from("user_passkeys")
      .select("credential_id")
      .eq("user_id", user.id);

    const excludeCredentials =
      existing?.map((row) => ({
        id: row.credential_id,
        transports: undefined,
      })) || [];

    const origin = getOrigin();
    const rpID = new URL(origin).hostname;

    const options = await generateRegistrationOptions({
      rpName: "DASH Memories",
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email || normalizedEmail || "dash-user",
      userDisplayName: user.email || normalizedEmail || "DASH User",
      timeout: 60000,
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    await supabaseAdmin
      .from("passkey_challenges")
      .delete()
      .eq("user_id", user.id)
      .eq("type", "registration");

    await supabaseAdmin.from("passkey_challenges").insert({
      user_id: user.id,
      type: "registration",
      challenge: options.challenge,
    });

    return NextResponse.json({ options, userId: user.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to start passkey." },
      { status: 500 }
    );
  }
}
