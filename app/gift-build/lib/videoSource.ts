import type { DraftVideos } from '@/gift-build/lib/videoMigration';

export type VideoSource =
  | { type: 'mux'; playbackId: string }
  | { type: 'temp'; url: string }
  | null;

export function resolveVideoSource(videos: DraftVideos | null, fallbackMuxId?: string | null): VideoSource {
  if (videos?.finalMuxPlaybackId) {
    return { type: 'mux', playbackId: videos.finalMuxPlaybackId };
  }

  if (fallbackMuxId) {
    return { type: 'mux', playbackId: fallbackMuxId };
  }

  if (videos?.tempUrl) {
    return { type: 'temp', url: videos.tempUrl };
  }

  return null;
}
