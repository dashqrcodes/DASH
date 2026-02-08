import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
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

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { data: passkeys } = await supabaseAdmin
      .from("user_passkeys")
      .select("credential_id, transports")
      .eq("user_id", user.id);

    if (!passkeys || passkeys.length === 0) {
      return NextResponse.json({ error: "No passkeys found." }, { status: 400 });
    }

    const allowCredentials = passkeys.map((key) => ({
      id: key.credential_id,
      type: "public-key" as const,
      transports: key.transports || undefined,
    }));

    const origin = getOrigin();
    const rpID = new URL(origin).hostname;

    const options = await generateAuthenticationOptions({
      rpID,
      timeout: 60000,
      userVerification: "preferred",
      allowCredentials,
    });

    await supabaseAdmin
      .from("passkey_challenges")
      .delete()
      .eq("user_id", user.id)
      .eq("type", "authentication");

    await supabaseAdmin.from("passkey_challenges").insert({
      user_id: user.id,
      type: "authentication",
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
