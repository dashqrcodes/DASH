import { NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';
import { Vibrant } from 'node-vibrant/node';
import type { Palette } from '@vibrant/color';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { v2 as cloudinary } from 'cloudinary';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

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

    const uploadBuffer = Buffer.from(await file.arrayBuffer());
    let fileExt = normalizedExt || 'jpg';
    let contentType = file.type || 'image/jpeg';

    const cloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    );

    if (cloudinaryConfigured) {
      try {
        const cloudinaryUrl = await new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'drafts',
              public_id: slug,
              resource_type: 'image',
              format: 'jpg',
              overwrite: true,
              unique_filename: false,
            },
            (error, result) => {
              if (error || !result?.secure_url) {
                reject(error || new Error('Cloudinary upload failed'));
                return;
              }
              resolve(result.secure_url);
            },
          );
          stream.end(uploadBuffer);
        });

        await supabaseAdmin.from('drafts').update({ photo_url: cloudinaryUrl }).eq('slug', slug);

        return NextResponse.json({ photoUrl: cloudinaryUrl, accentColor: '#ffffff' });
      } catch (cloudinaryError: any) {
        console.error('Cloudinary upload failed', cloudinaryError);
        const message =
          cloudinaryError?.message ||
          cloudinaryError?.error?.message ||
          'Unable to upload photo. Please try again.';
        return NextResponse.json(
          { error: message },
          { status: 422 },
        );
      }
    }

    if (isHeic) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured for HEIC uploads.' },
        { status: 500 },
      );
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

export async function GET() {
  return new Response('ok', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
