import { NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { Vibrant } from 'node-vibrant/node';
import type { Palette } from '@vibrant/color';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function pickAccentHex(palette: Palette) {
  const swatches = [
    palette.Vibrant,
    palette.LightVibrant,
    palette.Muted,
    palette.DarkVibrant,
    palette.DarkMuted,
    palette.LightMuted,
  ];

  for (const swatch of swatches) {
    const hex = swatch?.hex;
    if (hex) return hex;
  }

  return '#ffffff';
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const slug = formData.get('slug') as string | null;

    if (!file || !slug) {
      return NextResponse.json(
        { error: 'Missing file or slug' },
        { status: 400 },
      );
    }

    const rawExt = file.name.split('.').pop() || 'jpg';
    const normalizedExt = rawExt.toLowerCase();
    const isHeic =
      file.type === 'image/heic' ||
      file.type === 'image/heif' ||
      normalizedExt === 'heic' ||
      normalizedExt === 'heif';

    let uploadBuffer = Buffer.from(await file.arrayBuffer());
    let fileExt = normalizedExt || 'jpg';
    let contentType = file.type || 'image/jpeg';

    if (isHeic) {
      const { default: heicConvert } = await import('heic-convert');
      const outputBuffer = await heicConvert({
        buffer: uploadBuffer,
        format: 'JPEG',
        quality: 0.9,
      });
      uploadBuffer = Buffer.from(outputBuffer);
      fileExt = 'jpg';
      contentType = 'image/jpeg';
    }

    const filePath = `drafts/${slug}.${fileExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload(filePath, uploadBuffer, {
        upsert: true,
        contentType,
      });

    if (uploadError) {
      console.error('Photo upload failed', uploadError);
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('photos').getPublicUrl(filePath);

    let accentColor = '#ffffff';
    try {
      const palette = await Vibrant.from(uploadBuffer).getPalette();
      accentColor = pickAccentHex(palette);
    } catch (colorError) {
      console.warn('Failed to calculate accent color', colorError);
    }

    await supabaseAdmin
      .from('drafts')
      .update({ photo_url: publicUrl })
      .eq('slug', slug);

    return NextResponse.json({ photoUrl: publicUrl, accentColor });
  } catch (error: any) {
    console.error('Upload photo error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload photo' },
      { status: 500 },
    );
  }
}

