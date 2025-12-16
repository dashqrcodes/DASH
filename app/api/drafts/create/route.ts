import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const { data, error } = await supabaseAdmin
      .from('drafts')
      .insert({ status: 'draft' })
      .select()
      .single();

    if (error || !data) {
      console.error('Draft creation failed', error);
      return NextResponse.json({ error: 'Unable to create draft' }, { status: 500 });
    }

    return NextResponse.json(
      { slug: data.slug, url: `/heaven/${data.slug}/acrylic` },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('create draft error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create draft' },
      { status: 500 },
    );
  }
}
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generatePermanentSlug } from '@/lib/utils/slug';
import { getBaseUrl } from '@/lib/utils/baseUrl';

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

