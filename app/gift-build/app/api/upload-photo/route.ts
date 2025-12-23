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

    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `drafts/${slug}.${fileExt}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from('photos')
      .upload(filePath, buffer, {
        upsert: true,
        contentType: file.type || 'image/jpeg',
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
      const palette = await Vibrant.from(buffer).getPalette();
      accentColor = pickAccentHex(palette);
    } catch (colorError) {
      console.warn('Failed to calculate accent color', colorError);
    }

    await supabaseAdmin
      .from('drafts')
      .update({ photo_url: publicUrl })
      .eq('slug', slug);

    // Kick off QR -> mockup -> print PDF pipeline
    const baseUrl = new URL(req.url).origin;
    let qrUrl: string | null = null;
    let mockupUrl: string | null = null;
    let printPdfUrl: string | null = null;

    try {
      const qrRes = await fetch(`${baseUrl}/api/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, photoUrl: publicUrl }),
      });
      if (qrRes.ok) {
        const qrData = await qrRes.json();
        qrUrl = qrData.qrUrl ?? null;
      } else {
        console.error('QR generation failed', await qrRes.text());
      }
    } catch (err) {
      console.error('QR generation error', err);
    }

    if (qrUrl) {
      try {
        const mockupRes = await fetch(`${baseUrl}/api/generate-mockup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, photoUrl: publicUrl, qrUrl }),
        });
        if (mockupRes.ok) {
          const mockupData = await mockupRes.json();
          mockupUrl = mockupData.mockupUrl ?? null;
        } else {
          console.error('Mockup generation failed', await mockupRes.text());
        }
      } catch (err) {
        console.error('Mockup generation error', err);
      }

      try {
        const pdfRes = await fetch(`${baseUrl}/api/generate-print-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, photoUrl: publicUrl, qrUrl }),
        });
        if (pdfRes.ok) {
          // Response is PDF; we still want stored URL from DB
          const { data: draft } = await supabaseAdmin
            .from('drafts')
            .select('print_pdf_url')
            .eq('slug', slug)
            .maybeSingle();
          printPdfUrl = draft?.print_pdf_url ?? null;
        } else {
          console.error('Print PDF generation failed', await pdfRes.text());
        }
      } catch (err) {
        console.error('Print PDF generation error', err);
      }
    }

    return NextResponse.json({
      photoUrl: publicUrl,
      accentColor,
      qrUrl,
      mockupUrl,
      printPdfUrl,
    });
  } catch (error: any) {
    console.error('Upload photo error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to upload photo' },
      { status: 500 },
    );
  }
}
