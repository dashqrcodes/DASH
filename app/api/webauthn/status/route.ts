import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { userId, email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    let user = null as { id: string } | null;
    if (userId) {
      const { data } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
      if (data) user = data as { id: string };
    }

    if (!user && normalizedEmail) {
      const { data } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (data) user = data as { id: string };
    }

    if (!user) {
      return NextResponse.json({ hasPasskey: false, count: 0 });
    }

    const { data } = await supabaseAdmin
      .from("user_passkeys")
      .select("id")
      .eq("user_id", user.id);

    const count = Array.isArray(data) ? data.length : 0;
    return NextResponse.json({ hasPasskey: count > 0, count });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to check passkey status." },
      { status: 500 }
    );
  }
}
