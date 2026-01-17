"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function MemorialPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";
  const fullName = searchParams?.get("name")?.trim() || "";
  const birthDate = searchParams?.get("birth")?.trim() || "";
  const deathDate = searchParams?.get("death")?.trim() || "";
  const photoUrl = searchParams?.get("photo") || "";
  const slug = searchParams?.get("slug") || "";

  const strings =
    currentLang === "es"
      ? {
          preview: "Vista previa",
          cardLabel: 'Tarjeta 4" × 6"',
          inLovingMemory: "En amorosa memoria",
          approve: "Aprobar",
        }
      : {
          preview: "Preview",
          cardLabel: '4" × 6" Card',
          inLovingMemory: "In Loving Memory",
          approve: "Approve",
        };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-2 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

          <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-10">
        {/* Top Nav */}
        <header className="mb-8 flex items-center justify-between text-sm text-white/70">
          <button
            type="button"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            onClick={() => router.back()}
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">{strings.preview}</p>
            <p className="text-base font-semibold text-white/80">{strings.cardLabel}</p>
          </div>
          <div className="h-10 w-10" />
        </header>

        {/* Card Preview */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[2/3] w-full max-w-[320px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-black/10 overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: photoUrl ? `url(${photoUrl})` : undefined }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/65" />
            <div className="absolute inset-0 flex items-end justify-center pb-10 px-6 text-center text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
              <div className="space-y-2">
                <p className="text-lg font-semibold text-white/90 font-serif">{strings.inLovingMemory}</p>
                <p className="text-2xl font-semibold tracking-tight text-white">{fullName || "—"}</p>
                <p className="text-sm font-medium text-white/85">
                  {birthDate || "—"} – {deathDate || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/90 to-transparent px-6 pb-6 pt-6">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/memorial/back-preview${[
                  fullName ? `name=${encodeURIComponent(fullName)}` : "",
                  birthDate ? `birth=${encodeURIComponent(birthDate)}` : "",
                  deathDate ? `death=${encodeURIComponent(deathDate)}` : "",
                  slug ? `slug=${encodeURIComponent(slug)}` : "",
                  photoUrl ? `photo=${encodeURIComponent(photoUrl)}` : "",
                  `lang=${currentLang}`,
                ]
                  .filter(Boolean)
                  .join("&")
                  .replace(/^/, "?")}`
              )
            }
            className={primaryButtonClass}
          >
            {strings.approve}
          </button>
        </div>
      </div>
    </main>
  );
}

