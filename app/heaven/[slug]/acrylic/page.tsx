import { notFound } from 'next/navigation';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const revalidate = 0;

type DraftVideos = {
  tempUrl?: string | null;
  finalMuxPlaybackId?: string | null;
};

async function getDraft(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('drafts')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Draft fetch error', error);
  }

  return data as
    | {
        slug: string;
        status: string;
        photo_url: string | null;
        qr_url: string | null;
        mockup_url: string | null;
        print_pdf_url: string | null;
        videos: DraftVideos | null;
      }
    | null;
}

export default async function AcrylicDraftPage({ params }: { params: { slug: string } }) {
  const draft = await getDraft(params.slug);
  if (!draft) notFound();

  const videos = (draft.videos as DraftVideos) || {};
  const playbackId = videos.finalMuxPlaybackId ?? null;
  const tempUrl = videos.tempUrl ?? null;
  const videoSrc = playbackId
    ? `https://stream.mux.com/${playbackId}.m3u8`
    : tempUrl || null;

  const displayImage = draft.mockup_url || draft.photo_url || null;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Dash Memories</p>
            <h1 className="text-3xl font-semibold">
              {draft.status === 'paid' ? 'Protected Forever' : 'Draft Transparency'}
            </h1>
            <p className="text-gray-300">
              {draft.status === 'paid'
                ? 'This tribute is locked and will stream for life.'
                : videoSrc
                  ? 'Your Dash is live — finish checkout to protect it forever.'
                  : 'Upload your video to bring this dash to life.'}
            </p>
          </div>

          {displayImage ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <Image
                src={displayImage}
                alt="Uploaded tribute"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/30 text-gray-400">
              Photo coming soon
            </div>
          )}

          {videoSrc ? (
            <video
              controls
              playsInline
              className="w-full rounded-2xl border border-white/10 bg-black"
              poster={displayImage ?? undefined}
            >
              <source src={videoSrc} type={playbackId ? 'application/x-mpegURL' : 'video/mp4'} />
            </video>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-gray-200">
              This Dash is waiting for its video.
            </div>
          )}

          {draft.print_pdf_url && (
            <a
              href={draft.print_pdf_url}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
            >
              Download Print-Ready PDF
            </a>
          )}
        </div>

        <div className="w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Dash Info</h2>
          <p className="text-sm text-gray-300">Slug: {params.slug}</p>
          <p className="text-sm text-gray-300">Status: {draft.status}</p>
          {draft.qr_url && (
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-2">QR Code</p>
              <Image
                src={draft.qr_url}
                alt="QR"
                width={200}
                height={200}
                className="h-auto w-full rounded-xl border border-white/10 bg-black/40 p-2"
              />
            </div>
          )}
          {draft.print_pdf_url && (
            <p className="text-xs text-gray-400 break-words">
              Print PDF: <a className="text-white underline" href={draft.print_pdf_url}>{draft.print_pdf_url}</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

