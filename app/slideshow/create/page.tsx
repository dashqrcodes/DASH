"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCloudinaryTransformUrl } from "@/lib/utils/cloudinary";
import { convertToJpeg720p } from "@/lib/utils/clientImage";
import { musicTracks } from "@/lib/data/musicTracks";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function SlideshowCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams?.get("lang") === "es" ? "es" : "en";
  const memorialName = searchParams?.get("name") || "";
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [draftSlug, setDraftSlug] = useState("");
  const [photoItems, setPhotoItems] = useState<
    { id: string; localUrl: string; remoteUrl?: string; status: "local" | "uploading" | "ready" | "error" }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const lastIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideshowTransform = "f_auto,q_auto,c_fill,g_faces,ar_16:9,w_1280,h_720";
  const selectedTrack = useMemo(
    () => musicTracks.find((track) => track.id === selectedTrackId) || null,
    [selectedTrackId]
  );
  const playbackUrls = useMemo(
    () =>
      photoItems.map((item) =>
        item.remoteUrl
          ? buildCloudinaryTransformUrl(item.remoteUrl, slideshowTransform)
          : item.localUrl
      ),
    [photoItems, slideshowTransform]
  );
  const readyUrls = useMemo(
    () => photoItems.filter((item) => item.remoteUrl).map((item) => item.remoteUrl as string),
    [photoItems]
  );

  const strings =
    currentLang === "es"
      ? {
          addMusic: "+ Música",
          addPhotos: "+ Fotos",
          uploadLimit: "Límite de carga total 500MB.",
          maxPhotos: "Máximo 300 fotos por ahora.",
          play: "Reproducir",
          pause: "Pausar",
          empty: "Selecciona fotos para iniciar el playback.",
        }
      : {
          addMusic: "+ Music",
          addPhotos: "+ Photos",
          uploadLimit: "Max total upload 500MB.",
          maxPhotos: "Maximum 300 photos for now.",
          play: "Play",
          pause: "Pause",
          empty: "Select photos to start playback.",
        };

  useEffect(() => {
    if (!isPlaying || playbackUrls.length === 0) return;
    const id = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % playbackUrls.length);
    }, 3500);
    return () => window.clearInterval(id);
  }, [isPlaying, playbackUrls.length]);

  useEffect(() => {
    if (currentIndex >= playbackUrls.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, playbackUrls.length]);

  useEffect(() => {
    const lastIndex = lastIndexRef.current;
    if (playbackUrls.length > 0 && lastIndex !== currentIndex) {
      setPrevIndex(lastIndex);
    }
    lastIndexRef.current = currentIndex;
  }, [currentIndex, playbackUrls.length]);

  useEffect(() => {
    const fromQuery = searchParams?.get("slug") || "";
    let nextSlug = fromQuery;
    if (!nextSlug) {
      try {
        nextSlug = window.sessionStorage.getItem("memorial_slug") || "";
      } catch {}
    }
    if (!nextSlug) {
      nextSlug = `slideshow-${Date.now()}`;
      try {
        window.sessionStorage.setItem("memorial_slug", nextSlug);
      } catch {}
    }
    setDraftSlug(nextSlug);
  }, [searchParams]);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem("slideshow_photo_urls");
      if (!stored) return;
      const parsed = JSON.parse(stored) as string[];
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setPhotoItems(
        parsed.map((url, index) => ({
          id: `${index}-${url}`,
          localUrl: "",
          remoteUrl: url,
          status: "ready" as const,
        }))
      );
    } catch {}
  }, []);

  useEffect(() => {
    if (playbackUrls.length < 2) return;
    const nextIndex = (currentIndex + 1) % playbackUrls.length;
    const nextUrl = playbackUrls[nextIndex];
    if (!nextUrl) return;
    const img = new Image();
    img.src = nextUrl;
  }, [currentIndex, playbackUrls]);

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem("slideshow_music_track");
      if (!stored) return;
      const parsed = JSON.parse(stored) as { id?: string } | null;
      if (parsed?.id) setSelectedTrackId(parsed.id);
    } catch {}
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!selectedTrack) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    if (audio.src !== selectedTrack.audioUrl) {
      audio.src = selectedTrack.audioUrl;
      audio.currentTime = 0;
    }
    audio.loop = true;
    if (isPlaying) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [selectedTrack, isPlaying]);

  const uploadToCloudinary = async (file: File, index: number, id: string, localUrl: string) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", draftSlug || "slideshow");
      formData.append("index", String(index));

      const response = await fetch("/api/upload-slideshow-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Upload failed");
      }

      const data = await response.json();
      const remoteUrl = data?.photoUrl as string | undefined;
      if (!remoteUrl) throw new Error("Upload failed");

      try {
        URL.revokeObjectURL(localUrl);
      } catch {}

      setPhotoItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, remoteUrl, status: "ready" } : item
        )
      );

      try {
        const existing = window.sessionStorage.getItem("slideshow_photo_urls");
        const list = existing ? (JSON.parse(existing) as string[]) : [];
        window.sessionStorage.setItem(
          "slideshow_photo_urls",
          JSON.stringify([...list, remoteUrl])
        );
      } catch {}
    } catch (error: any) {
      setPhotoItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: "error" } : item
        )
      );
      setUploadError(error?.message || "Upload failed.");
    } finally {
      setUploadingCount((count) => Math.max(0, count - 1));
    }
  };

  const processAndUpload = async (file: File, index: number, id: string, localUrl: string) => {
    try {
      const processedFile = await convertToJpeg720p(file);
      await uploadToCloudinary(processedFile, index, id, localUrl);
    } catch (error: any) {
      setPhotoItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "error" } : item))
      );
      setUploadError(error?.message || "Upload failed.");
      setUploadingCount((count) => Math.max(0, count - 1));
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const maxPhotos = 300;
    if (files.length > maxPhotos) {
      setUploadError(strings.maxPhotos);
      return;
    }
    const maxBytes = 500 * 1024 * 1024;
    const totalBytes = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > maxBytes) {
      setUploadError(strings.uploadLimit);
      return;
    }
    setUploadError(null);
    const fileArray = Array.from(files);
    const newItems = fileArray.map((file, index) => {
      const localUrl = URL.createObjectURL(file);
      return {
        id: `${Date.now()}-${index}-${file.name}`,
        localUrl,
        status: "uploading" as const,
      };
    });
    setPhotoItems((prev) => [...prev, ...newItems]);
    setCurrentIndex(0);
    setUploadingCount((count) => count + newItems.length);
    newItems.forEach((item, index) => {
      void processAndUpload(fileArray[index], index, item.id, item.localUrl);
    });
  };

  const handleBack = () => {
    const qs = searchParams?.toString() || "";
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(qs ? `/memorial/order/success?${qs}` : "/memorial/order/success");
  };

  const handleContinue = () => {
    if (readyUrls.length === 0) {
      setUploadError(strings.empty);
      return;
    }
    try {
      window.localStorage.setItem(
        "slideshowMedia",
        JSON.stringify(readyUrls.map((url) => ({ type: "photo" as const, url })))
      );
    } catch {}
    const qs = searchParams?.toString() || "";
    router.push(qs ? `/_dashmemories/slideshow?${qs}` : "/_dashmemories/slideshow");
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
            onClick={handleBack}
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
              {playbackUrls.length > 0 && prevIndex !== null && prevIndex !== currentIndex && (
                <>
                  <img
                    src={playbackUrls[prevIndex]}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60 animate-fade-out"
                    aria-hidden="true"
                  />
                  <img
                    src={playbackUrls[prevIndex]}
                    alt="Slideshow preview"
                    className="absolute inset-0 h-full w-full object-contain animate-fade-out"
                    aria-hidden="true"
                  />
                </>
              )}
              {playbackUrls.length > 0 && (
                <>
                  <img
                    src={playbackUrls[currentIndex]}
                    alt=""
                    className={`absolute inset-0 h-full w-full object-cover scale-110 blur-2xl opacity-60 animate-fade-in ${
                      isPlaying ? "opacity-100" : "opacity-90"
                    }`}
                    aria-hidden="true"
                  />
                  <img
                    src={playbackUrls[currentIndex]}
                    alt="Slideshow preview"
                    className={`absolute inset-0 h-full w-full object-contain animate-fade-in ${
                      isPlaying ? "opacity-100" : "opacity-90"
                    }`}
                    fetchPriority="high"
                  />
                </>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (playbackUrls.length === 0) return;
                    setIsPlaying((prev) => !prev);
                  }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white shadow-inner shadow-black/40 ring-1 ring-white/15"
                  aria-label={isPlaying ? strings.pause : strings.play}
                >
                  {isPlaying ? "❚❚" : "▶"}
                </button>
              </div>
              {playbackUrls.length === 0 && (
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
                onClick={() => setShowMusicPicker(true)}
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
            {uploadingCount > 0 && (
              <p className="text-center text-xs text-white/70">
                Uploading {uploadingCount} photo{uploadingCount === 1 ? "" : "s"}…
              </p>
            )}
            {uploadError && <p className="text-center text-xs text-red-300">{uploadError}</p>}
          </div>
        </div>

        <div className="mt-12 flex w-full max-w-md justify-center">
          <button
            type="button"
            className={primaryButtonClass}
            onClick={handleContinue}
            disabled={readyUrls.length === 0}
          >
            Continue to Slideshow
          </button>
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
      <audio ref={audioRef} preload="auto" />
      {showMusicPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-6">
          <div className="w-full max-w-lg rounded-3xl bg-[#111117] p-6 shadow-2xl ring-1 ring-white/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Choose music</h2>
                <p className="text-xs text-white/60">
                  Royalty-free tracks for slideshow playback
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
                onClick={() => setShowMusicPicker(false)}
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              {musicTracks.map((track) => {
                const isSelected = track.id === selectedTrackId;
                return (
                  <button
                    key={track.id}
                    type="button"
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-indigo-400/80 bg-indigo-500/15"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                    onClick={() => {
                      setSelectedTrackId(track.id);
                      try {
                        window.sessionStorage.setItem(
                          "slideshow_music_track",
                          JSON.stringify({ id: track.id })
                        );
                      } catch {}
                      try {
                        window.localStorage.setItem(
                          "slideshow_music_track",
                          JSON.stringify({ id: track.id })
                        );
                      } catch {}
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{track.title}</div>
                        <div className="text-xs text-white/60">{track.artist}</div>
                      </div>
                      <div className="text-xs text-white/50">{track.duration}</div>
                    </div>
                    <div className="mt-2 text-[11px] text-white/50">{track.licenseName}</div>
                  </button>
                );
              })}
            </div>
            {selectedTrack && (
              <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-xs text-white/70">
                <div>
                  Selected:{" "}
                  <span className="font-semibold text-white">{selectedTrack.title}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[11px] text-white/60">
                  <a
                    className="underline decoration-dotted"
                    href={selectedTrack.licenseUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    License
                  </a>
                  <a
                    className="underline decoration-dotted"
                    href={selectedTrack.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Source
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .animate-fade-in {
          animation: fade-in 700ms ease;
        }
        .animate-fade-out {
          animation: fade-out 700ms ease;
        }
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

