"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCloudinaryTransformUrl } from "@/lib/utils/cloudinary";
import { convertToJpeg720p } from "@/lib/utils/clientImage";
import { musicTracks } from "@/lib/data/musicTracks";
import { resolveLang } from "@/lib/utils/lang";

const primaryButtonClass =
  "h-12 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-300/60";

export default function SlideshowCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = resolveLang(searchParams);
  const [memorialName, setMemorialName] = useState(searchParams?.get("name") || "");
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
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const lastIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const slideshowTransform = "f_auto,q_auto,c_fill,g_faces,ar_16:9,w_1280,h_720";
  const selectedTracks = useMemo(() => {
    const map = new Map(musicTracks.map((track) => [track.id, track]));
    return selectedTrackIds.map((id) => map.get(id)).filter(Boolean) as typeof musicTracks;
  }, [selectedTrackIds]);
  const currentTrack = selectedTracks[currentTrackIndex] || null;
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
          musicAdded: "Música añadida",
          addPhotos: "+ Fotos",
          backToSlideshow: "Volver al slideshow",
          uploadLimit: "Límite de carga total 500MB.",
          maxPhotos: "Máximo 300 fotos por ahora.",
          play: "Reproducir",
          pause: "Pausar",
          empty: "Selecciona fotos para iniciar el playback.",
        }
      : {
          addMusic: "+ Music",
          musicAdded: "Music added",
          addPhotos: "+ Photos",
          backToSlideshow: "Back to slideshow",
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
    const fromQuery = searchParams?.get("name") || "";
    if (fromQuery) {
      setMemorialName(fromQuery);
      return;
    }
    try {
      const stored =
        window.sessionStorage.getItem("memorial_full_name") ||
        window.localStorage.getItem("memorial_full_name") ||
        "";
      if (stored) setMemorialName(stored);
    } catch {}
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
      const stored =
        window.sessionStorage.getItem("slideshow_music_tracks") ||
        window.localStorage.getItem("slideshow_music_tracks");
      if (!stored) {
        const legacy =
          window.sessionStorage.getItem("slideshow_music_track") ||
          window.localStorage.getItem("slideshow_music_track");
        if (!legacy) return;
        const parsedLegacy = JSON.parse(legacy) as { id?: string } | null;
        if (parsedLegacy?.id) setSelectedTrackIds([parsedLegacy.id]);
        return;
      }
      const parsed = JSON.parse(stored) as { ids?: string[] } | null;
      if (Array.isArray(parsed?.ids)) setSelectedTrackIds(parsed.ids);
    } catch {}
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) {
      audio.pause();
      audio.removeAttribute("src");
      return;
    }
    if (audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.currentTime = 0;
    }
    audio.loop = selectedTracks.length <= 1;
    if (isPlaying) {
      void audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, selectedTracks.length]);

  useEffect(() => {
    if (currentTrackIndex >= selectedTracks.length) {
      setCurrentTrackIndex(0);
    }
  }, [currentTrackIndex, selectedTracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || selectedTracks.length <= 1) return;
    const handleEnded = () => {
      setCurrentTrackIndex((prev) => (prev + 1) % selectedTracks.length);
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [selectedTracks.length]);

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

  const handleRemovePhoto = (id: string) => {
    setPhotoItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed?.localUrl?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(removed.localUrl);
        } catch {}
      }
      if (removed?.remoteUrl) {
        try {
          const existing = window.sessionStorage.getItem("slideshow_photo_urls");
          const list = existing ? (JSON.parse(existing) as string[]) : [];
          window.sessionStorage.setItem(
            "slideshow_photo_urls",
            JSON.stringify(list.filter((url) => url !== removed.remoteUrl))
          );
        } catch {}
      }
      if (removed?.status === "uploading") {
        setUploadingCount((count) => Math.max(0, count - 1));
      }
      setCurrentIndex((index) => {
        const maxIndex = Math.max(0, nextItems.length - 1);
        return Math.min(index, maxIndex);
      });
      return nextItems;
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

  const pushWithFallback = (target: string) => {
    if (typeof window !== "undefined") {
      const current = `${window.location.pathname}${window.location.search}`;
      if (current === target) return;
      window.location.assign(target);
      return;
    }
    router.push(target);
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
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (draftSlug) params.set("slug", draftSlug);
    const qs = params.toString();
    const heavenTarget = draftSlug ? `/heaven/${encodeURIComponent(draftSlug)}` : "";
    const target = heavenTarget || (qs ? `/slideshow/view?${qs}` : "/slideshow/view");
    pushWithFallback(target);
  };

  return (
    <main className="relative min-h-screen bg-[#0b0b0d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 left-6 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/25 via-purple-500/20 to-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-6 h-56 w-56 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-400/10 blur-3xl" />
      </div>

      <div className="fixed inset-x-0 top-0 z-30 bg-[#0b0b0d]/95 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-transparent" />
        <div className="relative mx-auto flex h-[58svh] w-full max-w-4xl flex-col px-6 pb-4 pt-10">
          {/* Top Nav */}
          <header className="mb-6 flex items-center justify-between text-sm text-white/80">
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
          <div className="flex flex-1 flex-col items-center gap-6">
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

            <div className="w-full max-w-md">
              <div className="rounded-2xl bg-black/70 p-3 ring-1 ring-white/10 backdrop-blur">
                <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={primaryButtonClass}
                  onClick={() => setShowMusicPicker(true)}
                >
                  {selectedTrackIds.length > 0 ? `${strings.musicAdded} ✓` : strings.addMusic}
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
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex w-full max-w-4xl flex-col px-6 pb-24 pt-[60svh]">
        <div className="w-full max-w-md space-y-3">
          {uploadingCount > 0 && (
            <p className="text-center text-xs text-white/70">
              Uploading {uploadingCount} photo{uploadingCount === 1 ? "" : "s"}…
            </p>
          )}
          {uploadError && <p className="text-center text-xs text-red-300">{uploadError}</p>}
          {photoItems.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {photoItems.map((item) => (
                <div
                  key={item.id}
                  className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-white/10"
                >
                  <img
                    src={item.remoteUrl || item.localUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(item.id)}
                    className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white ring-1 ring-white/30 transition hover:bg-black/80"
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4">
          <div className="flex h-[90svh] w-full max-w-lg flex-col rounded-3xl bg-[#111117] shadow-2xl ring-1 ring-white/10">
            <div className="flex items-start justify-between gap-3 px-5 pt-5">
              <div>
                <h2 className="text-lg font-semibold text-white">Choose music</h2>
                <p className="text-xs text-white/60">
                  Tap to add multiple tracks to the playlist
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70"
                onClick={() => setShowMusicPicker(false)}
              >
                Back
              </button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-5 pt-4">
              {musicTracks.map((track) => {
                const isSelected = selectedTrackIds.includes(track.id);
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
                      setSelectedTrackIds((prev) => {
                        const next = prev.includes(track.id)
                          ? prev.filter((id) => id !== track.id)
                          : [...prev, track.id];
                        setCurrentTrackIndex((index) =>
                          next.length === 0 ? 0 : Math.min(index, next.length - 1)
                        );
                        try {
                          window.sessionStorage.setItem(
                            "slideshow_music_tracks",
                            JSON.stringify({ ids: next })
                          );
                        } catch {}
                        try {
                          window.localStorage.setItem(
                            "slideshow_music_tracks",
                            JSON.stringify({ ids: next })
                          );
                        } catch {}
                        return next;
                      });
                      try {
                        window.sessionStorage.removeItem("slideshow_music_track");
                        window.localStorage.removeItem("slideshow_music_track");
                      } catch {}
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{track.title}</div>
                        <div className="text-xs text-white/60">{track.artist}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>{track.duration}</span>
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-[13px] ${
                            isSelected
                              ? "border-indigo-300/80 bg-indigo-500/30 text-white"
                              : "border-white/20 text-white/60"
                          }`}
                          aria-hidden="true"
                        >
                          {isSelected ? "✓" : "+"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-white/50">{track.licenseName}</div>
                  </button>
                );
              })}
            </div>
            {selectedTracks.length > 0 && (
              <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 text-xs text-white/70">
                <div>
                  Selected:{" "}
                  <span className="font-semibold text-white">{selectedTracks.length}</span>{" "}
                  track{selectedTracks.length === 1 ? "" : "s"}
                </div>
                {selectedTracks.length === 1 && currentTrack && (
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-white/60">
                    <a
                      className="underline decoration-dotted"
                      href={currentTrack.licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      License
                    </a>
                    <a
                      className="underline decoration-dotted"
                      href={currentTrack.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source
                    </a>
                  </div>
                )}
              </div>
            )}
            <div className="px-5 pb-5">
              <button
                type="button"
                className="mt-2 w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/20"
                onClick={() => setShowMusicPicker(false)}
              >
                {strings.backToSlideshow}
              </button>
            </div>
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
      `}</style>
    </main>
  );
}

