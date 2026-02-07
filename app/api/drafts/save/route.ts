import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      email,
      slug,
      fullName,
      birthDate,
      deathDate,
      photoUrl,
    } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing account info." }, { status: 400 });
    }
    if (!slug) {
      return NextResponse.json({ error: "Missing memorial slug." }, { status: 400 });
    }

    const payload = {
      user_id: userId,
      email,
      slug,
      status: "draft",
      full_name: fullName || null,
      birth_date: birthDate || null,
      death_date: deathDate || null,
      photo_url: photoUrl || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseAdmin
      .from("drafts")
      .upsert(payload, { onConflict: "slug" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unable to save draft." },
      { status: 500 }
    );
  }
}
