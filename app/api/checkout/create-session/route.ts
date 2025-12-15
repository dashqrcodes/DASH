import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/utils/stripe';
import { getBaseUrl } from '@/lib/utils/baseUrl';

export async function POST(req: NextRequest) {
  try {
    const { slug, productType = 'acrylic', amount = 199 } = await req.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug' },
        { status: 400 }
      );
    }

    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}/checkout/success?slug=${slug}`;
    const cancelUrl = `${baseUrl}/gift?slug=${slug}`;

    // Get Stripe Price ID from environment variable
    // Should be set in .env.local or Vercel environment variables
    const priceId = process.env.STRIPE_PRICE_ID_ACRYLIC;
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe Price ID not configured. Please set STRIPE_PRICE_ID_ACRYLIC in environment variables.' },
        { status: 500 }
      );
    }

    const session = await createCheckoutSession(
      [{ price: priceId, quantity: 1 }],
      successUrl,
      cancelUrl
    );

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

