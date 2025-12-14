import { supabaseAdmin } from './supabaseAdmin';

function padSlug(value: number) {
  return value.toString().padStart(6, '0');
}

async function getMaxNumericSlug(table: string) {
  const { data } = await supabaseAdmin
    .from(table)
    .select('slug')
    .order('slug', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.slug && /^\d+$/.test(data.slug)) {
    return parseInt(data.slug, 10);
  }

  return null;
}

export async function generatePermanentSlug(): Promise<string> {
  const draftMax = await getMaxNumericSlug('drafts');
  if (draftMax !== null) {
    return padSlug(draftMax + 1);
  }

  const storyMax = await getMaxNumericSlug('stories');
  if (storyMax !== null) {
    return padSlug(storyMax + 1);
  }

  return padSlug(1);
}

