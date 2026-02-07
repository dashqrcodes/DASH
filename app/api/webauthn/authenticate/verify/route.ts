import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
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
      .eq("type", "authentication")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!challengeRow?.challenge) {
      return NextResponse.json({ error: "Challenge expired." }, { status: 400 });
    }

    const credentialId = response?.id as string | undefined;
    if (!credentialId) {
      return NextResponse.json({ error: "Missing credential." }, { status: 400 });
    }

    const { data: stored } = await supabaseAdmin
      .from("user_passkeys")
      .select("credential_id, public_key, counter")
      .eq("credential_id", credentialId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!stored?.credential_id || !stored.public_key) {
      return NextResponse.json({ error: "Passkey not found." }, { status: 400 });
    }

    const origin = getOrigin();
    const rpID = new URL(origin).hostname;

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: isoBase64URL.toBuffer(stored.credential_id),
        credentialPublicKey: isoBase64URL.toBuffer(stored.public_key),
        counter: stored.counter || 0,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Authentication failed." }, { status: 400 });
    }

    await supabaseAdmin
      .from("user_passkeys")
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq("credential_id", stored.credential_id)
      .eq("user_id", userId);

    await supabaseAdmin
      .from("passkey_challenges")
      .delete()
      .eq("user_id", userId)
      .eq("type", "authentication");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to verify passkey." },
      { status: 500 }
    );
  }
}
