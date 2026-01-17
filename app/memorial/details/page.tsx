"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

const fieldLabel = "text-sm font-medium text-gray-100 pl-1";
const inputBase =
  "h-12 w-full rounded-full border border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-white/50 backdrop-blur-lg transition duration-200 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-300/40";

export default function MemorialDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";

  const strings =
    currentLang === "es"
      ? {
          addPhoto: "Agregar foto",
          fullName: "Nombre completo",
          fullNamePlaceholder: "Ingresa el nombre completo",
          sunrise: "Amanecer",
          sunset: "Atardecer",
          datePlaceholder: "Mes dd, aaaa",
          next: "Siguiente",
        }
      : {
          addPhoto: "Add Photo",
          fullName: "Full Name",
          fullNamePlaceholder: "Enter full name",
          sunrise: "Sunrise",
          sunset: "Sunset",
          datePlaceholder: "Month dd, yyyy",
          next: "Next",
        };

  const updateLanguage = (lang: "en" | "es") => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("lang", lang);
    router.replace(`/memorial/details?${params.toString()}`);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#0b0b0d] via-[#0c0d13] to-[#0b0b0d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-10 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-4 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-28 pt-10">
        <div className="space-y-8">
          {/* Photo upload placeholder */}
          <div className="-mx-6 mt-2 overflow-hidden rounded-b-[32px] rounded-t-[44px]">
            <label
              htmlFor="memorial-photo"
              className="group relative flex h-[45vh] min-h-[280px] w-full cursor-pointer items-center justify-center overflow-hidden bg-white/5"
            >
              {photoUrl ? (
                <div className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="Uploaded memorial"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs font-semibold text-white/75 transition group-hover:text-white">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white text-lg font-semibold">
                    +
                  </div>
                  <span>{strings.addPhoto}</span>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/45 to-black/80" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05),_transparent_55%)]" />
              <input
                id="memorial-photo"
                name="memorial-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className={fieldLabel}>{strings.fullName}</label>
            <input
              type="text"
              placeholder={strings.fullNamePlaceholder}
              className={inputBase}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className={fieldLabel}>{strings.sunrise}</label>
              <input
                type="text"
                placeholder={strings.datePlaceholder}
                className={inputBase}
              />
            </div>
            <div className="space-y-2">
              <label className={fieldLabel}>{strings.sunset}</label>
              <input
                type="text"
                placeholder={strings.datePlaceholder}
                className={inputBase}
              />
            </div>
          </div>

          {/* Language toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="flex w-full rounded-full bg-white/5 p-1 ring-1 ring-white/10 backdrop-blur-xl shadow-inner shadow-black/40">
              {(["en", "es"] as const).map((lng) => {
              const active = currentLang === lng;
                return (
                  <button
                    key={lng}
                    type="button"
                    onClick={() => updateLanguage(lng)}
                    className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 ${
                      active
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    {lng === "en" ? "English" : "Español"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-[#0b0b0d] via-[#0b0b0d]/90 to-transparent px-6 pb-6 pt-6">
          <button
            type="button"
            onClick={() => router.push(`/memorial/preview?lang=${currentLang}`)}
            className={primaryButtonClass}
          >
            {strings.next}
          </button>
        </div>
      </div>
    </main>
  );
}

