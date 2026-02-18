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
    const qrDataUrl = slug ? `${appUrl}/h/${slug}` : '';
    const qrParams = (bg: string) =>
      qrDataUrl ? `${appUrl}/api/qr?data=${encodeURIComponent(qrDataUrl)}&size=1000&bg=${bg}&ecl=H&fg=3B0066&margin=4` : '';
    const qrUrlCard = qrParams('transparent');
    const qrUrlPoster = qrParams('white');

    const counselorName = body?.counselorName || 'Groman Mortuary';
    const counselorPhone = body?.counselorPhone || '323-476-8005';
    const passageIndex = typeof body?.passageIndex === 'number' ? body.passageIndex : 0;

    if (slug && photoUrl && qrUrlCard && qrUrlPoster) {
      const origin = new URL(req.url).origin;
      const [cardFrontRes, cardBackRes, posterRes] = await Promise.all([
        fetch(`${origin}/api/generate-print-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            photoUrl,
            format: 'card-front',
            fullName: name,
            birthDate: birth,
            deathDate: death,
          }),
        }),
        fetch(`${origin}/api/generate-print-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            qrUrl: qrUrlCard,
            format: 'card-back',
            fullName: name,
            birthDate: birth,
            deathDate: death,
            counselorName,
            counselorPhone,
            passageIndex,
          }),
        }),
        fetch(`${origin}/api/generate-print-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug,
            photoUrl,
            qrUrl: qrUrlPoster,
            format: 'poster',
            fullName: name,
            birthDate: birth,
            deathDate: death,
          }),
        }),
      ]);

      const attachments: Array<{ filename: string; content: Buffer }> = [];
      if (cardFrontRes.ok) {
        const buf = Buffer.from(await cardFrontRes.arrayBuffer());
        attachments.push({ filename: `order-${slug}-card-front.pdf`, content: buf });
      }
      if (cardBackRes.ok) {
        const buf = Buffer.from(await cardBackRes.arrayBuffer());
        attachments.push({ filename: `order-${slug}-card-back.pdf`, content: buf });
      }
      if (posterRes.ok) {
        const buf = Buffer.from(await posterRes.arrayBuffer());
        attachments.push({ filename: `order-${slug}-poster.pdf`, content: buf });
      }

      if (attachments.length > 0) {
        const testEmail = process.env.TEST_PDF_EMAIL;
        const recipientEmail = testEmail || process.env.PRINT_SHOP_EMAIL || '';
        if (recipientEmail) {
          await sendPrintPdfEmail({
            slug,
            recipientEmail,
            customerEmail,
            subjectPrefix: testEmail ? 'Test Print PDF' : 'New Print Order',
            attachments,
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
