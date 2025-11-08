import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // TODO: Verify credentials with Supabase
        // TODO: Validate password with bcrypt
        
        // Mock successful sign in
        const shopId = `SHOP-${Date.now()}`;
        const token = `TOKEN-${Date.now()}`;

        console.log('🖨️ Print shop sign in:', { email });

        return res.status(200).json({
            success: true,
            shopId,
            shopName: 'B O Printing', // TODO: Get from database
            token
        });

    } catch (error: any) {
        console.error('Print shop sign in error:', error);
        return res.status(500).json({ 
            error: error.message || 'Sign in failed' 
        });
    }
}

