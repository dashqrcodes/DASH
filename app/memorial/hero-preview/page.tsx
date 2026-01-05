"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

// Reuse the same data that powers the 4x6 memorial card (single source of truth)
export default function HeroPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cardData, setCardData] = useState({
    fullName: "",
    birthDate: "",
    deathDate: "",
    qrUrl: "",
    photoUrl: "",
  });
  const [slug, setSlug] = useState("");

  useEffect(() => {
    let next = { ...cardData };
    let nextSlug = "";
    const pName = searchParams.get("name");
    const pBirth = searchParams.get("birth");
    const pDeath = searchParams.get("death");
    const pSlug = searchParams.get("slug");
    const pPhoto = searchParams.get("photo");
    if (pName) next.fullName = pName;
    if (pBirth) next.birthDate = pBirth;
    if (pDeath) next.deathDate = pDeath;
    if (pSlug) nextSlug = pSlug;
    if (pPhoto) next.photoUrl = pPhoto;
    next.qrUrl = nextSlug
      ? `https://quickchart.io/qr?text=${encodeURIComponent(
          `https://dashmemories.com/memorial/${nextSlug}`
        )}&dark=ffffff&light=00000000&margin=0&size=44`
      : "";
    setCardData(next);
    setSlug(nextSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-24 pt-10">
        <header className="mb-8 flex items-center justify-between text-sm text-white/80">
          <button
            type="button"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            onClick={() => router.back()}
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Preview</p>
            <p className="text-base font-semibold text-white/80">20&quot; × 30&quot; Hero Portrait</p>
          </div>
          <div className="h-10 w-10" />
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[2/3] w-full max-w-[440px] overflow-hidden bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${cardData.photoUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70" />

            <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-10 text-center text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] space-y-2">
              <p className="text-[20px] font-semibold tracking-tight translate-y-4">{cardData.fullName}</p>

              <div className="flex w-full items-center justify-center gap-3 text-[8px] font-medium text-white/85">
                <div className="flex flex-col items-center leading-tight translate-y-[10px]">
                  <p className="text-[10px] font-semibold text-white/90">{cardData.birthDate}</p>
                  <p className="uppercase tracking-[0.14em] text-white/80 text-center">Sunrise</p>
                </div>
                <div className="flex items-center justify-center translate-y-[10px]">
                  <img
                    src={cardData.qrUrl}
                    alt="Memorial QR"
                    className="h-5 w-5 shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
                  />
                </div>
                <div className="flex flex-col items-center leading-tight translate-y-[10px]">
                  <p className="text-[11px] font-semibold text-white/90">{cardData.deathDate}</p>
                  <p className="uppercase tracking-[0.14em] text-white/80 text-center">Sunset</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/90 to-transparent px-6 pb-6 pt-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/memorial/final-approval${[
                memorialName ? `name=${encodeURIComponent(memorialName)}` : "",
                birthDate ? `birth=${encodeURIComponent(birthDate)}` : "",
                deathDate ? `death=${encodeURIComponent(deathDate)}` : "",
                slug ? `slug=${encodeURIComponent(slug)}` : "",
              ]
                .filter(Boolean)
                .join("&")
                .replace(/^/, "?")}`
            )
          }
          className={primaryButtonClass}
        >
          Approve
        </button>
      </div>
    </main>
  );
}

