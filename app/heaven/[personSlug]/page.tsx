import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseAdmin, Story, StoryMoment } from '@/lib/utils/supabaseClient';
import { getMuxPlaybackId } from '@/lib/utils/mux';
import SlideshowEmbed from './SlideshowEmbed';

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

type MemorialDraft = {
  slug: string | null;
  full_name: string | null;
  birth_date: string | null;
  death_date: string | null;
  photo_url: string | null;
};

async function fetchDraft(slug: string): Promise<MemorialDraft | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('drafts')
    .select('slug, full_name, birth_date, death_date, photo_url')
    .eq('slug', slug)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as MemorialDraft;
}

async function hasSlideshowAssets(slug: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '_');
  const folder = `slideshows/${safeSlug}`;
  const { data, error } = await supabase.storage.from('photos').list(folder, {
    limit: 1,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error || !data) {
    return false;
  }

  return data.some((item) => item.name && !item.name.endsWith('/'));
}

interface HeavenPersonPageProps {
  params: {
    personSlug: string;
  };
}

export default async function HeavenPersonPage({ params }: HeavenPersonPageProps) {
  // Fetch directly from Supabase - no cache, no localStorage, no fallbacks
  const [story, moments, draft, hasSlideshow] = await Promise.all([
    fetchPerson(params.personSlug),
    fetchMoments(params.personSlug),
    fetchDraft(params.personSlug),
    hasSlideshowAssets(params.personSlug),
  ]);

  // Simple "Not found" if no record exists
  if (!story && !draft && !hasSlideshow) {
    notFound();
  }

  const displayName = story?.name || draft?.full_name || params.personSlug;
  const displayPhoto = story?.photo_url || draft?.photo_url || null;
  const playbackId = story?.mux_asset_id ? await getMuxPlaybackId(story.mux_asset_id) : null;
  const displayDates =
    draft?.birth_date || draft?.death_date
      ? `${draft?.birth_date || ''}${draft?.birth_date && draft?.death_date ? ' – ' : ''}${draft?.death_date || ''}`
      : '';

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 pb-20 pt-10 md:px-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-300">
            Timeless Transparency Tribute
          </p>
          <h1 className="text-4xl font-semibold text-slate-50 md:text-5xl">{displayName}</h1>
          {displayDates && <p className="text-base text-slate-300">{displayDates}</p>}
          {story?.story_text && <p className="text-lg text-slate-200">{story.story_text}</p>}
        </header>

        {displayPhoto && (
          <div className="overflow-hidden rounded-3xl bg-slate-900/80 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
            <img src={displayPhoto} alt={displayName} className="block h-full w-full object-cover" />
          </div>
        )}

        {hasSlideshow && (
          <section id="slideshow" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-50">Slideshow</h2>
              <Link
                href={`/slideshow/create?slug=${encodeURIComponent(params.personSlug)}`}
                className="text-sm font-medium text-sky-300 hover:text-sky-200"
              >
                Add photos
              </Link>
            </div>
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/70">
              <SlideshowEmbed displayName={displayName} />
            </div>
          </section>
        )}

        {playbackId && (
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-50">Video Tribute</h2>
            <div className="overflow-hidden rounded-3xl bg-black">
              <video
                controls
                playsInline
                className="block w-full"
                poster={displayPhoto || undefined}
              >
                <source src={`https://stream.mux.com/${playbackId}.m3u8`} type="application/x-mpegURL" />
              </video>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-50">Moments</h2>
          {moments.length === 0 ? (
            <p className="text-slate-400">No moments have been added yet. Check back soon.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {moments.map((moment) => (
                <Link
                  key={moment.id}
                  href={`/heaven/${params.personSlug}/${moment.slug}`}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition hover:border-sky-400/60"
                >
                  {moment.photo_url && (
                    <img
                      src={moment.photo_url}
                      alt={moment.slug}
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
                      {moment.product_type || 'Timeless Transparency'}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-50">
                      {moment.slug.replace(/-/g, ' ')}
                    </h3>
                    {moment.caption && <p className="mt-1 text-sm text-slate-300">{moment.caption}</p>}
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(moment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
