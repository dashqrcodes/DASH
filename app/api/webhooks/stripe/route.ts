import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { migrateTempVideo } from '@/lib/utils/videoMigration';
import { sendPrintPdfEmail } from '@/lib/utils/emailPdf';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const sessionId = session.id;

    try {
      // Find draft by checkout session ID
      const { data: draft, error: draftError } = await supabaseAdmin
        .from('drafts')
        .select('*')
        .eq('stripe_checkout_session_id', sessionId)
        .maybeSingle();

      if (draftError || !draft) {
        console.error('Draft not found for session:', sessionId);
        return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
      }

      const slug = draft.slug;
      const videos = (draft.videos as any) || {};

      // Step 1: Migrate temp video to Mux (if video exists)
      let muxPlaybackId: string | null = null;
      if (videos.tempUrl) {
        try {
          const migrationResult = await migrateTempVideo(slug, videos.tempUrl);
          muxPlaybackId = migrationResult.playbackId;
          
          // Update draft with Mux playback ID
          await supabaseAdmin
            .from('drafts')
            .update({
              videos: {
                ...videos,
                finalMuxPlaybackId: muxPlaybackId,
                tempUrl: null, // Clear temp URL
              },
            })
            .eq('slug', slug);
        } catch (migrationError) {
          console.error('Video migration failed:', migrationError);
          // Continue anyway - PDF can still be generated
        }
      }

      // Step 2: Generate PDF with final design
      const permanentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dash.gift'}/${slug}/acrylic`;
      const { generateAcrylicPDF } = await import('@/lib/utils/pdfGenerator');
      const pdfBuffer = await generateAcrylicPDF({
        slug,
        photoUrl: draft.photo_url || '',
        qrUrl: permanentUrl,
        muxPlaybackId,
      });

      // Step 3: Email PDF to vendor
      const testEmail = process.env.TEST_PDF_EMAIL;
      const recipientEmail = testEmail || process.env.PRINT_SHOP_EMAIL || 'printshop@example.com';
      await sendPrintPdfEmail({
        pdfBuffer,
        slug,
        recipientEmail,
        customerEmail: session.customer_email,
        subjectPrefix: testEmail ? 'Test Print PDF' : 'New Acrylic Order',
      });

      // Step 4: Update draft status to 'paid'
      await supabaseAdmin
        .from('drafts')
        .update({ status: 'paid' })
        .eq('slug', slug);

      return NextResponse.json({ success: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      return NextResponse.json(
        { error: error.message || 'Webhook processing failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

 

