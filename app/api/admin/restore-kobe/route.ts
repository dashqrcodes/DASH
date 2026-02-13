import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  let body: { mux_asset_id?: string; mux_playback_id?: string; photo_url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const mux_asset_id = body.mux_asset_id || null;
  const mux_playback_id = body.mux_playback_id || null;
  const photo_url = body.photo_url || null;

  if (!mux_asset_id && !mux_playback_id && !photo_url) {
    return NextResponse.json(
      { success: false, error: "Provide mux_asset_id, mux_playback_id, or photo_url" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    updated_at: now,
  };
  if (mux_asset_id != null) updates.mux_asset_id = mux_asset_id;
  if (mux_playback_id != null) updates.mux_playback_id = mux_playback_id;
  if (photo_url != null) updates.photo_url = photo_url;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("stories")
    .update(updates)
    .eq("slug", "kobe-bryant")
    .select()
    .maybeSingle();

  if (!updateError && updated) {
    return NextResponse.json({ success: true, story: updated });
  }

  // No existing row - insert so kobe-bryant always exists
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("stories")
    .insert({
      slug: "kobe-bryant",
      name: "Kobe Bryant",
      mux_asset_id,
      mux_playback_id,
      photo_url,
      created_at: now,
      updated_at: now,
    })
    .select()
    .maybeSingle();

  if (insertError) {
    return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, story: inserted });
}
