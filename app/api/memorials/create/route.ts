"use client";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type MemorialPayload = {
  first_name?: string;
  last_name?: string;
  birth_date?: string;
  death_date?: string;
  headline?: string;
};

export async function POST(req: Request) {
  let body: MemorialPayload;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { first_name, last_name, birth_date, death_date, headline } = body;

  if (!first_name || !last_name || !birth_date || !death_date) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("memorials")
    .insert({
      first_name,
      last_name,
      birth_date,
      death_date,
      headline: headline || null,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, memorial: data });
}

