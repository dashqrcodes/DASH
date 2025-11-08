import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { 
            shopName, 
            ownerName, 
            email, 
            phone, 
            address, 
            city, 
            state, 
            zipCode, 
            password 
        } = req.body;

        // TODO: Validate input
        if (!shopName || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // TODO: Hash password with bcrypt
        // TODO: Save to Supabase database
        // TODO: Send welcome email

        // Mock successful signup
        const shopId = `SHOP-${Date.now()}`;
        const token = `TOKEN-${Date.now()}`;

        console.log('🖨️ Print shop signup:', {
            shopId,
            shopName,
            email,
            location: `${city}, ${state}`
        });

        return res.status(200).json({
            success: true,
            shopId,
            shopName,
            token,
            message: 'Account created successfully'
        });

    } catch (error: any) {
        console.error('Print shop signup error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to create account' 
        });
    }
}

