import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const DPI = 72;
const IN = (v: number) => v * DPI;
const CARD_WIDTH_IN = 4;
const CARD_HEIGHT_IN = 6;
const POSTER_WIDTH_IN = 20;
const POSTER_HEIGHT_IN = 30;

export async function POST(req: NextRequest) {
  try {
    const { slug, photoUrl, qrUrl, format } = await req.json();
    if (!slug || !photoUrl || !qrUrl) {
      return NextResponse.json({ error: 'Missing slug, photoUrl, or qrUrl' }, { status: 400 });
    }

    const [photoBuf, qrBuf] = await Promise.all([
      fetch(photoUrl).then((r) => r.arrayBuffer()).then((b) => Buffer.from(b)),
      fetch(qrUrl).then((r) => r.arrayBuffer()).then((b) => Buffer.from(b)),
    ]);

    const isPoster = format === 'poster';
    const widthIn = isPoster ? POSTER_WIDTH_IN : CARD_WIDTH_IN;
    const heightIn = isPoster ? POSTER_HEIGHT_IN : CARD_HEIGHT_IN;

    const doc = new PDFDocument({
      size: [IN(widthIn), IN(heightIn)],
      margin: 0,
    });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // Full-bleed photo
    doc.image(photoBuf, 0, 0, { width: IN(widthIn), height: IN(heightIn) });

    // QR at bottom-left
    const posterUnderlaySize = 1.25;
    const posterBorder = 3 / 16;
    const qrSize = IN(isPoster ? posterUnderlaySize - posterBorder * 2 : 0.75);
    const pad = IN(isPoster ? 1.0 : 0.5);
    const qrX = pad;
    const qrY = IN(heightIn) - pad - qrSize;
    if (isPoster) {
      const underlayPad = IN(posterBorder);
      const underlaySize = IN(posterUnderlaySize);
      const underlayX = qrX - underlayPad;
      const underlayY = qrY - underlayPad;
      doc.rect(underlayX, underlayY, underlaySize, underlaySize).fill('#FFFFFF');
    }
    doc.image(qrBuf, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    });

    doc.end();
    const pdfBuffer = await done;

    const path = `prints/${slug}${isPoster ? '-poster' : ''}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('prints')
      .upload(path, pdfBuffer, { upsert: true, contentType: 'application/pdf' });

    if (uploadError) {
      console.error('Print PDF upload failed', uploadError);
      return NextResponse.json({ error: 'Failed to store PDF' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('prints').getPublicUrl(path);
    const printUrl = urlData.publicUrl;

    if (!isPoster) {
      await supabaseAdmin.from('drafts').update({ print_pdf_url: printUrl }).eq('slug', slug);
    }

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=\"${slug}.pdf\"`,
        'X-Print-Url': printUrl,
      },
    });
  } catch (error: any) {
    console.error('generate-print-pdf error', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate PDF' },
      { status: 500 },
    );
  }
}

