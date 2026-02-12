"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import BackArrowButton from "@/components/BackArrowButton";
import { useEffect, useState } from "react";
import { buildCloudinaryFaceCropUrl } from "@/lib/utils/cloudinary";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function MemorialPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLang = resolveLang(searchParams);
  const [fullName, setFullName] = useState(searchParams?.get("name")?.trim() || "");
  const [birthDate, setBirthDate] = useState(searchParams?.get("birth")?.trim() || "");
  const [deathDate, setDeathDate] = useState(searchParams?.get("death")?.trim() || "");
  const [photoUrl, setPhotoUrl] = useState(searchParams?.get("photo") || "");
  const [previewWidth, setPreviewWidth] = useState(1200);
  const slug = searchParams?.get("slug") || "";
  const previewPhotoUrl = photoUrl
    ? buildCloudinaryFaceCropUrl(photoUrl, { aspectRatio: "2:3", width: previewWidth })
    : "";

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
    const name = searchParams?.get("name")?.trim() || "";
    const birth = searchParams?.get("birth")?.trim() || "";
    const death = searchParams?.get("death")?.trim() || "";
    const photo = searchParams?.get("photo") || "";

    if (name) setFullName(name);
    if (birth) setBirthDate(birth);
    if (death) setDeathDate(death);
    if (photo) setPhotoUrl(photo);

    if (!name || !birth || !death || !photo) {
      try {
        const storedName = readStoredValue("memorial_full_name");
        const storedBirth = readStoredValue("memorial_birth_date");
        const storedDeath = readStoredValue("memorial_death_date");
        const storedPhoto = readStoredValue("memorial_photo_url");
        if (!name && storedName) setFullName(storedName);
        if (!birth && storedBirth) setBirthDate(storedBirth);
        if (!death && storedDeath) setDeathDate(storedDeath);
        if (!photo && storedPhoto) setPhotoUrl(storedPhoto);
      } catch {}
    }
  }, [searchParams]);

  useEffect(() => {
    router.prefetch("/memorial/card-back");
    const image = new Image();
    image.src = "/sky background rear.jpg";
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const width = window.innerWidth;
    setPreviewWidth(width < 480 ? 900 : 1200);
  }, []);

  useEffect(() => {
    if (fullName) persistValue("memorial_full_name", fullName);
    if (birthDate) persistValue("memorial_birth_date", birthDate);
    if (deathDate) persistValue("memorial_death_date", deathDate);
    if (photoUrl) persistValue("memorial_photo_url", photoUrl);
    if (slug) persistValue("memorial_slug", slug);
  }, [fullName, birthDate, deathDate, photoUrl, slug]);

  useEffect(() => {
    if (!slug) return;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dashmemories.com";
    const qrTargetUrl = `${appUrl}/heaven/${slug}`;
    const qrPrefetch = new Image();
    qrPrefetch.src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=88-28-135&bgcolor=transparent&data=${encodeURIComponent(
      qrTargetUrl
    )}`;
  }, [slug]);

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
          cardLabel: 'Tarjeta 4" × 6"',
          inLovingMemory: "En amorosa memoria",
          next: "Siguiente",
        }
      : {
          preview: "Preview",
          cardLabel: '4" × 6" Card',
          inLovingMemory: "In Loving Memory",
          next: "Next",
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
          <BackArrowButton
            className="bg-white/5 ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/10"
            onClick={() =>
              pushWithFallback(
                `/memorial/profile?lang=${currentLang}${
                  fullName ? `&name=${encodeURIComponent(fullName)}` : ""
                }${birthDate ? `&birth=${encodeURIComponent(birthDate)}` : ""}${
                  deathDate ? `&death=${encodeURIComponent(deathDate)}` : ""
                }${
                  photoUrl && !photoUrl.startsWith("data:") && !photoUrl.startsWith("blob:")
                    ? `&photo=${encodeURIComponent(photoUrl)}`
                    : ""
                }`
              )
            }
          />
          <div className="flex-1 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-white/50">{strings.preview}</p>
            <p className="text-base font-semibold text-white/80">{strings.cardLabel}</p>
          </div>
          <div className="h-10 w-10" />
        </header>

        {/* Card Preview */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[2/3] w-full max-w-[320px] bg-white shadow-[0_18px_40px_rgba(0,0,0,0.45)] ring-1 ring-black/10 overflow-hidden">
            {photoUrl && (
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
              pushWithFallback(
                `/memorial/card-back${[
                  slug ? `slug=${encodeURIComponent(slug)}` : "",
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
      </div>
    </main>
  );
}

