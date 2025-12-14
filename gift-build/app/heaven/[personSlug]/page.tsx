import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin, Story, StoryMoment } from '@/lib/supabaseClient';
import { getMuxPlaybackId } from '@/lib/mux';

// Zero cache - always fetch fresh from Supabase
export const revalidate = 0;

async function fetchPerson(slug: string): Promise<Story | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data as Story;
}

async function fetchMoments(slug: string): Promise<StoryMoment[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('story_moments')
    .select('*')
    .eq('person_slug', slug)
    .order('created_at', { ascending: true });
  
  if (error || !data) {
    return [];
  }
  
  return data as StoryMoment[];
}

interface HeavenPersonPageProps {
  params: {
    personSlug: string;
  };
}

export default async function HeavenPersonPage({ params }: HeavenPersonPageProps) {
  // Fetch directly from Supabase - no cache, no localStorage, no fallbacks
  const [story, moments] = await Promise.all([
    fetchPerson(params.personSlug),
    fetchMoments(params.personSlug),
  ]);

  // Simple "Not found" if no record exists
  if (!story) {
    notFound();
  }

  const playbackId = story.mux_asset_id ? await getMuxPlaybackId(story.mux_asset_id) : null;

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#e2e8f0', padding: '32px 16px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <header>
          <p style={{ textTransform: 'uppercase', letterSpacing: '0.35em', fontSize: '12px', color: '#38bdf8' }}>
            Timeless Transparency Tribute
          </p>
          <h1 style={{ fontSize: '48px', margin: '8px 0', color: '#f8fafc' }}>{story.name}</h1>
          {story.story_text && (
            <p style={{ fontSize: '18px', lineHeight: 1.6, color: '#cbd5f5' }}>{story.story_text}</p>
          )}
        </header>

        {story.photo_url && (
          <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#0f172a' }}>
            <img src={story.photo_url} alt={story.name} style={{ width: '100%', display: 'block' }} />
          </div>
        )}

        {playbackId && (
          <div style={{ borderRadius: '24px', overflow: 'hidden', background: '#000' }}>
            <video
              controls
              playsInline
              style={{ width: '100%', display: 'block' }}
              poster={story.photo_url || undefined}
            >
              <source src={`https://stream.mux.com/${playbackId}.m3u8`} type="application/x-mpegURL" />
            </video>
          </div>
        )}

        <section>
          <h2 style={{ fontSize: '28px', marginBottom: '16px', color: '#f8fafc' }}>Moments</h2>
          {moments.length === 0 && (
            <p style={{ color: '#94a3b8' }}>No moments have been added yet. Check back soon.</p>
          )}
          <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {moments.map((moment) => (
              <Link
                key={moment.id}
                href={`/heaven/${params.personSlug}/${moment.slug}`}
                style={{
                  borderRadius: '16px',
                  padding: '16px',
                  background: '#0f172a',
                  textDecoration: 'none',
                  color: '#e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {moment.photo_url && (
                  <img
                    src={moment.photo_url}
                    alt={moment.slug}
                    style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', height: '160px' }}
                  />
                )}
                <div>
                  <p style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#38bdf8', textTransform: 'uppercase' }}>
                    {moment.product_type || 'Timeless Transparency'}
                  </p>
                  <h3 style={{ fontSize: '18px', margin: '4px 0', color: '#f8fafc' }}>
                    {moment.slug.replace(/-/g, ' ')}
                  </h3>
                  {moment.caption && <p style={{ fontSize: '14px', color: '#cbd5f5' }}>{moment.caption}</p>}
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(moment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}


