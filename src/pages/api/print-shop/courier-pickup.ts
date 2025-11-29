// API Route: Handle courier pickup and trigger Stripe payment
import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { isTestMode, getTestModeMessage, createMockPaymentIntent } from '../../../utils/testMode';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

interface CourierPickupRequest {
  orderId: string;
  orderNumber: string;
  amount: number; // Amount in cents
  customerEmail?: string;
  customerName?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, orderNumber, amount, customerEmail, customerName }: CourierPickupRequest = req.body;

    if (!orderId || !orderNumber || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: orderId, orderNumber, amount',
        success: false
      });
    }

    // Check test mode
    const testMode = isTestMode();
    
    // In test mode, return mock payment intent
    if (testMode) {
      const mockPaymentIntent = createMockPaymentIntent(amount);
      console.log('🧪 TEST MODE: Mock payment intent created:', {
        paymentIntentId: mockPaymentIntent.id,
        orderNumber,
        amount,
        testMode: true
      });

      return res.status(200).json({
        success: true,
        message: `${getTestModeMessage()}Mock payment intent created (no real charge)`,
        orderId,
        paymentIntentId: mockPaymentIntent.id,
        clientSecret: mockPaymentIntent.client_secret,
        amount: amount,
        paymentStatus: 'succeeded',
        testMode: true
      });
    }

    // Validate Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️ Stripe not configured - skipping payment');
      return res.status(200).json({
        success: true,
        message: 'Courier pickup recorded (Stripe not configured)',
        orderId,
        paymentStatus: 'skipped'
      });
    }

    // Create Stripe payment intent (REAL MODE)
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          orderId,
          orderNumber,
          type: 'print_shop_order',
          triggeredBy: 'courier_pickup'
        },
        receipt_email: customerEmail || undefined,
        description: `DASH Memorial Order ${orderNumber}${customerName ? ` - ${customerName}` : ''}`
      });

      console.log('💳 Stripe Payment Intent created:', {
        paymentIntentId: paymentIntent.id,
        orderNumber,
        amount: amount * 100,
        status: paymentIntent.status
      });

      // TODO: Store payment intent ID in order record (Supabase)

      return res.status(200).json({
        success: true,
        message: 'Payment intent created successfully',
        orderId,
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        paymentStatus: paymentIntent.status
      });

    } catch (stripeError: any) {
      console.error('❌ Stripe error:', stripeError);
      return res.status(500).json({
        error: `Stripe payment failed: ${stripeError.message}`,
        success: false
      });
    }

  } catch (error: any) {
    console.error('Error processing courier pickup:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process courier pickup',
      success: false
    });
  }
}

