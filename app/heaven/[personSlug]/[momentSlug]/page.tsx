import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin, StoryMoment, Story } from '@/lib/utils/supabaseClient';
import { getMuxPlaybackId } from '@/lib/utils/mux';

export const revalidate = 60;

async function fetchMoment(personSlug: string, momentSlug: string): Promise<StoryMoment | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('story_moments')
    .select('*')
    .eq('person_slug', personSlug)
    .eq('slug', momentSlug)
    .single();
  return data as StoryMoment | null;
}

async function fetchStory(personSlug: string): Promise<Story | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('stories').select('*').eq('slug', personSlug).single();
  return data as Story | null;
}

interface MomentPageProps {
  params: {
    personSlug: string;
    momentSlug: string;
  };
}

export default async function HeavenMomentPage({ params }: MomentPageProps) {
  const [moment, story] = await Promise.all([
    fetchMoment(params.personSlug, params.momentSlug),
    fetchStory(params.personSlug),
  ]);

  if (!moment) {
    notFound();
  }

  const playbackId = moment.mux_asset_id ? await getMuxPlaybackId(moment.mux_asset_id) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#e2e8f0', padding: '32px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Link
          href={`/heaven/${params.personSlug}`}
          style={{ color: '#22d3ee', textDecoration: 'none', fontSize: '14px', display: 'inline-flex', gap: '4px' }}
        >
          ← View Full Profile
        </Link>

        <header>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '12px', color: '#38bdf8' }}>
            {moment.product_type || 'Timeless Transparency'}
          </p>
          <h1 style={{ fontSize: '40px', margin: '8px 0', color: '#f8fafc' }}>
            {moment.slug.replace(/-/g, ' ')}
          </h1>
          {story?.name && (
            <p style={{ fontSize: '16px', color: '#cbd5f5' }}>A moment from {story.name}</p>
          )}
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '12px' }}>
            {new Date(moment.created_at).toLocaleString()}
          </p>
        </header>

        {moment.photo_url && (
          <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#0f172a' }}>
            <img src={moment.photo_url} alt={moment.slug} style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        {playbackId && (
          <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#000' }}>
            <video controls playsInline style={{ width: '100%', display: 'block' }} poster={moment.photo_url || undefined}>
              <source src={`https://stream.mux.com/${playbackId}.m3u8`} type="application/x-mpegURL" />
            </video>
          </div>
        )}

        {moment.caption && (
          <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#cbd5f5' }}>{moment.caption}</p>
        )}
      </div>
    </div>
  );
}
