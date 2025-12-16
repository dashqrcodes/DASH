import { NextRequest, NextResponse } from 'next/server';
import Vibrant from 'node-vibrant';
import QRCodeStyling from 'qr-code-styling';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

type Palette = {
  Vibrant?: { hex: string };
  DarkVibrant?: { hex: string };
};

function pickColors(photoBuffer: Buffer) {
  try {
    const palette = Vibrant.from(photoBuffer).getPalette() as Palette;
    const accent = palette.Vibrant?.hex || palette.DarkVibrant?.hex || '#222222';
    const bg = '#ffffffcc'; // soft backdrop for scan-ability
    return { accent, bg };
  } catch (_err) {
    return { accent: '#222222', bg: '#ffffffcc' };
  }
}

function toBuffer(raw: ArrayBuffer | Uint8Array | Buffer) {
  if (Buffer.isBuffer(raw)) return raw;
  if (raw instanceof Uint8Array) return Buffer.from(raw);
  return Buffer.from(raw);
}

function resolveBaseUrl(req: NextRequest) {
  const headerHost = req.headers.get('host');
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  const app = process.env.NEXT_PUBLIC_APP_URL;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  const base =
    site ||
    app ||
    (vercel ? (vercel.startsWith('http') ? vercel : `https://${vercel}`) : undefined) ||
    (headerHost ? `https://${headerHost}` : undefined) ||
    'http://localhost:3000';
  return base.replace(/\/$/, '');
}

function buildCanonicalTarget(req: NextRequest, slug: string) {
  const base = resolveBaseUrl(req);
  return `${base}/heaven/${slug}/acrylic`;
}

export async function POST(req: NextRequest) {
  try {
    const { slug, targetUrl, photoUrl } = await req.json();
    if (!slug || !photoUrl) {
      return NextResponse.json({ error: 'Missing slug or photoUrl' }, { status: 400 });
    }

    // Fetch draft to reuse existing qr_target (immutable once set)
    const { data: draft } = await supabaseAdmin
      .from('drafts')
      .select('qr_target')
      .eq('slug', slug)
      .maybeSingle();

    const canonicalTarget =
      draft?.qr_target ||
      targetUrl ||
      buildCanonicalTarget(req, slug);

    const photoBuffer = Buffer.from(await fetch(photoUrl).then((r) => r.arrayBuffer()));
    const { accent, bg } = pickColors(photoBuffer);

    // Center logo with inline SVG that says DASH
    const centerSvg = encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
        <rect width='200' height='200' rx='32' ry='32' fill='${bg.replace(/cc$/, 'ee')}'/>
        <text x='50%' y='56%' font-family='Inter,Arial,sans-serif' font-size='72' font-weight='700' fill='${accent}' text-anchor='middle' dominant-baseline='middle'>DASH</text>
      </svg>`
    );
    const centerImage = `data:image/svg+xml,${centerSvg}`;

    const qr = new QRCodeStyling({
      width: 512,
      height: 512,
      type: 'png',
      data: canonicalTarget,
      margin: 24,
      qrOptions: { errorCorrectionLevel: 'Q' },
      dotsOptions: { type: 'rounded', color: accent },
      cornersSquareOptions: { type: 'extra-rounded', color: accent },
      backgroundOptions: { color: bg },
      image: centerImage,
      imageOptions: { crossOrigin: 'anonymous', imageSize: 0.28, margin: 4 },
    });

    const raw = await qr.getRawData('png');
    const pngBuffer = toBuffer(raw as ArrayBuffer);

    const path = `qr/${slug}.png`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('qr')
      .upload(path, pngBuffer, { upsert: true, contentType: 'image/png' });

    if (uploadError) {
      console.error('QR upload failed', uploadError);
      return NextResponse.json({ error: 'Failed to store QR' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('qr').getPublicUrl(path);
    const qrUrl = urlData.publicUrl;

    await supabaseAdmin
      .from('drafts')
      .update({ qr_url: qrUrl, accent_color: accent, qr_target: canonicalTarget })
      .eq('slug', slug);

    return NextResponse.json({ qrUrl, accentColor: accent, qrTarget: canonicalTarget });
  } catch (error: any) {
    console.error('generate-qr error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate QR' },
      { status: 500 },
    );
  }
}
