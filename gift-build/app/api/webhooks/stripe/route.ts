// Stripe Webhook Handler
// Isolated to /gift-build folder

import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client directly here to avoid build-time issues
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err: any) {
    console.error('Webhook error', err);
    return new NextResponse(`Webhook error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const {
      profileUrl,
      customerName,
      customerMessage,
      blockSize,
      videoId,
      coverImage,
    } = session.metadata || {};

    // Insert into Supabase
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from('orders').insert({
      session_id: session.id,
      customer_email: session.customer_email,
      amount_total: session.amount_total,
      profile_url: profileUrl,
      block_size: blockSize,
      video_id: videoId,
      cover_image: coverImage,
      customer_name: customerName,
      customer_message: customerMessage,
      fulfillment_status: 'pending', // you can update later when printed/shipped
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    console.log('✨ Order stored in database:', session.id);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}


