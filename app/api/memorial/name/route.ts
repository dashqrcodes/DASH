import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') || '';
  if (!slug) {
    return NextResponse.json({ name: '' }, { status: 200 });
  }

  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '_');

  const [storyRes, draftRes] = await Promise.all([
    supabaseAdmin.from('stories').select('name').eq('slug', safeSlug).maybeSingle(),
    supabaseAdmin.from('drafts').select('full_name').eq('slug', slug).order('updated_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  const name = storyRes.data?.name || draftRes.data?.full_name || slug;
  return NextResponse.json({ name });
}
