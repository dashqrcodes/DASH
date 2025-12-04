// Stripe Checkout API Route
// Isolated to /gift-build folder

import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: Request) {
  try {
    const {
      profileUrl,        // the customer's tribute page
      videoId,           // mux asset ID
      coverImage,        // Mux thumbnail or local frame
      blockSize,         // "5x7", "8x10", etc.
      customerName,      // optional
      customerMessage,   // optional engraving or message
    } = await req.json();

    if (!profileUrl) {
      return NextResponse.json({ error: 'Missing profileUrl' }, { status: 400 });
    }

    // Set this in .env.local
    const priceId = process.env.STRIPE_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],

      line_items: [
        {
          price: priceId!,
          quantity: 1,
        },
      ],

      metadata: {
        profileUrl,        // the customer's tribute page
        videoId,           // mux asset ID
        coverImage,        // Mux thumbnail or local frame
        blockSize,         // "5x7", "8x10", etc.
        customerName,      // optional
        customerMessage,   // optional engraving or message
      },

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/gift/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

