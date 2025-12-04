// Twilio Verify API Route - Sends verification code using Twilio Verify Service
// This uses Twilio Verify API which handles code generation and verification automatically

import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

interface SendVerificationRequest {
  phone: string; // Phone number in E.164 format (e.g., +1234567890)
}

interface SendVerificationResponse {
  status?: string;
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SendVerificationResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phone } = req.body as SendVerificationRequest;

    if (!phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number is required' 
      });
    }

    // Validate Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const verifyServiceSid = process.env.TWILIO_VERIFY_SID;

    if (!accountSid || !authToken || !verifyServiceSid) {
      return res.status(500).json({
        success: false,
        error: 'Twilio credentials not configured. Please check environment variables.'
      });
    }

    // Format phone number to E.164 format if needed
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 10) {
      formattedPhone = `+1${formattedPhone}`;
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = `+${formattedPhone}`;
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send verification code using Twilio Verify
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: formattedPhone,
        channel: 'sms',
      });

    console.log('📱 Verification sent via Twilio Verify:', {
      sid: verification.sid,
      to: formattedPhone,
      status: verification.status,
    });

    return res.status(200).json({
      success: true,
      status: verification.status,
      message: `Verification code sent to ${formattedPhone}`,
    });
  } catch (error: any) {
    console.error('Twilio Verify error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send verification code',
    });
  }
}

