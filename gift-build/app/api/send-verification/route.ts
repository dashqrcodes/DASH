// Twilio Verify API Route - Sends verification code
// Isolated to /gift-build folder

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID!)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });

    return NextResponse.json({ status: verification.status });
  } catch (error: any) {
    console.error('Twilio verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification' },
      { status: 500 }
    );
  }
}

