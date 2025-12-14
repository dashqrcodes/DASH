import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { DraftVideos, ONE_DAY_MS, TEMP_BUCKET, extractTempPath } from '@/lib/videoMigration';

export const runtime = 'nodejs';

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  if (CRON_SECRET) {
    const header = req.headers.get('authorization') || '';
    if (header !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const cutoffIso = new Date(Date.now() - ONE_DAY_MS).toISOString();

  const tempResult = await cleanupStaleTempVideos(cutoffIso);
  const draftResult = await cleanupExpiredDrafts(cutoffIso);

  return NextResponse.json({ tempVideosCleared: tempResult, draftsDeleted: draftResult });
}

export async function cleanupStaleTempVideos(cutoffIso: string, client = supabaseAdmin) {
  const { data, error } = await client
    .from('drafts')
    .select('id, slug, videos, updated_at')
    .not('videos->>tempUrl', 'is', null)
    .lt('updated_at', cutoffIso);

  if (error || !data?.length) {
    return 0;
  }

  let cleared = 0;

  for (const draft of data) {
    const videos = (draft.videos as DraftVideos) ?? {};
    if (!videos.tempUrl) continue;

    const path = extractTempPath(videos.tempUrl);
    if (path) {
      const { error: removeError } = await client.storage.from(TEMP_BUCKET).remove([path]);
      if (removeError) {
        console.error('Failed to remove stale temp video', { slug: draft.slug, path, removeError });
      }
    }

    const nextVideos: DraftVideos = {
      ...videos,
      tempUrl: null,
    };

    const { error: updateError } = await client
      .from('drafts')
      .update({ videos: nextVideos })
      .eq('id', draft.id);

    if (updateError) {
      console.error('Failed to clear temp URL from draft', { slug: draft.slug, updateError });
      continue;
    }

    cleared += 1;
  }

  return cleared;
}

export async function cleanupExpiredDrafts(cutoffIso: string, client = supabaseAdmin) {
  const { data, error } = await client
    .from('drafts')
    .select('id, slug, videos')
    .eq('status', 'draft')
    .lt('created_at', cutoffIso);

  if (error || !data?.length) {
    return 0;
  }

  for (const draft of data) {
    const videos = (draft.videos as DraftVideos) ?? {};
    if (videos.tempUrl) {
      const path = extractTempPath(videos.tempUrl);
      if (path) {
        await client.storage.from(TEMP_BUCKET).remove([path]);
      }
    }
  }

  const ids = data.map((draft) => draft.id);
  const { error: deleteError } = await client.from('drafts').delete().in('id', ids);

  if (deleteError) {
    console.error('Failed to delete expired drafts', deleteError);
    return 0;
  }

  return ids.length;
}
