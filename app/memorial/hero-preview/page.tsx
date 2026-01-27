"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

// Reuse the same data that powers the 4x6 memorial card (single source of truth)
export default function HeroPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";
  const [cardData, setCardData] = useState({
    fullName: "",
    birthDate: "",
    deathDate: "",
    qrUrl: "",
    photoUrl: "",
  });
  const [slug, setSlug] = useState("");
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>("");

  useEffect(() => {
    let next = { ...cardData };
    let nextSlug = "";
    const pName = searchParams?.get("name");
    const pBirth = searchParams?.get("birth");
    const pDeath = searchParams?.get("death");
    const pSlug = searchParams?.get("slug");
    const pPhoto = searchParams?.get("photo");
    if (pName) next.fullName = pName;
    if (pBirth) next.birthDate = pBirth;
    if (pDeath) next.deathDate = pDeath;
    if (pSlug) nextSlug = pSlug;
    if (pPhoto) next.photoUrl = pPhoto;

    if (!pName || !pBirth || !pDeath || !pPhoto) {
      try {
        const storedName = window.sessionStorage.getItem("memorial_full_name") || "";
        const storedBirth = window.sessionStorage.getItem("memorial_birth_date") || "";
        const storedDeath = window.sessionStorage.getItem("memorial_death_date") || "";
        const storedPhoto = window.sessionStorage.getItem("memorial_photo_url") || "";
        const storedSlug = window.sessionStorage.getItem("memorial_slug") || "";
        if (!pName && storedName) next.fullName = storedName;
        if (!pBirth && storedBirth) next.birthDate = storedBirth;
        if (!pDeath && storedDeath) next.deathDate = storedDeath;
        if (!pPhoto && storedPhoto) next.photoUrl = storedPhoto;
        if (!pSlug && storedSlug) nextSlug = storedSlug;
      } catch {}
    }

    setCardData(next);
    setSlug(nextSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    router.prefetch("/memorial/final-approval");
  }, [router]);

  useEffect(() => {
    const buildPreviewQr = async () => {
      try {
        const dataUrl = await QRCode.toDataURL("dashmemories:preview", {
          width: 240,
          margin: 1,
          color: { dark: "#000000", light: "#FFFFFF" },
          errorCorrectionLevel: "H",
        });
        setQrPreviewUrl(dataUrl);
      } catch {
        setQrPreviewUrl("");
      }
    };
    buildPreviewQr();
  }, []);

  const memorialName = cardData.fullName;
  const birthDate = cardData.birthDate;
  const deathDate = cardData.deathDate;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (memorialName) params.set("name", memorialName);
    if (birthDate) params.set("birth", birthDate);
    if (deathDate) params.set("death", deathDate);
    if (slug) params.set("slug", slug);
    if (cardData.photoUrl) params.set("photo", cardData.photoUrl);
    params.set("lang", currentLang);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const strings =
    currentLang === "es"
      ? {
          preview: "Vista previa",
          heroLabel: 'Retrato 20" × 30"',
          sunrise: "Amanecer",
          sunset: "Atardecer",
          next: "Siguiente",
        }
      : {
          preview: "Preview",
          heroLabel: '20" × 30" Hero Portrait',
          sunrise: "Sunrise",
          sunset: "Sunset",
          next: "Next",
        };

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
            onClick={() => router.push(`/memorial/back-preview${buildQueryString()}`)}
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">{strings.preview}</p>
            <p className="text-base font-semibold text-white/80">{strings.heroLabel}</p>
          </div>
          <div className="h-10 w-10" />
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[2/3] w-full max-w-[440px] overflow-hidden bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            {cardData.photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cardData.photoUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                aria-hidden="true"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70" />

            <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-10 text-center text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)] space-y-3">
              <p className="text-[20px] font-semibold tracking-tight leading-[1.2]">{cardData.fullName}</p>

              <div className="flex w-full items-center justify-center gap-4 text-[7px] font-medium text-white/85">
                <div className="flex flex-col items-center leading-[1.3]">
                  <p className="text-[7px] font-semibold text-white/90 leading-[1.2]">
                    {cardData.birthDate}
                  </p>
                  <p className="uppercase tracking-[0.2em] text-white/80 text-center">{strings.sunrise}</p>
                </div>
                <div className="flex items-center justify-center">
                  <img
                    src={qrPreviewUrl || "/qr-placeholder.svg"}
                    alt="QR preview"
                    className="h-[7.5%] w-[7.5%] min-h-[30px] min-w-[30px] max-h-[36px] max-w-[36px] rounded-md bg-white/95 p-1 shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                  />
                </div>
                <div className="flex flex-col items-center leading-[1.3]">
                  <p className="text-[7px] font-semibold text-white/90 leading-[1.2]">
                    {cardData.deathDate}
                  </p>
                  <p className="uppercase tracking-[0.2em] text-white/80 text-center">{strings.sunset}</p>
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
                cardData.photoUrl ? `photo=${encodeURIComponent(cardData.photoUrl)}` : "",
                `lang=${currentLang}`,
              ]
                .filter(Boolean)
                .join("&")
                .replace(/^/, "?")}`
            )
          }
          className={primaryButtonClass}
        >
          {strings.next}
        </button>
      </div>
    </main>
  );
}

