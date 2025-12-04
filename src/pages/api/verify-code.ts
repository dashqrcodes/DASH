// Twilio Verify API Route - Verifies the code entered by user
// This uses Twilio Verify API which handles code verification automatically

import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

interface VerifyCodeRequest {
  phone: string; // Phone number in E.164 format (e.g., +1234567890)
  code: string; // Verification code entered by user
}

interface VerifyCodeResponse {
  status?: string;
  success: boolean;
  message?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyCodeResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { phone, code } = req.body as VerifyCodeRequest;

    if (!phone || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and code are required' 
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

    // Verify the code using Twilio Verify
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: formattedPhone,
        code: code,
      });

    console.log('✅ Verification check result:', {
      sid: verificationCheck.sid,
      to: formattedPhone,
      status: verificationCheck.status,
    });

    if (verificationCheck.status === 'approved') {
      return res.status(200).json({
        success: true,
        status: verificationCheck.status,
        message: 'Code verified successfully',
      });
    } else {
      return res.status(400).json({
        success: false,
        status: verificationCheck.status,
        error: 'Invalid or expired verification code',
      });
    }
  } catch (error: any) {
    console.error('Twilio Verify error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify code',
    });
  }
}

