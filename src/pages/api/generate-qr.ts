import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, lovedOneName, color } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // QR code color (default to dark blue)
        // Remove # from hex color if present
        const qrColor = color ? color.replace('#', '') : '1e1b4b';
        
        // OPTIMIZED FOR METAL ENGRAVING & INK PRINTING
        // - ecLevel=L: Lowest error correction = SIMPLEST matrix (best for engraving)
        // - size=500: High resolution for precise engraving
        // - margin=3: Extra safety margin for metal cutting/engraving tolerance
        // - qzone=3: Quiet zone for reliable scanning after engraving
        // Low EC = bigger modules, fewer dots, easier to engrave cleanly
        const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(url)}&dark=${qrColor}&light=00000000&size=500&margin=3&ecLevel=L&format=png&qzone=3`;

        return res.status(200).json({
            success: true,
            qrCode: qrCodeUrl
        });

    } catch (error: any) {
        console.error('QR generation error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to generate QR code' 
        });
    }
}

