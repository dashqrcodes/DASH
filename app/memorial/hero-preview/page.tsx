"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BackArrowButton from "@/components/BackArrowButton";
import { buildCloudinaryFaceCropUrl } from "@/lib/utils/cloudinary";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

// Reuse the same data that powers the 4x6 memorial card (single source of truth)
export default function HeroPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const [cardData, setCardData] = useState({
    fullName: "",
    birthDate: "",
    deathDate: "",
    qrUrl: "",
    photoUrl: "",
  });
  const [slug, setSlug] = useState("");
  const [previewWidth, setPreviewWidth] = useState(1400);

  const readStoredValue = (key: string) => {
    try {
      return window.sessionStorage.getItem(key) || window.localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  };

  const persistValue = (key: string, value: string) => {
    if (!value) return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {}
    try {
      window.localStorage.setItem(key, value);
    } catch {}
  };

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
        const storedName = readStoredValue("memorial_full_name");
        const storedBirth = readStoredValue("memorial_birth_date");
        const storedDeath = readStoredValue("memorial_death_date");
        const storedPhoto = readStoredValue("memorial_photo_url");
        const storedSlug = readStoredValue("memorial_slug");
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
    if (cardData.fullName) persistValue("memorial_full_name", cardData.fullName);
    if (cardData.birthDate) persistValue("memorial_birth_date", cardData.birthDate);
    if (cardData.deathDate) persistValue("memorial_death_date", cardData.deathDate);
    if (cardData.photoUrl) persistValue("memorial_photo_url", cardData.photoUrl);
    if (slug) persistValue("memorial_slug", slug);
  }, [cardData, slug]);

  useEffect(() => {
    if (!slug) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dashmemories.com";
    const qrTargetUrl = `${appUrl}/heaven/${slug}`;
    const qrPrefetch = new Image();
    qrPrefetch.src = `/api/qr?data=${encodeURIComponent(qrTargetUrl)}&size=240&bg=white&v=2`;
  }, [slug]);

  useEffect(() => {
    router.prefetch("/memorial/final-approval");
  }, [router]);

  useEffect(() => {
    router.prefetch("/memorial/card-back");
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    setPreviewWidth(width < 480 ? 1100 : 1400);
  }, []);

  const memorialName = cardData.fullName;
  const birthDate = cardData.birthDate;
  const deathDate = cardData.deathDate;
  const previewPhotoUrl = cardData.photoUrl
    ? buildCloudinaryFaceCropUrl(cardData.photoUrl, { aspectRatio: "2:3", width: previewWidth })
    : "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dashmemories.com";
  const qrTargetUrl = slug ? `${appUrl}/heaven/${slug}` : "";
  const qrPreviewUrl = qrTargetUrl
    ? `/api/qr?data=${encodeURIComponent(qrTargetUrl)}&size=240&bg=white&v=2`
    : "/qr-dark-purple.svg";

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (slug) params.set("slug", slug);
    params.set("lang", currentLang);
    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const pushWithFallback = (target: string) => {
    if (typeof window !== "undefined") {
      const current = `${window.location.pathname}${window.location.search}`;
      if (current === target) return;
      window.location.assign(target);
      return;
    }
    router.push(target);
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
          <BackArrowButton
            className="bg-white/5 ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/10"
            onClick={() => pushWithFallback(`/memorial/card-back${buildQueryString()}`)}
          />
          <div className="flex-1 text-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">{strings.preview}</p>
            <p className="text-base font-semibold text-white/80">{strings.heroLabel}</p>
          </div>
          <div className="h-10 w-10" />
        </header>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[2/3] w-full max-w-[440px] overflow-hidden bg-black shadow-[0_18px_40px_rgba(0,0,0,0.45)] [container-type:size]">
            {cardData.photoUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPhotoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  aria-hidden="true"
                />
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-black/70" />

            {/* 20"×30" print scale: QR 1.25" total with white border */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-[6.67%] px-[5%] text-center text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]">
              <p className="font-semibold tracking-tight leading-[1.2] max-w-full truncate text-[20px]">
                {cardData.fullName}
              </p>
              <div className="flex w-full items-center justify-center gap-4 text-[7px] font-medium text-white/85 mt-2">
                <div className="flex flex-col items-center leading-[1.3] flex-1 min-w-0">
                  <p className="font-semibold text-white/90 leading-[1.2]">
                    {cardData.birthDate}
                  </p>
                  <p className="uppercase tracking-[0.2em] text-white/80 text-center">{strings.sunrise}</p>
                </div>
                <div
                  className="flex items-center justify-center flex-shrink-0 bg-white p-3 rounded-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                  style={{ width: "10%", minWidth: 56, aspectRatio: "1" }}
                >
                  <img
                    src={qrPreviewUrl}
                    alt="QR preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col items-center leading-[1.3] flex-1 min-w-0">
                  <p className="font-semibold text-white/90 leading-[1.2]">
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
          onClick={() => {
            const target = `/memorial/final-approval${[
              memorialName ? `name=${encodeURIComponent(memorialName)}` : "",
              birthDate ? `birth=${encodeURIComponent(birthDate)}` : "",
              deathDate ? `death=${encodeURIComponent(deathDate)}` : "",
              slug ? `slug=${encodeURIComponent(slug)}` : "",
              cardData.photoUrl ? `photo=${encodeURIComponent(cardData.photoUrl)}` : "",
              `lang=${currentLang}`,
            ]
              .filter(Boolean)
              .join("&")
              .replace(/^/, "?")}`;
            pushWithFallback(target);
          }}
          className={primaryButtonClass}
        >
          {strings.next}
        </button>
      </div>
    </main>
  );
}

