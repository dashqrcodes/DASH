import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, lovedOneName } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // Generate QR code using external API
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

        return res.status(200).json({
            success: true,
            qrCode: qrCodeUrl
        });
    } catch (error: any) {
        console.error('QR generation error:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate QR code' });
    }
}

