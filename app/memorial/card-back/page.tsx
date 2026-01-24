"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getSupabaseClient } from "../../../utils/supabaseClient";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

// PRINT LOCK NOTE: This screen becomes read-only once print production starts.
// Users may still navigate back to review; future locking will be added later (no lock yet).
// PASSAGE LIMITS: Predefined, controlled passages only (soft 600–800 chars; hard 550–850).
// TEXT DOES NOT AUTO-SCALE: Fixed size/line-height to preserve print fidelity.
const PASSAGES = [
  {
    id: "psalm23-comfort",
    en:
      "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures and leads me beside still waters. He restores my soul and guides me in paths of righteousness for His name’s sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me. You prepare a table before me in the presence of my enemies; You anoint my head with oil; my cup overflows. Surely goodness and mercy shall follow me all the days of my life, and I will dwell in the house of the Lord forever.",
    es:
      "El Señor es mi pastor; nada me faltará. En verdes pastos me hace descansar, junto a aguas tranquilas me conduce. Él restaura mi alma y me guía por sendas de justicia por amor de su nombre. Aunque camine por el valle de sombra de muerte, no temeré mal alguno, porque Tú estás conmigo; Tu vara y Tu cayado me infunden aliento. Preparas mesa delante de mí en presencia de mis angustiadores; unges mi cabeza con aceite; mi copa rebosa. Ciertamente el bien y la misericordia me seguirán todos los días de mi vida, y en la casa del Señor moraré por largos días.",
  },
  {
    id: "memory-light",
    en:
      "What we have once enjoyed we can never lose; all that we love deeply becomes a part of us. The light of their life remains, warming our hearts when the air grows cold. In quiet moments between sunrise and sunset, we carry their laughter, their wisdom, and their courage. Love does not vanish; it changes form, guiding us gently forward. As we remember, we are reminded that every kindness they shared continues to ripple through our days. May the peace they knew surround us, and may the hope they carried become our own, until we meet again in everlasting light.",
    es:
      "Lo que hemos disfrutado no se pierde; todo lo que amamos profundamente se vuelve parte de nosotros. La luz de su vida permanece, calentando nuestro corazón cuando el aire se enfría. En los momentos silenciosos entre el amanecer y el atardecer, llevamos su risa, su sabiduría y su valentía. El amor no desaparece; cambia de forma y nos guía con suavidad. Al recordar, vemos que cada bondad que compartieron sigue expandiéndose en nuestros días. Que la paz que conocieron nos rodee, y que la esperanza que llevaron se vuelva nuestra, hasta reencontrarnos en la luz eterna.",
  },
];

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
  const lang = searchParams?.get("lang") === "es" ? "es" : "en";

  // Controlled selection only; no freeform editing on this screen.
  const selectedPassage = PASSAGES[0];
  const bodyText = selectedPassage[lang];

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
    params.set("lang", lang);
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
          passage_id: selectedPassage.id,
          passage_body: bodyText,
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
            onClick={() => router.push(`/memorial/card-front${buildQueryString()}`)}
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

              {/* Fixed-height text to avoid reflow; text does not auto-scale. */}
              <div className="w-full flex items-center justify-center">
                <div className="h-44 w-full overflow-hidden">
                  <p className="text-[12px] leading-[1.35] font-semibold text-slate-900 whitespace-pre-wrap">
                    {bodyText}
                  </p>
                </div>
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
                        `https://dashmemories.com/heaven/${slug}`
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

