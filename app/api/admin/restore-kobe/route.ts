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

  const { data, error } = await supabaseAdmin
    .from("stories")
    .update({
      mux_asset_id,
      mux_playback_id,
      photo_url,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", "kobe-bryant")
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, story: data });
}
