import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin, StoryPreview } from '@/lib/supabaseClient';
import { getMuxPlaybackId } from '@/lib/muxClient';

export const dynamic = 'force-dynamic';

async function fetchPreview(previewId: string): Promise<StoryPreview | null> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from('story_previews')
      .select('*')
      .eq('id', previewId)
      .single();

    return data as StoryPreview | null;
  } catch (error) {
    console.error('Preview lookup failed:', error);
    return null;
  }
}

interface TempPreviewPageProps {
  params: {
    previewId: string;
  };
}

export default async function TempPreviewPage({ params }: TempPreviewPageProps) {
  const preview = await fetchPreview(params.previewId);

  if (!preview) {
    notFound();
  }

  const expired = new Date(preview.expires_at).getTime() < Date.now();
  const muxPlaybackId = expired ? null : await getMuxPlaybackId(preview.video_asset_id);
  const permanentPath = `/heaven/${preview.person_slug}/${preview.moment_slug}`;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#fff',
        padding: '32px 16px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: '12px', color: '#94a3b8' }}>
          Temporary Preview · {preview.product_type || 'Timeless Transparency'}
        </p>
        <h1 style={{ fontSize: '36px', margin: '8px 0 12px' }}>
          {preview.person_name}
        </h1>
        {preview.story_text && (
          <p style={{ color: '#cbd5f5', marginBottom: '16px', lineHeight: 1.5 }}>{preview.story_text}</p>
        )}
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
          Future permanent link:{' '}
          <span style={{ color: '#22d3ee' }}>{permanentPath}</span>
        </p>

        {expired && (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.15)',
              marginBottom: '24px',
            }}
          >
            <p style={{ margin: 0, color: '#fca5a5' }}>
              This preview expired on {new Date(preview.expires_at).toLocaleString()}.
            </p>
          </div>
        )}

        {!expired && (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(34,197,94,0.15)',
              marginBottom: '24px',
            }}
          >
            <p style={{ margin: 0, color: '#bbf7d0' }}>
              Preview live until {new Date(preview.expires_at).toLocaleString()}
            </p>
          </div>
        )}

        <div style={{ borderRadius: '16px', overflow: 'hidden', marginBottom: '24px', background: '#111' }}>
          <img
            src={preview.photo_url}
            alt="Preview photo"
            style={{ width: '100%', display: 'block', objectFit: 'cover' }}
          />
        </div>

        {muxPlaybackId ? (
          <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#000', marginBottom: '32px' }}>
            <video
              controls
              style={{ width: '100%', display: 'block' }}
              playsInline
              poster={preview.photo_url}
            >
              <source src={`https://stream.mux.com/${muxPlaybackId}.m3u8`} type="application/x-mpegURL" />
            </video>
          </div>
        ) : (
          <p style={{ color: '#94a3b8', marginBottom: '32px' }}>
            {expired
              ? 'Video unavailable for expired preview.'
              : 'Your video is processing. Revisit this link in a moment.'}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a
            href={`/gift?previewId=${preview.id}`}
            style={{
              display: 'inline-flex',
              padding: '14px 28px',
              borderRadius: '999px',
              background: expired ? '#334155' : '#22d3ee',
              color: expired ? '#94a3b8' : '#0f172a',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {expired ? 'Create a New Gift' : 'Go to Checkout'}
          </a>
          <Link
            href={permanentPath}
            style={{
              display: 'inline-flex',
              padding: '14px 28px',
              borderRadius: '999px',
              border: '1px solid #22d3ee',
              color: '#22d3ee',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View Full Profile
          </Link>
        </div>
      </div>
    </div>
  );
}


