"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

const fieldLabel = "text-sm font-medium text-gray-100 pl-1";
const inputBase =
  "h-12 w-full rounded-full border border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-white/50 backdrop-blur-lg transition duration-200 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-300/40";

const toTitleCase = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDateInput = (value: string) => value;

const formatDateOnBlur = (value: string) => {
  const cleaned = value.replace(/[^a-zA-Z0-9\s,]/g, " ");
  const parts = cleaned.split(/[\s,]+/).filter(Boolean);
  if (!parts.length) return "";

  const monthRaw = parts[0] || "";
  const dayRaw = parts[1] || "";
  const yearRaw = parts[2] || "";

  const month = monthRaw
    ? monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1).toLowerCase()
    : "";
  const day = dayRaw.replace(/\D/g, "").slice(0, 2);
  const year = yearRaw.replace(/\D/g, "").slice(0, 4);

  let result = month;
  if (day) {
    result += ` ${day}`;
  }
  if (year) {
    result += `, ${year}`;
  }
  return result;
};

const monthOptionsEn = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const monthOptionsEs = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const parseDateParts = (value: string) => {
  const match = value.match(/^([A-Za-zÁÉÍÓÚÑáéíóúñ]+)\s+(\d{1,2})(?:,\s*|\s+)(\d{4})$/);
  if (!match) return { month: "", day: "", year: "" };
  return { month: match[1], day: match[2], year: match[3] };
};

export default function MemorialDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [sunrise, setSunrise] = useState("");
  const [sunset, setSunset] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const paramsName = searchParams?.get("name") || "";
    const paramsBirth = searchParams?.get("birth") || "";
    const paramsDeath = searchParams?.get("death") || "";
    const paramsPhoto = searchParams?.get("photo") || "";

    if (paramsName) {
      setFullName(paramsName);
      try {
        window.sessionStorage.setItem("memorial_full_name", paramsName);
      } catch {}
    }
    if (paramsBirth) {
      setSunrise(paramsBirth);
      try {
        window.sessionStorage.setItem("memorial_birth_date", paramsBirth);
      } catch {}
    }
    if (paramsDeath) {
      setSunset(paramsDeath);
      try {
        window.sessionStorage.setItem("memorial_death_date", paramsDeath);
      } catch {}
    }
    if (paramsPhoto) {
      setPhotoUrl(paramsPhoto);
      try {
        window.sessionStorage.setItem("memorial_photo_url", paramsPhoto);
      } catch {}
    }

    try {
      const storedName = window.sessionStorage.getItem("memorial_full_name") || "";
      const storedBirth = window.sessionStorage.getItem("memorial_birth_date") || "";
      const storedDeath = window.sessionStorage.getItem("memorial_death_date") || "";
      const storedPhoto = window.sessionStorage.getItem("memorial_photo_url") || "";
      if (!fullName && storedName) setFullName(storedName);
      if (!sunrise && storedBirth) {
        setSunrise(storedBirth);
      }
      if (!sunset && storedDeath) {
        setSunset(storedDeath);
      }
      if (!photoUrl && storedPhoto) setPhotoUrl(storedPhoto);
    } catch {}
  }, [searchParams]);

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
          uploading: "Convirtiendo foto...",
          uploadFailed: "No se pudo subir la foto. Intenta de nuevo.",
          missingFields: "Completa nombre y fechas antes de continuar.",
        }
      : {
          addPhoto: "Add Photo",
          fullName: "Full Name",
          fullNamePlaceholder: "Enter full name",
          sunrise: "Sunrise",
          sunset: "Sunset",
          datePlaceholder: "Month dd, yyyy",
          next: "Next",
          uploading: "Converting photo...",
          uploadFailed: "Could not upload the photo. Please try again.",
          missingFields: "Please add name and dates before continuing.",
        };

  const updateLanguage = (lang: "en" | "es") => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("lang", lang);
    router.replace(`/memorial/profile?${params.toString()}`);
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    const isHeic =
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      fileExt === "heic" ||
      fileExt === "heif";

    setPhotoError(null);

    if (!isHeic) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      try {
        window.sessionStorage.setItem("memorial_photo_url", url);
      } catch {}
      return;
    }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", `temp-${Date.now()}`);

    fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          let message = strings.uploadFailed;
          if (text) {
            try {
              const data = JSON.parse(text);
              message = data?.error || message;
            } catch {
              message = `Upload failed (${res.status}).`;
            }
          } else {
            message = `Upload failed (${res.status}).`;
          }
          throw new Error(message);
        }
        return res.json();
      })
      .then((json) => {
        if (json?.photoUrl) {
          setPhotoUrl(json.photoUrl);
          try {
            window.sessionStorage.setItem("memorial_photo_url", json.photoUrl);
          } catch {}
        }
      })
      .catch((error) => {
        setPhotoError(error?.message || strings.uploadFailed);
      })
      .finally(() => {
        setUploadingPhoto(false);
      });
  };

  return (
    <main
      className={`relative min-h-screen bg-[#0b0b0d] text-white transition-all duration-300 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-[56vh] min-h-[340px] overflow-hidden">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            className="h-full w-full object-cover"
            aria-hidden="true"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/85" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(0,0,0,0.85)]" />
        {!photoUrl && (
          <div className="pointer-events-none absolute inset-x-0 bottom-10 flex items-center justify-center">
            <div className="rounded-full bg-black/55 px-4 py-2 text-xs font-semibold tracking-[0.2em] text-white/80">
              {uploadingPhoto
                ? strings.uploading
                : currentLang === "es"
                  ? "Toca para agregar foto"
                  : "Tap to add photo"}
            </div>
          </div>
        )}
        {photoError && (
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex items-center justify-center">
            <div className="rounded-full bg-red-500/80 px-3 py-1 text-[11px] font-semibold text-white">
              {photoError}
            </div>
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 left-10 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-4 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[58vh] overflow-hidden">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={`star-${index}`}
            className={`star star-${index + 1} absolute h-[2px] w-[2px] rounded-full bg-white/70 animate-float-slow`}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-28 pt-[56vh]">
        <label htmlFor="memorial-photo" className="absolute inset-x-0 top-0 h-[56vh] min-h-[340px]">
          <input
            id="memorial-photo"
            name="memorial-photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
            aria-label="Upload memorial photo"
          />
        </label>
        <div className="space-y-8">

          {/* Name */}
          <div className="space-y-2">
            <label className={fieldLabel}>{strings.fullName}</label>
            <input
              type="text"
              placeholder={strings.fullNamePlaceholder}
              value={fullName}
              onChange={(event) => {
                const value = event.target.value;
                setFullName(value);
                setFormError(null);
                const nextSlug = slugify(value);
                try {
                  window.sessionStorage.setItem("memorial_slug", nextSlug);
                } catch {}
                try {
                  window.sessionStorage.setItem("memorial_full_name", value);
                } catch {}
              }}
              onBlur={() => {
                const formatted = toTitleCase(fullName);
                setFullName(formatted);
                try {
                  window.sessionStorage.setItem("memorial_full_name", formatted);
                } catch {}
              }}
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
                list="month-options"
                value={sunrise}
                onChange={(event) => {
                  const value = formatDateInput(event.target.value);
                  setSunrise(value);
                  setFormError(null);
                  try {
                    window.sessionStorage.setItem("memorial_birth_date", value);
                  } catch {}
                }}
                onBlur={() => {
                  const formatted = formatDateOnBlur(sunrise);
                  setSunrise(formatted);
                  try {
                    window.sessionStorage.setItem("memorial_birth_date", formatted);
                  } catch {}
                }}
                className={inputBase}
              />
            </div>
            <div className="space-y-2">
              <label className={fieldLabel}>{strings.sunset}</label>
              <input
                type="text"
                placeholder={strings.datePlaceholder}
                list="month-options"
                value={sunset}
                onChange={(event) => {
                  const value = formatDateInput(event.target.value);
                  setSunset(value);
                  setFormError(null);
                  try {
                    window.sessionStorage.setItem("memorial_death_date", value);
                  } catch {}
                }}
                onBlur={() => {
                  const formatted = formatDateOnBlur(sunset);
                  setSunset(formatted);
                  try {
                    window.sessionStorage.setItem("memorial_death_date", formatted);
                  } catch {}
                }}
                className={inputBase}
              />
            </div>
          </div>
          <datalist id="month-options">
            {(currentLang === "es" ? monthOptionsEs : monthOptionsEn).map((month) => (
              <option key={month} value={month} />
            ))}
          </datalist>

          {/* Language toggle */}
          <div className="pt-2 flex items-center justify-center">
            <div className="relative flex w-full rounded-full bg-white/5 p-1 ring-1 ring-white/10 backdrop-blur-xl shadow-inner shadow-black/40">
              <span
                className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  currentLang === "es" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={() => updateLanguage("en")}
                className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  currentLang === "en" ? "text-gray-900" : "text-white/75 hover:text-white"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => updateLanguage("es")}
                className={`relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  currentLang === "es" ? "text-gray-900" : "text-white/75 hover:text-white"
                }`}
              >
                Español
              </button>
            </div>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-6 pb-6 pt-6">
          {formError && <p className="mb-3 text-center text-sm text-red-300">{formError}</p>}
          <button
            type="button"
            onClick={() => {
              if (!fullName || !sunrise || !sunset) {
                setFormError(strings.missingFields);
                return;
              }
              const computedSlug = slugify(fullName);
              router.push(
                `/memorial/card-front?lang=${currentLang}${
                  fullName ? `&name=${encodeURIComponent(fullName)}` : ""
                }${sunrise ? `&birth=${encodeURIComponent(sunrise)}` : ""}${
                  sunset ? `&death=${encodeURIComponent(sunset)}` : ""
                }${computedSlug ? `&slug=${encodeURIComponent(computedSlug)}` : ""}${
                  photoUrl ? `&photo=${encodeURIComponent(photoUrl)}` : ""
                }`
              );
            }}
            className={primaryButtonClass}
          >
            {strings.next}
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes float-slow {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          80% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-60px);
            opacity: 0;
          }
        }
        .animate-float-slow {
          animation-name: float-slow;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .star-1 {
          left: 10%;
          top: 15%;
          animation-delay: 0s;
          animation-duration: 12s;
        }
        .star-2 {
          left: 22%;
          top: 65%;
          animation-delay: 1s;
          animation-duration: 14s;
        }
        .star-3 {
          left: 35%;
          top: 35%;
          animation-delay: 2s;
          animation-duration: 11s;
        }
        .star-4 {
          left: 48%;
          top: 78%;
          animation-delay: 3s;
          animation-duration: 16s;
        }
        .star-5 {
          left: 62%;
          top: 25%;
          animation-delay: 4s;
          animation-duration: 13s;
        }
        .star-6 {
          left: 74%;
          top: 55%;
          animation-delay: 5s;
          animation-duration: 12s;
        }
        .star-7 {
          left: 86%;
          top: 40%;
          animation-delay: 6s;
          animation-duration: 15s;
        }
        .star-8 {
          left: 18%;
          top: 85%;
          animation-delay: 2.5s;
          animation-duration: 18s;
        }
        .star-9 {
          left: 55%;
          top: 12%;
          animation-delay: 1.5s;
          animation-duration: 10s;
        }
        .star-10 {
          left: 90%;
          top: 70%;
          animation-delay: 3.5s;
          animation-duration: 17s;
        }
        .star-11 {
          left: 6%;
          top: 45%;
          animation-delay: 4.5s;
          animation-duration: 14s;
        }
        .star-12 {
          left: 30%;
          top: 10%;
          animation-delay: 5.5s;
          animation-duration: 12s;
        }
        .star-13 {
          left: 44%;
          top: 58%;
          animation-delay: 6.5s;
          animation-duration: 15s;
        }
        .star-14 {
          left: 68%;
          top: 82%;
          animation-delay: 7.5s;
          animation-duration: 19s;
        }
        .star-15 {
          left: 80%;
          top: 18%;
          animation-delay: 8.5s;
          animation-duration: 13s;
        }
        .star-16 {
          left: 96%;
          top: 30%;
          animation-delay: 9.5s;
          animation-duration: 16s;
        }
      `}</style>
    </main>
  );
}

