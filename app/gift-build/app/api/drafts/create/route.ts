import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generatePermanentSlug } from '@/gift-build/lib/slug';
import { getBaseUrl } from '@/gift-build/lib/baseUrl';

export async function POST() {
  try {
    const slug = await generatePermanentSlug();
    const { data, error } = await supabaseAdmin
      .from('drafts')
      .insert({ slug, status: 'draft' })
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Failed to create draft');
    }

    const baseUrl = getBaseUrl();

    return NextResponse.json(
      {
        slug: data.slug,
        url: `${baseUrl}/${data.slug}/acrylic`,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Draft creation failed', error);
    return NextResponse.json(
      { error: error?.message || 'Unable to create draft' },
      { status: 500 },
    );
  }
}

