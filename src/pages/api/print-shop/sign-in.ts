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

        // TODO: Verify credentials with Supabase and validate password
        // For now, simple email-based auth (accept any email/password)
        
        const shopId = email.toLowerCase().trim(); // Use email as ID
        const token = `TOKEN-${Date.now()}`;

        console.log('🖨️ Print shop sign in:', { email });

        // TODO: Get shop name from database
        // For now, use a default or extract from email
        const shopName = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Print Shop';

        return res.status(200).json({
            success: true,
            shopId,
            shopName,
            email,
            token
        });

    } catch (error: any) {
        console.error('Print shop sign in error:', error);
        return res.status(500).json({ 
            error: error.message || 'Sign in failed' 
        });
    }
}

