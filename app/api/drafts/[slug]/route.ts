import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const { data: draft, error } = await supabaseAdmin
      .from('drafts')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error('Draft fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

