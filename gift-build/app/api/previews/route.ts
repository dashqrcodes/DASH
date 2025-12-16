import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/gift-build/lib/supabaseClient';
import { getBaseUrl } from '@/gift-build/lib/baseUrl';
import { getPreviewTtlHours } from '@/gift-build/lib/env';

const PREVIEW_TTL_MS = getPreviewTtlHours() * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const {
      slug,
      personSlug,
      momentSlug,
      personName,
      storyText,
      productType,
      photoUrl,
      photoStorageKey,
      videoAssetId,
    } = await req.json();

    if (
      !slug ||
      !personSlug ||
      !momentSlug ||
      !personName ||
      !photoUrl ||
      !photoStorageKey ||
      !videoAssetId
    ) {
      return NextResponse.json(
        { error: 'Missing preview payload (slug, person, photo, or video)' },
        { status: 400 },
      );
    }

    const expiresAt = new Date(Date.now() + PREVIEW_TTL_MS).toISOString();
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('story_previews')
      .insert({
        slug,
        person_slug: personSlug,
        moment_slug: momentSlug,
        person_name: personName,
        story_text: storyText,
        product_type: productType,
        photo_url: photoUrl,
        photo_storage_key: photoStorageKey,
        video_asset_id: videoAssetId,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase preview insert error:', error);
      throw error;
    }

    const baseUrl = getBaseUrl();
    const previewUrl = `${baseUrl}/temp/${data.id}`;
    const permanentUrl = `${baseUrl}/heaven/${personSlug}/${momentSlug}`;

    return NextResponse.json(
      {
        previewId: data.id,
        previewUrl,
        permanentUrl,
        expiresAt: data.expires_at,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Preview creation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create preview' },
      { status: 500 },
    );
  }
}


