import { NextRequest, NextResponse } from 'next/server';
import { generateQrDataUrl } from '@/lib/qr';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  const accentColor = searchParams.get('color') || undefined;

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const qr = await generateQrDataUrl(targetUrl, accentColor);
    return NextResponse.json({ qr });
  } catch (error: any) {
    console.error('QR generation failed', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate QR code' },
      { status: 500 },
    );
  }
}
