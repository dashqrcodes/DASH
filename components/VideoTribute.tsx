"use client";

import { useState, useCallback } from "react";

interface VideoTributeProps {
  playbackId: string;
  poster?: string | null;
}

export default function VideoTribute({ playbackId, poster }: VideoTributeProps) {
  const [showVideo, setShowVideo] = useState(true);

  const handleError = useCallback(() => {
    setShowVideo(false);
  }, []);

  if (!showVideo) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold text-slate-50">Video Tribute</h2>
      <div className="overflow-hidden rounded-3xl bg-black">
        <video
          controls
          playsInline
          className="block w-full"
          poster={poster || undefined}
          onError={handleError}
        >
          <source
            src={`https://stream.mux.com/${playbackId}.m3u8`}
            type="application/x-mpegURL"
          />
        </video>
      </div>
    </section>
  );
}
