import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { url, lovedOneName, color } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        // QR code size (smaller as requested)
        const qrSize = 150;
        
        // Generate QR code with custom color (default to matching text color)
        const qrColor = color || '#000000';
        
        // Create QR code canvas with transparent background
        const qrCanvas = await QRCode.toCanvas(url, {
            width: qrSize,
            margin: 1,
            color: {
                dark: qrColor,
                light: '#00000000' // Fully transparent
            },
            errorCorrectionLevel: 'H' // Higher error correction for logo overlay
        });

        // Create final canvas with logo overlay and transparent background
        const finalCanvas = createCanvas(qrSize, qrSize);
        const ctx = finalCanvas.getContext('2d');
        
        // Clear canvas to ensure transparency
        ctx.clearRect(0, 0, qrSize, qrSize);
        
        // Draw QR code
        ctx.drawImage(qrCanvas as any, 0, 0);
        
        // Draw DASH logo in center (no background, just text)
        const centerX = qrSize / 2;
        const centerY = qrSize / 2;
        
        // DASH text directly on QR code
        ctx.fillStyle = qrColor;
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DASH', centerX, centerY);
        
        // Convert to base64 data URL
        const qrCodeDataUrl = finalCanvas.toDataURL('image/png');

        return res.status(200).json({
            success: true,
            qrCode: qrCodeDataUrl
        });
    } catch (error: any) {
        console.error('QR generation error:', error);
        // Fallback to external API if canvas fails
        try {
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(req.body.url)}`;
            return res.status(200).json({
                success: true,
                qrCode: qrCodeUrl
            });
        } catch (fallbackError) {
            return res.status(500).json({ error: error.message || 'Failed to generate QR code' });
        }
    }
}

