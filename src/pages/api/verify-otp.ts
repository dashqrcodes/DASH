import type { NextApiRequest, NextApiResponse } from 'next';

interface VerifyOTPRequest {
    phoneNumber: string;
    code: string;
}

interface VerifyOTPResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyOTPResponse>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phoneNumber, code } = req.body;

        if (!phoneNumber || !code) {
            return res.status(400).json({ error: 'Phone number and code are required' });
        }

        // Format phone number
        let formattedPhone = phoneNumber.replace(/\D/g, '');
        if (formattedPhone.length === 10) {
            formattedPhone = `+1${formattedPhone}`;
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = `+${formattedPhone}`;
        }

        // Get stored code
        const storedData = (global as any).otpCodes?.[formattedPhone];

        if (!storedData) {
            return res.status(400).json({ error: 'Code not found. Please request a new code.' });
        }

        // Check expiration
        if (Date.now() > storedData.expiresAt) {
            delete (global as any).otpCodes[formattedPhone];
            return res.status(400).json({ error: 'Code expired. Please request a new code.' });
        }

        // Verify code
        if (storedData.code !== code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Code verified successfully
        delete (global as any).otpCodes[formattedPhone];

        return res.status(200).json({
            success: true,
            message: 'Code verified successfully'
        });

    } catch (error: any) {
        console.error('OTP verification error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to verify code'
        });
    }
}

