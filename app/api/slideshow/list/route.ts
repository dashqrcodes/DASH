import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug') || '';

  if (!slug) {
    return NextResponse.json({ urls: [] }, { status: 200 });
  }

  const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '_');
  const folder = `slideshows/${safeSlug}`;

  const { data, error } = await supabaseAdmin.storage.from('photos').list(folder, {
    limit: 500,
    sortBy: { column: 'name', order: 'asc' },
  });

  if (error || !data) {
    return NextResponse.json({ urls: [] }, { status: 200 });
  }

  const urls = data
    .filter((item) => item.name && !item.name.endsWith('/'))
    .map((item) => {
      const path = `${folder}/${item.name}`;
      return supabaseAdmin.storage.from('photos').getPublicUrl(path).data.publicUrl;
    });

  return NextResponse.json({ urls });
}
