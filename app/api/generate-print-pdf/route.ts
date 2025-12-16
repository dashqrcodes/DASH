import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const DPI = 72;
const IN = (v: number) => v * DPI;

export async function POST(req: NextRequest) {
  try {
    const { slug, photoUrl, qrUrl } = await req.json();
    if (!slug || !photoUrl || !qrUrl) {
      return NextResponse.json({ error: 'Missing slug, photoUrl, or qrUrl' }, { status: 400 });
    }

    const [photoBuf, qrBuf] = await Promise.all([
      fetch(photoUrl).then((r) => r.arrayBuffer()).then((b) => Buffer.from(b)),
      fetch(qrUrl).then((r) => r.arrayBuffer()).then((b) => Buffer.from(b)),
    ]);

    const doc = new PDFDocument({ size: [IN(6), IN(6)], margin: 0 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    // Full-bleed photo
    doc.image(photoBuf, 0, 0, { width: IN(6), height: IN(6) });

    // QR at bottom-left: 0.75" square with 0.5" padding
    const qrSize = IN(0.75);
    const pad = IN(0.5);
    doc.image(qrBuf, pad, IN(6) - pad - qrSize, { width: qrSize, height: qrSize });

    doc.end();
    const pdfBuffer = await done;

    const path = `prints/${slug}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('prints')
      .upload(path, pdfBuffer, { upsert: true, contentType: 'application/pdf' });

    if (uploadError) {
      console.error('Print PDF upload failed', uploadError);
      return NextResponse.json({ error: 'Failed to store PDF' }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('prints').getPublicUrl(path);
    const printUrl = urlData.publicUrl;

    await supabaseAdmin.from('drafts').update({ print_pdf_url: printUrl }).eq('slug', slug);

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

