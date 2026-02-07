import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
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
    const { userId, response } = await req.json();
    if (!userId || !response) {
      return NextResponse.json({ error: "Missing data." }, { status: 400 });
    }

    const { data: challengeRow } = await supabaseAdmin
      .from("passkey_challenges")
      .select("challenge")
      .eq("user_id", userId)
      .eq("type", "registration")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!challengeRow?.challenge) {
      return NextResponse.json({ error: "Challenge expired." }, { status: 400 });
    }

    const origin = getOrigin();
    const rpID = new URL(origin).hostname;

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Registration failed." }, { status: 400 });
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
    const credentialId = isoBase64URL.fromBuffer(credentialID);
    const publicKey = isoBase64URL.fromBuffer(credentialPublicKey);
    const transports = Array.isArray(response?.response?.transports)
      ? response.response.transports
      : null;

    await supabaseAdmin.from("user_passkeys").insert({
      user_id: userId,
      credential_id: credentialId,
      public_key: publicKey,
      counter,
      transports,
    });

    await supabaseAdmin
      .from("passkey_challenges")
      .delete()
      .eq("user_id", userId)
      .eq("type", "registration");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to verify passkey." },
      { status: 500 }
    );
  }
}
