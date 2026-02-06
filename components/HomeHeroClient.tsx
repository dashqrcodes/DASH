 "use client";

 import { useEffect, useMemo, useRef, useState } from "react";

const images: string[] = [
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1400&q=80",
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

 export default function HomeHeroClient() {
   const [index, setIndex] = useState(0);
   const [muted, setMuted] = useState(true);
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
     const id = window.setInterval(() => {
       setIndex((prev) => (prev + 1) % images.length);
     }, intervalMs);
     return () => window.clearInterval(id);
   }, []);

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
     <>
       <div className="absolute inset-0">
         {slides.map((slide) => (
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_35%,rgba(0,0,0,0.45)_100%)]" />
       </div>

       <audio ref={audioRef} loop muted className="hidden" src={audioSrc} />

       <button
         type="button"
         onClick={() => setMuted((m) => !m)}
         className="fixed bottom-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur shadow-lg transition hover:bg-white/25"
       >
         {muted ? "🔇" : "🔊"}
       </button>
     </>
   );
 }
