"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function SlideshowCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";
  const memorialName = searchParams?.get("name") || "";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const strings =
    currentLang === "es"
      ? {
          addMusic: "+ Música",
          addPhotos: "+ Fotos",
          uploadLimit: "Límite de carga total 500MB.",
          play: "Reproducir",
          pause: "Pausar",
          empty: "Selecciona fotos para iniciar el playback.",
        }
      : {
          addMusic: "+ Music",
          addPhotos: "+ Photos",
          uploadLimit: "Max total upload 500MB.",
          play: "Play",
          pause: "Pause",
          empty: "Select photos to start playback.",
        };

  useEffect(() => {
    if (!isPlaying || photoUrls.length === 0) return;
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photoUrls.length);
    }, 4000);
    return () => window.clearInterval(id);
  }, [isPlaying, photoUrls.length]);

  useEffect(() => {
    if (currentIndex >= photoUrls.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, photoUrls.length]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const maxBytes = 500 * 1024 * 1024;
    const totalBytes = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > maxBytes) {
      setUploadError(strings.uploadLimit);
      return;
    }
    setUploadError(null);
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    setPhotoUrls(urls);
    setCurrentIndex(0);
  };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      {/* Floating stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 16 }).map((_, idx) => (
          <span
            key={idx}
            className={`star star-${idx + 1} absolute h-[2px] w-[2px] rounded-full bg-white/60 animate-float-slow`}
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
              {photoUrls.length > 0 && (
                <img
                  src={photoUrls[currentIndex]}
                  alt="Slideshow preview"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    isPlaying ? "opacity-100" : "opacity-90"
                  }`}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (photoUrls.length === 0) return;
                    setIsPlaying((prev) => !prev);
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-inner shadow-black/40 ring-1 ring-white/15"
                  aria-label={isPlaying ? strings.pause : strings.play}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
              </div>
              {photoUrls.length === 0 && (
                <div className="absolute inset-x-0 bottom-4 text-center text-xs text-white/70">
                  {strings.empty}
                </div>
              )}
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
            {uploadError && <p className="text-center text-xs text-red-300">{uploadError}</p>}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          aria-label="Upload slideshow photos"
          onChange={(e) => handleFiles(e.target.files)}
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
        .star-1 {
          left: 8%;
          top: 18%;
          animation-delay: 0s;
          animation-duration: 12s;
        }
        .star-2 {
          left: 16%;
          top: 62%;
          animation-delay: 1s;
          animation-duration: 14s;
        }
        .star-3 {
          left: 28%;
          top: 34%;
          animation-delay: 2s;
          animation-duration: 11s;
        }
        .star-4 {
          left: 40%;
          top: 78%;
          animation-delay: 3s;
          animation-duration: 16s;
        }
        .star-5 {
          left: 52%;
          top: 22%;
          animation-delay: 4s;
          animation-duration: 13s;
        }
        .star-6 {
          left: 64%;
          top: 55%;
          animation-delay: 5s;
          animation-duration: 12s;
        }
        .star-7 {
          left: 78%;
          top: 38%;
          animation-delay: 6s;
          animation-duration: 15s;
        }
        .star-8 {
          left: 90%;
          top: 70%;
          animation-delay: 7s;
          animation-duration: 18s;
        }
        .star-9 {
          left: 6%;
          top: 44%;
          animation-delay: 2.5s;
          animation-duration: 17s;
        }
        .star-10 {
          left: 22%;
          top: 12%;
          animation-delay: 1.5s;
          animation-duration: 10s;
        }
        .star-11 {
          left: 36%;
          top: 58%;
          animation-delay: 4.5s;
          animation-duration: 14s;
        }
        .star-12 {
          left: 50%;
          top: 10%;
          animation-delay: 5.5s;
          animation-duration: 12s;
        }
        .star-13 {
          left: 62%;
          top: 80%;
          animation-delay: 6.5s;
          animation-duration: 15s;
        }
        .star-14 {
          left: 74%;
          top: 16%;
          animation-delay: 7.5s;
          animation-duration: 19s;
        }
        .star-15 {
          left: 86%;
          top: 28%;
          animation-delay: 8.5s;
          animation-duration: 13s;
        }
        .star-16 {
          left: 96%;
          top: 46%;
          animation-delay: 9.5s;
          animation-duration: 16s;
        }
      `}</style>
    </main>
  );
}

