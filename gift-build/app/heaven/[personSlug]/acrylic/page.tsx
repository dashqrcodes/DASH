import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getMuxPlaybackId } from '@/lib/mux';
import type { DraftVideos } from '@/lib/videoMigration';
import { resolveVideoSource } from '@/lib/videoSource';

// Zero cache - always fetch fresh from Supabase
export const revalidate = 0;

export default async function HeavenAcrylicPage({ params }: { params: { personSlug: string } }) {
  const { personSlug } = params;

  // Fetch directly from Supabase - no cache, no localStorage, no fallbacks
  const { data: draft, error: draftError } = await supabaseAdmin
    .from('drafts')
    .select('*')
    .eq('slug', personSlug)
    .maybeSingle();

  const { data: story, error: storyError } = await supabaseAdmin
    .from('stories')
    .select('*')
    .eq('slug', personSlug)
    .maybeSingle();

  // Simple "Not found" if no record exists in Supabase
  if (!draft && !story) {
    notFound();
  }

  // All data comes from Supabase - no fallbacks, no defaults
  const isPaid = draft?.status === 'paid';
  const photoUrl = story?.photo_url || draft?.photo_url || null;
  const videos: DraftVideos = (draft?.videos as DraftVideos) ?? { tempUrl: null, finalMuxPlaybackId: null };

  // Fetch Mux playback ID only if story has mux_asset_id
  let muxPlaybackId: string | null = null;
  if (story?.mux_asset_id) {
    muxPlaybackId = await getMuxPlaybackId(story.mux_asset_id);
  }

  const videoSource = resolveVideoSource(videos, muxPlaybackId);
  const tempVideoUrl = videos.tempUrl ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black p-8 text-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Dash Memories</p>
            <h1 className="text-3xl font-semibold">
              {isPaid ? 'Protected Forever' : 'Draft Transparency'}
            </h1>
            <p className="text-gray-300">
              {isPaid
                ? 'This tribute is locked and will stream for life.'
                : tempVideoUrl
                  ? 'Your Dash is live — finish checkout to protect it forever.'
                  : 'Upload your video after checkout to preserve this dash forever.'}
            </p>
          </div>

          {photoUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img src={photoUrl} alt="Uploaded tribute" className="h-full w-full object-cover" />
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.34em] text-black">
                Acrylic 5″ × 7″
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/30 text-gray-400">
              Photo coming soon
            </div>
          )}

          {videoSource?.type === 'mux' ? (
            <video
              controls
              playsInline
              className="w-full rounded-2xl border border-white/10 bg-black"
              poster={photoUrl ?? undefined}
            >
              <source src={`https://stream.mux.com/${videoSource.playbackId}.m3u8`} type="application/x-mpegURL" />
            </video>
          ) : videoSource?.type === 'temp' ? (
            <video
              controls
              playsInline
              className="w-full rounded-2xl border border-white/10 bg-black"
              src={videoSource.url}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-gray-200">
              This Dash is waiting to be activated.
            </div>
          )}

          {!isPaid && draft && (
            <Link
              href={`/gift/checkout?slug=${personSlug}`}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white py-4 text-lg font-semibold text-black"
            >
              Complete Your Transparency
            </Link>
          )}
        </div>

        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Dash Info</h2>
          <p className="mt-2 text-sm text-gray-300">Slug: {personSlug}</p>
          <p className="text-sm text-gray-300">Status: {draft?.status ?? 'unknown'}</p>
          <p className="text-sm text-gray-300">
            URL: <span className="text-white">https://dash.gift/{personSlug}/acrylic</span>
          </p>
        </div>
      </div>
    </div>
  );
}
