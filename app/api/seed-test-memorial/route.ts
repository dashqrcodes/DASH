"use client";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function seed() {
  const { data, error } = await supabase
    .from("memorials")
    .insert({
      slug: "juanita-escobedo-de-ruiz",
      full_name: "Juana Escobedo De Ruiz",
      birth_date: "1962-03-08",
      death_date: "2025-11-13",
      headline: "Life. Love. Forever.",
      is_public: true,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, memorial: data });
}

export async function POST() {
  return seed();
}

export async function GET() {
  return seed();
}

