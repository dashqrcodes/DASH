"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function SlideshowCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";
  const memorialName = searchParams?.get("name") || "";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const strings =
    currentLang === "es"
      ? {
          addMusic: "+ Música",
          addPhotos: "+ Fotos",
        }
      : {
          addMusic: "+ Music",
          addPhotos: "+ Photos",
        };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      {/* Floating stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, idx) => (
          <span
            key={idx}
            className="absolute h-[2px] w-[2px] rounded-full bg-white/60 animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${10 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 pb-24 pt-10">
        {/* Top Nav */}
        <header className="mb-10 flex items-center justify-between text-sm text-white/80">
          <button
            type="button"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-xl transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-purple-300/60"
            onClick={() => router.back()}
          >
            ←
          </button>
          <div className="flex-1 text-center">
            <p className="text-lg font-semibold text-white">{memorialName}</p>
          </div>
          <div className="h-10 w-10" />
        </header>

        {/* Preview */}
        <div className="flex flex-1 flex-col items-center gap-10">
          <div className="w-full max-w-3xl">
            <div className="relative mx-auto aspect-video w-full overflow-hidden bg-gradient-to-b from-black/70 via-black/65 to-black/80 shadow-[0_18px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-inner shadow-black/40 ring-1 ring-white/15">
                  ▶
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={primaryButtonClass}
                onClick={() => console.log("Add Music")}
              >
                {strings.addMusic}
              </button>
              <button
                type="button"
                className={primaryButtonClass}
                onClick={() => fileInputRef.current?.click()}
              >
                {strings.addPhotos}
              </button>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            console.log("Selected files:", e.target.files);
          }}
        />
      </div>
      <style jsx>{`
        @keyframes float-slow {
          0% {
            transform: translateY(20px);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-40px);
            opacity: 0;
          }
        }
        .animate-float-slow {
          animation-name: float-slow;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </main>
  );
}

