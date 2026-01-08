"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseSingleton: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseSingleton) return supabaseSingleton;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  supabaseSingleton = createClient(url, anonKey);
  return supabaseSingleton;
}

export const supabase = getSupabaseClient();

// Helper functions (UI-safe; auth restrictions handled via RLS/backend)
export async function createMemorial(data: any) {
  const { data: memorial, error } = await supabase.from("memorials").insert(data).select().single();
  return { memorial, error };
}

export async function getMemorial(id: string) {
  const { data: memorial, error } = await supabase.from("memorials").select("*").eq("id", id).single();
  return { memorial, error };
}

export async function updateMemorial(id: string, updates: any) {
  const { data: memorial, error } = await supabase
    .from("memorials")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { memorial, error };
}

export async function createOrder(data: any) {
  const { data: order, error } = await supabase.from("orders").insert(data).select().single();
  return { order, error };
}

