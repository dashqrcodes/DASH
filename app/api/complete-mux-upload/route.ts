import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { waitForMuxAssetId, waitForMuxPlaybackId } from '@/lib/utils/mux';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { slug, uploadId } = await req.json();
    if (!slug || !uploadId) {
      return NextResponse.json({ error: 'Missing slug or uploadId' }, { status: 400 });
    }

    const assetId = await waitForMuxAssetId(uploadId);
    const playbackId = await waitForMuxPlaybackId(assetId);

    const nextVideos = { tempUrl: null, finalMuxPlaybackId: playbackId };

    const { error: updateError } = await supabaseAdmin
      .from('drafts')
      .update({ videos: nextVideos })
      .eq('slug', slug);

    if (updateError) {
      console.error('Failed to store mux playback id', updateError);
      return NextResponse.json({ error: 'Failed to save playback id' }, { status: 500 });
    }

    return NextResponse.json({ assetId, playbackId });
  } catch (error: any) {
    console.error('complete-mux-upload error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to finalize Mux upload' },
      { status: 500 },
    );
  }
}

