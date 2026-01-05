"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSupabaseClient } from "../../../utils/supabaseClient";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

// NOTE: This screen is intended to be read-only once print production begins.
// Users may still navigate back to review; future locking hooks will be added later.
const defaultBodyText =
  "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures: he leadeth me beside the still waters. He restoreth my soul: he leadeth me in the paths of righteousness for his name's sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy rod and thy staff they comfort me.";

export default function MemorialCardBackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Canonical memorial data is sourced upstream; do not invent or mutate here.
  const memorialName = searchParams?.get("name") || "";
  const birthDate = searchParams?.get("birth") || "";
  const deathDate = searchParams?.get("death") || "";
  const slug = searchParams?.get("slug") || "";
  const counselorName = searchParams?.get("counselor") || "";
  const counselorPhone = searchParams?.get("phone") || "";

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (memorialName) params.set("name", memorialName);
    if (birthDate) params.set("birth", birthDate);
    if (deathDate) params.set("death", deathDate);
    if (slug) params.set("slug", slug);
    if (counselorName) params.set("counselor", counselorName);
    if (counselorPhone) params.set("phone", counselorPhone);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const handleApprove = async () => {
    setSaving(true);
    setError(null);

    let supabase;
    try {
      supabase = getSupabaseClient();
    } catch {
      // Local/demo mode: Supabase not configured; continue navigation.
      router.push(`/memorial/hero-preview${buildQueryString()}`);
      return;
    }

    const { error: supabaseError } = await supabase
      .from("memorial_cards")
      .upsert(
        {
          slug,
          memorial_name: memorialName,
          birth_date: birthDate,
          death_date: deathDate,
          counselor_name: counselorName,
          counselor_phone: counselorPhone,
          status: "card_back_approved",
        },
        { onConflict: "slug" }
      );

    if (supabaseError) {
      // Keep UX flowing; in production, hook print-locking and error handling here.
      setError("Unable to save to Supabase right now. Continuing in review mode.");
    }

    router.push(`/memorial/hero-preview${buildQueryString()}`);
  };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-10">
        {/* Top nav */}
        <header className="mb-8 flex items-center justify-between text-sm text-white/80">
          <button
            type="button"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            onClick={() => router.push(`/memorial/preview${buildQueryString()}`)}
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">Preview</p>
            <p className="text-base font-semibold text-white/80">4&quot; × 6&quot; Card</p>
          </div>
          <div className="h-10 w-10" />
        </header>

        {/* Card Preview */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[2/3] w-full max-w-[320px] overflow-hidden bg-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-black/10">
            <div className="absolute inset-0 bg-[url('/sunrise-sky-back.jpg')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/25 to-white/15" />

            <div className="absolute inset-0 flex flex-col items-center justify-between px-6 py-6 text-center text-gray-900">
              <div className="pt-2">
                <p className="text-lg font-semibold text-slate-900 font-serif">
                  Forever in Our Hearts
                </p>
              </div>

              <div className="flex-1 w-full flex items-center justify-center">
                <p className="text-sm leading-relaxed text-slate-900">{defaultBodyText}</p>
              </div>

              <div className="flex flex-col items-center gap-4 pb-4">
                <div className="flex w-full items-center justify-between gap-3 text-xs text-slate-800">
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">{birthDate}</p>
                    <p className="uppercase tracking-[0.14em] text-slate-600 font-normal">Sunrise</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <img
                      src={`https://quickchart.io/qr?text=${encodeURIComponent(
                        `https://dashmemories.com/memorial/${slug}`
                      )}&dark=4b0082&light=00000000&margin=0&size=240`}
                      alt="Memorial QR"
                      className="h-16 w-16 bg-white ring-1 ring-gray-300 shadow-md"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{deathDate}</p>
                    <p className="uppercase tracking-[0.14em] text-slate-600 font-normal">Sunset</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600">
                  Honoring your loved one with dignity and respect.
                </p>
                <p className="text-[11px] text-slate-600 font-semibold">
                  {counselorName} • {counselorPhone}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/90 to-transparent px-6 pb-6 pt-6">
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleApprove}
            disabled={saving}
            className={`${primaryButtonClass} ${saving ? "opacity-80" : ""}`}
          >
            {saving ? "Saving..." : "Approve"}
          </button>
          {error && <p className="text-center text-sm text-red-300">{error}</p>}
        </div>
      </div>
    </main>
  );
}

