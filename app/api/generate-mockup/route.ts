import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { buildAcrylicMockupUrl } from '@/lib/utils/mockupUrl';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { slug, photoUrl, qrUrl } = await req.json();
    if (!slug || !photoUrl || !qrUrl) {
      return NextResponse.json({ error: 'Missing slug, photoUrl, or qrUrl' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
    }

    const liveUrl = buildAcrylicMockupUrl({
      cloudName,
      visitorPhotoUrl: photoUrl,
      qrPngUrl: qrUrl,
    });

    // Cache the composed mockup into Supabase storage (optional but helpful for emails)
    const imgBuffer = Buffer.from(await fetch(liveUrl).then((r) => r.arrayBuffer()));
    const path = `mockups/${slug}.png`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('mockups')
      .upload(path, imgBuffer, { upsert: true, contentType: 'image/png' });

    if (uploadError) {
      console.error('Mockup upload failed', uploadError);
      return NextResponse.json({ error: 'Failed to store mockup' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('mockups').getPublicUrl(path);
    const mockupUrl = urlData.publicUrl;

    await supabaseAdmin.from('drafts').update({ mockup_url: mockupUrl }).eq('slug', slug);

    return NextResponse.json({ mockupUrl, liveUrl });
  } catch (error: any) {
    console.error('generate-mockup error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate mockup' },
      { status: 500 },
    );
  }
}

