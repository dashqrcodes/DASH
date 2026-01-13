"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function MemorialProfilePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<"en" | "es">("en");
  const [fullName, setFullName] = useState("");
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

  const strings =
    language === "es"
      ? {
          title: "Perfil del ser querido",
          subtitle: "Revisa los detalles antes de continuar.",
          addPhoto: "Agregar foto",
          fullNameLabel: "Nombre completo",
          fullNamePlaceholder: "Ingresa el nombre completo",
          sunrise: "Amanecer",
          sunset: "Atardecer",
          datePlaceholder: "Mes dd, aaaa",
          cta: "Continuar",
        }
      : {
          title: "Loved One Profile",
          subtitle: "Begin by reviewing the details for your loved one before continuing.",
          addPhoto: "Add Photo",
          fullNameLabel: "Full Name",
          fullNamePlaceholder: "Enter full name",
          sunrise: "Sunrise",
          sunset: "Sunset",
          datePlaceholder: "Month dd, yyyy",
          cta: "Continue",
        };

  return (
    <main
      className={`relative min-h-screen bg-black text-white transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%)]" />
      </div>

      <button
        type="button"
        aria-label="Back"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
        onClick={() => router.back()}
      >
        ←
      </button>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 pb-28 pt-14 text-center">
        {/* Language toggle */}
        <div className="mb-10 flex justify-center">
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
            className="relative flex h-9 items-center rounded-full bg-[#1C1C1E] px-1 text-xs font-semibold text-gray-300 shadow-inner shadow-black/40"
          >
            <span
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)] transition-transform duration-200 ${
                language === "es" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <span className={`z-10 w-20 text-center ${language === "en" ? "text-white" : "text-gray-400"}`}>
              English
            </span>
            <span className={`z-10 w-20 text-center ${language === "es" ? "text-white" : "text-gray-400"}`}>
              Español
            </span>
          </button>
        </div>

        <div className="flex-1 w-full max-w-[420px] space-y-8">
          <div className="flex flex-col items-center space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                const targetSlug = slug || slugify(fullName);
                if (!file) return;
                if (!targetSlug) {
                  setError(language === "es" ? "Agrega un nombre antes de subir la foto." : "Add the name before uploading a photo.");
                  return;
                }

                // Local preview immediately
                const localUrl = URL.createObjectURL(file);
                setPhotoUrl(localUrl);
                setError(null);
                setUploadingPhoto(true);

                const formData = new FormData();
                formData.append("file", file);
                formData.append("slug", targetSlug);

                try {
                  const res = await fetch("/api/upload-photo", {
                    method: "POST",
                    body: formData,
                  });

                  if (!res.ok) {
                    throw new Error("Upload failed");
                  }

                  const json = await res.json();
                  if (json?.photoUrl) {
                    setPhotoUrl(json.photoUrl);
                    setSlug(targetSlug);
                  }
                } catch (uploadError) {
                  setError(language === "es" ? "No se pudo subir la foto. Intenta de nuevo." : "Could not upload the photo. Please try again.");
                } finally {
                  setUploadingPhoto(false);
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-36 w-36 items-center justify-center rounded-full bg-[#111111] ring-2 ring-purple-500/40 shadow-[0_0_24px_rgba(109,40,217,0.28)] relative overflow-hidden transition hover:ring-purple-400"
              style={
                photoUrl
                  ? {
                      backgroundImage: `url(${photoUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >
              {!photoUrl && (
                <div className="flex flex-col items-center text-gray-400 pointer-events-none">
                  <span className="text-xs">{strings.addPhoto}</span>
                </div>
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
                  {language === "es" ? "Subiendo..." : "Uploading..."}
                </div>
              )}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{strings.fullNameLabel}</p>
            <input
              type="text"
              placeholder={strings.fullNamePlaceholder}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              className="h-14 w-full rounded-xl border border-white/10 bg-[#111111] px-4 text-base text-white placeholder:text-gray-500 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{strings.sunrise}</p>
              <input
                type="text"
                placeholder={strings.datePlaceholder}
                value={sunrise}
                onChange={(e) => setSunrise(e.target.value)}
                className="h-14 w-full rounded-xl border border-white/10 bg-[#111111] px-3 text-base text-white placeholder:text-gray-500 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{strings.sunset}</p>
              <input
                type="text"
                placeholder={strings.datePlaceholder}
                value={sunset}
                onChange={(e) => setSunset(e.target.value)}
                className="h-14 w-full rounded-xl border border-white/10 bg-[#111111] px-3 text-base text-white placeholder:text-gray-500 text-center shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
              />
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-6 pt-6">
          <div className="mx-auto w-full max-w-md">
                {error && <p className="mb-3 text-center text-sm text-red-300">{error}</p>}
            <button
              type="button"
                  onClick={() => {
                    if (!fullName || !sunrise || !sunset) {
                      setError(language === "es" ? "Completa nombre y fechas antes de continuar." : "Please add name and dates before continuing.");
                      return;
                    }
                    const computedSlug = slug || slugify(fullName);
                    if (!computedSlug) {
                      setError(language === "es" ? "Agrega un nombre válido para generar el enlace." : "Add a valid name to generate the link.");
                      return;
                    }
                    setError(null);
                    router.push(
                      `/memorial/preview?name=${encodeURIComponent(fullName)}&birth=${encodeURIComponent(
                        sunrise
                      )}&death=${encodeURIComponent(sunset)}&slug=${encodeURIComponent(computedSlug)}${
                        photoUrl ? `&photo=${encodeURIComponent(photoUrl)}` : ""
                      }`
                    );
                  }}
              className={primaryButtonClass}
            >
              {strings.cta}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

