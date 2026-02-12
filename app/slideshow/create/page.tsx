"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import BackArrowButton from "@/components/BackArrowButton";
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
  const [musicDrawerHeight, setMusicDrawerHeight] = useState(0.9);
  const [musicDrawerDragging, setMusicDrawerDragging] = useState(false);
  const musicDrawerStartY = useRef(0);
  const musicDrawerStartH = useRef(0.9);
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
          useSpotify: "Spotify",
          useAppleMusic: "Apple Music",
          musicHint: "Reproduce tu playlist en Spotify o Apple Music en segundo plano, luego inicia el slideshow. Ambos se reproducirán en paralelo.",
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
          useSpotify: "Spotify",
          useAppleMusic: "Apple Music",
          musicHint: "Play your Spotify or Apple Music playlist in the background, then start the slideshow. Both will play in parallel.",
          backToSlideshow: "Back to slideshow",
          uploadLimit: "Max total upload 500MB.",
          maxPhotos: "Maximum 300 photos for now.",
          play: "Play",
          pause: "Pause",
          empty: "Select photos to start playback.",
        };

  useEffect(() => {
    if (showMusicPicker) setMusicDrawerHeight(0.9);
  }, [showMusicPicker]);

  useEffect(() => {
    if (!musicDrawerDragging) return;
    const onMouseMove = (e: MouseEvent) => {
      const dy = musicDrawerStartY.current - e.clientY;
      const h = Math.max(0.35, Math.min(0.95, musicDrawerStartH.current + dy / window.innerHeight));
      setMusicDrawerHeight(h);
    };
    const onMouseUp = () => setMusicDrawerDragging(false);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [musicDrawerDragging]);

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
            <BackArrowButton
              onClick={handleBack}
              className="shrink-0 bg-white/5 ring-1 ring-white/10 backdrop-blur-xl hover:bg-white/10"
            />
            <div className="flex-1 text-center">
              <p className="text-lg font-semibold text-white">{memorialName}</p>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              disabled={readyUrls.length === 0}
              aria-label="Continue to slideshow"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/25 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
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

            <div className="w-full max-w-md space-y-3">
              <div className="rounded-2xl bg-black/70 p-3 ring-1 ring-white/10 backdrop-blur">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <button
                    type="button"
                    className={primaryButtonClass}
                    onClick={() => setShowMusicPicker(true)}
                  >
                    {selectedTrackIds.length > 0 ? `${strings.musicAdded} ✓` : strings.addMusic}
                  </button>
                  <button
                    type="button"
                    className="h-12 w-full rounded-full bg-[#1DB954] text-base font-semibold text-white shadow-[0_12px_32px_rgba(29,185,84,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/60"
                    onClick={() => window.open("https://open.spotify.com/", "_blank")}
                    title={strings.musicHint}
                  >
                    {strings.useSpotify}
                  </button>
                  <button
                    type="button"
                    className="h-12 w-full rounded-full bg-[#FA243C] text-base font-semibold text-white shadow-[0_12px_32px_rgba(250,36,60,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#FA243C]/60"
                    onClick={() => window.open("https://music.apple.com/", "_blank")}
                    title={strings.musicHint}
                  >
                    {strings.useAppleMusic}
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
              <p className="text-center text-[11px] text-white/60 px-2">
                {strings.musicHint}
              </p>
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
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowMusicPicker(false)}
        >
          <div
            className="flex w-full max-w-lg flex-col overflow-hidden rounded-t-[20px] bg-[#0a0a0b] shadow-2xl transition-[height] duration-200 ease-out"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
              height: `${musicDrawerHeight * 100}svh`,
            }}
          >
            {/* Drag handle - touch target for sliding */}
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center justify-center pt-3 pb-1 active:cursor-grabbing"
              onTouchStart={(e) => {
                setMusicDrawerDragging(true);
                musicDrawerStartY.current = e.touches[0].clientY;
                musicDrawerStartH.current = musicDrawerHeight;
              }}
              onTouchMove={(e) => {
                if (!musicDrawerDragging) return;
                const dy = musicDrawerStartY.current - e.touches[0].clientY;
                const h = Math.max(0.35, Math.min(0.95, musicDrawerStartH.current + dy / window.innerHeight));
                setMusicDrawerHeight(h);
              }}
              onTouchEnd={() => setMusicDrawerDragging(false)}
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                setMusicDrawerDragging(true);
                musicDrawerStartY.current = e.clientY;
                musicDrawerStartH.current = musicDrawerHeight;
              }}
            >
              <div className="h-1 w-9 rounded-full bg-white/25" aria-hidden="true" />
            </div>

            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 pb-3">
              <BackArrowButton
                onClick={() => setShowMusicPicker(false)}
                size="sm"
              />
              <h2 className="text-base font-semibold text-white">Music</h2>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition active:bg-white/25"
                onClick={() => setShowMusicPicker(false)}
                aria-label="Done"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>

            {/* Track list - Apple Music style */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {musicTracks.map((track) => {
                const isSelected = selectedTrackIds.includes(track.id);
                const gradientSeed = track.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
                const hue = (gradientSeed % 360);
                return (
                  <button
                    key={track.id}
                    type="button"
                    className="flex w-full items-center gap-4 px-4 py-3 text-left transition active:bg-white/[0.06]"
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
                    {/* Album art placeholder */}
                    <div
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue}, 45%, 35%) 0%, hsl(${hue}, 55%, 28%) 100%)`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white/80" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                    </div>

                    {/* Title + artist */}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-medium text-white">{track.title}</div>
                      <div className="truncate text-[13px] text-[#8e8e93]">{track.artist}</div>
                    </div>

                    {/* Duration + add/check */}
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[13px] text-[#8e8e93]">{track.duration}</span>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[14px] font-medium ${
                          isSelected
                            ? "bg-[#6366f1] text-white"
                            : "bg-white/15 text-white/90"
                        }`}
                        aria-hidden="true"
                      >
                        {isSelected ? "✓" : "+"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected summary */}
            {selectedTracks.length > 0 && (
              <div className="shrink-0 border-t border-white/[0.08] px-4 py-3">
                <div className="text-[13px] text-[#8e8e93]">
                  <span className="font-semibold text-white">{selectedTracks.length}</span>{" "}
                  track{selectedTracks.length === 1 ? "" : "s"} selected
                </div>
                {selectedTracks.length === 1 && currentTrack && (
                  <div className="mt-1 flex gap-4 text-[11px]">
                    <a
                      className="text-[#6366f1] underline decoration-dotted underline-offset-2"
                      href={currentTrack.licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      License
                    </a>
                    <a
                      className="text-[#6366f1] underline decoration-dotted underline-offset-2"
                      href={currentTrack.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Source
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Spotify CTA */}
            <div className="shrink-0 border-t border-white/[0.08] p-4">
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1DB954] text-base font-semibold text-white shadow-[0_8px_24px_rgba(29,185,84,0.35)] transition duration-200 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/60"
                onClick={() => window.open("https://open.spotify.com/", "_blank")}
              >
                <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.48-4.08 0-10.14-2.44-13.14-5.92-.24-.24-.3-.6-.12-.9.18-.3.54-.36.84-.18 2.64 2.04 8.16 4.92 11.64 4.92.18 0 .36 0 .54-.06.36-.12.66.12.72.48.06.36-.12.66-.48.72zm1.44-3.24c-.3.42-.84.6-1.38.6-5.04 0-12.54-3.72-17.04-8.94-.3-.3-.78-.36-1.14-.12-.36.24-.42.72-.12 1.02 4.92 5.64 12.96 9.12 18.84 9.12.54 0 1.08-.12 1.56-.42.36-.24.42-.12.48.12zm.12-3.36c-.42-.3-.96-.36-1.44-.12-5.76 3.36-14.52 4.32-21.24 4.32-.66 0-1.2-.06-1.5-.12-.48-.12-.96.12-1.08.6-.12.48.12.96.6 1.08-.12 0 1.44.12 2.28.12 7.08 0 16.2-1.08 22.08-4.8.54-.3.66-.96.24-1.38z" />
                </svg>
                {strings.useSpotify}
              </button>
              <p className="mt-2 text-center text-[11px] text-white/60">
                {strings.musicHint}
              </p>
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

