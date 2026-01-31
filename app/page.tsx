"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const images: string[] = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1400&q=80",
];

const fadeDuration = 800;
const intervalMs = 2000;
const audioSrc = "https://cdn.pixabay.com/audio/2022/10/03/audio_8e0c6c6b35.mp3";
const initialVolume = 0.15;

export default function HomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [mode, setMode] = useState<"consumer" | "business">("consumer");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const slides = useMemo(
    () =>
      images.map((url, i) => ({
        url,
        active: i === index,
      })),
    [index]
  );

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    router.prefetch("/start");
    router.prefetch("/memorial/accept");
  }, [router]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
    audio.volume = initialVolume;
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = true;
    audio.volume = initialVolume;
    audio.play().catch(() => {
      // Autoplay may be blocked until interaction
    });

    const enableAudio = () => {
      audio.muted = muted;
      audio.volume = initialVolume;
      if (!muted) {
        audio.play().catch(() => {});
      }
      window.removeEventListener("pointerdown", enableAudio);
      window.removeEventListener("keydown", enableAudio);
    };

    window.addEventListener("pointerdown", enableAudio);
    window.addEventListener("keydown", enableAudio);

    return () => {
      window.removeEventListener("pointerdown", enableAudio);
      window.removeEventListener("keydown", enableAudio);
    };
  }, [muted]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background carousel */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.url}
            className={`absolute inset-0 transition-opacity duration-[${fadeDuration}ms] ${
              slide.active ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${slide.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: slide.active ? "scale(1.03)" : "scale(1.0)",
              transition: `opacity ${fadeDuration}ms ease, transform ${intervalMs}ms ease`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/75" />
      </div>

      {/* Audio */}
      <audio
        ref={audioRef}
        loop
        muted
        className="hidden"
        src={audioSrc}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
            DASH Memories
          </p>
          <h1 className="text-[32px] font-semibold tracking-tight sm:text-[40px]">Life. Love. Forever.</h1>
          <p className="text-lg text-white/80">Remember Life</p>
        </div>

        {/* Toggle moved below headline */}
        <div className="mt-8 flex items-center justify-center">
          <div className="relative flex items-center rounded-full bg-white/10 px-1 py-1 ring-1 ring-white/15 backdrop-blur">
            <div
              className={`absolute inset-y-1 w-1/2 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                mode === "business" ? "translate-x-0" : "translate-x-full"
              }`}
            />
            <Link
              href="/start"
              onClick={(e) => {
                e.preventDefault();
                setMode("business");
                setIsTransitioning(true);
                router.push("/start");
              }}
              className={`relative z-10 flex-1 rounded-full px-5 py-2 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                mode === "business" ? "text-gray-900" : "text-white/80 hover:text-white"
              }`}
            >
              Mortuary
            </Link>
            <Link
              href="/memorial/accept"
              onClick={(e) => {
                e.preventDefault();
                setMode("consumer");
                setIsTransitioning(true);
                router.push("/memorial/accept");
              }}
              className={`relative z-10 flex-1 rounded-full px-5 py-2 text-center text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                mode === "consumer" ? "text-gray-900" : "text-white/80 hover:text-white"
              }`}
            >
              Family
            </Link>
          </div>
        </div>

        {/* CTAs removed per request */}
      </div>

      {/* Mute/Unmute */}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="fixed bottom-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur shadow-lg transition hover:bg-white/25"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      {/* Crossfade overlay for page transitions */}
      <div
        className={`pointer-events-none fixed inset-0 z-30 bg-black transition-opacity duration-300 ${
          isTransitioning ? "opacity-80" : "opacity-0"
        }`}
      />
    </main>
  );
}

