import type { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';
import { storeOTPCode } from '../../utils/supabase';

// SMS Provider Integration with Twilio
interface SendOTPRequest {
    phoneNumber: string; // Format: +1234567890 or 1234567890
}

interface SendOTPResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<SendOTPResponse>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ success: false, error: 'Phone number is required' });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Format phone number (ensure +1 country code)
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
            formattedPhone = `+1${formattedPhone}`;
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`;
        }

        // Get domain for SMS format (required for Web OTP API)
        const domain = process.env.NEXT_PUBLIC_BASE_URL 
            ? new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname
            : process.env.VERCEL_URL || 'localhost:3000';

        // Format SMS message for one-tap OTP
        // Format: "Your code is 123456 @domain.com #123456"
        const smsMessage = `DASH: Your verification code is ${code}

@${domain} #${code}`;

        // Initialize Twilio client
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        // Store code in Supabase (or memory fallback)
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        const storeResult = await storeOTPCode(formattedPhone, code, expiresAt);
        
        if (!storeResult.success) {
            console.warn('Failed to store OTP in Supabase, using memory fallback:', storeResult.error);
            // Fallback to memory storage if Supabase fails
            if (typeof global !== 'undefined') {
                (global as any).otpCodes = (global as any).otpCodes || {};
                (global as any).otpCodes[formattedPhone] = {
                    code,
                    expiresAt
                };
            }
        }

        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.error('Twilio credentials not configured');
            
            console.log('📱 SMS (SIMULATED):', {
                to: formattedPhone,
                message: smsMessage,
                code: code
            });

            return res.status(200).json({
                success: true,
                message: `Verification code would be sent to ${formattedPhone}. Code: ${code} (Check console for development)`
            });
        }

        // Send SMS via Twilio
        const client = twilio(accountSid, authToken);

        try {
            const message = await client.messages.create({
                body: smsMessage,
                from: twilioPhoneNumber,
                to: formattedPhone
            });

            console.log('📱 SMS sent via Twilio:', {
                sid: message.sid,
                to: formattedPhone,
                status: message.status
            });

            // Store code in Supabase
            const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
            const storeResult = await storeOTPCode(formattedPhone, code, expiresAt);
            
            if (!storeResult.success) {
                console.warn('Failed to store OTP in Supabase, falling back to memory:', storeResult.error);
                // Fallback to memory storage if Supabase fails
                if (typeof global !== 'undefined') {
                    (global as any).otpCodes = (global as any).otpCodes || {};
                    (global as any).otpCodes[formattedPhone] = {
                        code,
                        expiresAt
                    };
                }
            }

            return res.status(200).json({
                success: true,
                message: `Verification code sent to ${formattedPhone}`
            });

        } catch (twilioError: any) {
            console.error('Twilio error:', twilioError);
            return res.status(500).json({
                success: false,
                error: twilioError.message || 'Failed to send SMS via Twilio'
            });
        }

    } catch (error: any) {
        console.error('SMS sending error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to send verification code'
        });
    }
}

