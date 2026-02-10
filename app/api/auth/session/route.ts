import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionExpiry,
} from "@/lib/utils/session";
import crypto from "crypto";

export const runtime = "nodejs";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const tokenHash = hashToken(sessionCookie);
    const { data: sessionRow, error } = await supabaseAdmin
      .from("user_sessions")
      .select("id, user_id, email, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !sessionRow?.user_id) {
      return NextResponse.json({ authenticated: false });
    }

    const expiresAt = sessionRow.expires_at
      ? new Date(sessionRow.expires_at).getTime()
      : 0;
    if (!expiresAt || Number.isNaN(expiresAt) || Date.now() > expiresAt) {
      await supabaseAdmin.from("user_sessions").delete().eq("id", sessionRow.id);
      return NextResponse.json({ authenticated: false });
    }

    const refreshedExpires = getSessionExpiry();
    const { token: refreshedToken, hash } = createSessionToken();
    await supabaseAdmin
      .from("user_sessions")
      .update({
        token_hash: hash,
        expires_at: refreshedExpires.toISOString(),
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", sessionRow.id);

    const response = NextResponse.json({
      authenticated: true,
      userId: sessionRow.user_id,
      email: sessionRow.email,
    });
    response.cookies.set(SESSION_COOKIE_NAME, refreshedToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: refreshedExpires,
      path: "/",
    });
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { authenticated: false, error: error?.message || "Session check failed." },
      { status: 500 }
    );
  }
}
