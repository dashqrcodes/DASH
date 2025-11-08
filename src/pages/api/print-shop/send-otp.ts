import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Phone number required' });
        }

        // Clean phone number
        const cleanedPhone = phone.replace(/\D/g, '');

        // TODO: Check if phone exists in database (print shop account)
        
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // TODO: Store OTP in database/cache (Redis) with 10-minute expiration
        
        // TODO: Send SMS via Twilio
        /*
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        
        const client = require('twilio')(accountSid, authToken);
        
        await client.messages.create({
            body: `Your DASH Print Shop verification code is: ${otp}`,
            from: twilioPhone,
            to: `+1${cleanedPhone}`
        });
        */

        console.log('📱 OTP sent to print shop:', {
            phone: cleanedPhone,
            otp // Remove in production!
        });

        // For now, return success (development mode - show OTP in console)
        return res.status(200).json({
            success: true,
            message: 'Verification code sent',
            // Remove this in production!
            devOtp: otp
        });

    } catch (error: any) {
        console.error('Send OTP error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to send code' 
        });
    }
}

