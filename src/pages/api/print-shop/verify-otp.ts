import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ error: 'Phone and code required' });
        }

        // Clean phone number
        const cleanedPhone = phone.replace(/\D/g, '');

        // TODO: Verify OTP from database/cache (Redis)
        // TODO: Check expiration (10 minutes)
        // TODO: Delete OTP after verification (one-time use)
        
        // TODO: Get print shop info from database by phone number
        
        // Mock successful verification
        const shopId = `SHOP-${Date.now()}`;
        const token = `TOKEN-${Date.now()}`;

        console.log('✅ OTP verified for print shop:', {
            phone: cleanedPhone,
            shopId
        });

        return res.status(200).json({
            success: true,
            shopId,
            shopName: 'B O Printing', // TODO: Get from database
            email: 'david@dashqrcodes.com', // TODO: Get from database
            token
        });

    } catch (error: any) {
        console.error('Verify OTP error:', error);
        return res.status(500).json({ 
            error: error.message || 'Verification failed' 
        });
    }
}

