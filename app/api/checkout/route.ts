import { NextRequest, NextResponse } from 'next/server';
import { sendPrintPdfEmail } from '@/lib/utils/emailPdf';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body?.slug || body?.memorial_id || '';
    const photoUrl = body?.photoUrl || body?.photo || '';
    const name = body?.name || '';
    const birth = body?.birth || '';
    const death = body?.death || '';
    const lang = body?.lang || 'en';
    const customerEmail = body?.email || null;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dashmemories.com';
    const qrUrl = slug ? `${appUrl}/heaven/${slug}` : '';

    if (slug && photoUrl && qrUrl) {
      const origin = new URL(req.url).origin;
      const pdfRes = await fetch(`${origin}/api/generate-print-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, photoUrl, qrUrl }),
      });
      if (pdfRes.ok) {
        const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
        const testEmail = process.env.TEST_PDF_EMAIL;
        const recipientEmail = testEmail || process.env.PRINT_SHOP_EMAIL || '';
        if (recipientEmail) {
          await sendPrintPdfEmail({
            pdfBuffer,
            slug,
            recipientEmail,
            customerEmail,
            subjectPrefix: testEmail ? 'Test Print PDF' : 'New Print Order',
          });
        }
      }
    }

    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (birth) params.set('birth', birth);
    if (death) params.set('death', death);
    if (slug) params.set('slug', slug);
    if (lang) params.set('lang', lang);
    const url = `/memorial/order/success${params.toString() ? `?${params}` : ''}`;

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Checkout failed' }, { status: 500 });
  }
}
