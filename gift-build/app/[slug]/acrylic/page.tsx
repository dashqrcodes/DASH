import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getMuxPlaybackId } from '@/lib/mux';

export default async function AcrylicDraftPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const { data: draft } = await supabaseAdmin
    .from('drafts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (!draft) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-semibold">Invalid or expired dash</h1>
          <Link href="/gift" className="inline-flex rounded-full bg-white px-6 py-3 font-semibold text-black">
            Start a new Transparency
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = draft.status === 'paid';
  let photoUrl = draft.photo_url;
  let playbackId: string | null = null;

  if (isPaid) {
    const { data: story } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (story) {
      photoUrl = story.photo_url;
      if (story.mux_asset_id) {
        playbackId = await getMuxPlaybackId(story.mux_asset_id);
      }
    }
  }

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
                : 'Upload your video after checkout to preserve this dash forever.'}
            </p>
          </div>

          {photoUrl ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <img
                src={photoUrl}
                alt="Uploaded tribute"
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-4 rounded-lg bg-white/80 px-3 py-1 text-xs uppercase tracking-[0.34em] text-black">
                Acrylic 5″ × 7″
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/30 text-gray-400">
              Photo coming soon
            </div>
          )}

          {isPaid ? (
            playbackId ? (
              <video
                controls
                className="w-full rounded-2xl border border-white/10 bg-black"
                poster={photoUrl ?? undefined}
              >
                <source src={`https://stream.mux.com/${playbackId}.m3u8`} type="application/x-mpegURL" />
              </video>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-gray-200">
                Video processing…
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-gray-200">
              Upload your video after checkout to bring this dash to life.
            </div>
          )}

          {!isPaid && (
            <Link
              href={`/gift/checkout?slug=${slug}`}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-white py-4 text-lg font-semibold text-black"
            >
              Complete Your Transparency
            </Link>
          )}
        </div>

        <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Dash Info</h2>
          <p className="mt-2 text-sm text-gray-300">Slug: {slug}</p>
          <p className="text-sm text-gray-300">Status: {draft.status}</p>
          <p className="text-sm text-gray-300">
            URL: <span className="text-white">https://dash.gift/{slug}/acrylic</span>
          </p>
        </div>
      </div>
    </div>
  );
}
