import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const email = searchParams.get("email");

  if (!userId && !email) {
    return NextResponse.json({ error: "Missing account info." }, { status: 400 });
  }

  const query = supabaseAdmin
    .from("drafts")
    .select("slug, full_name, birth_date, death_date, photo_url, email")
    .order("updated_at", { ascending: false })
    .limit(1);

  const { data, error } = userId
    ? await query.eq("user_id", userId).maybeSingle()
    : await query.eq("email", email).maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ success: true, draft: null });
  }

  return NextResponse.json({ success: true, draft: data });
}
