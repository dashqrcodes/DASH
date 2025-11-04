import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Generate AI image using Cloudinary
        const result = await cloudinary.uploader.upload(
            `https://res.cloudinary.com/djepgisuk/image/fetch/${encodeURIComponent(
                `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600`
            )}`
        );
        
        return res.status(200).json({ url: result.secure_url });
    } catch (error: any) {
        console.error('AI generation error:', error);
        return res.status(500).json({ error: error.message || 'Failed to generate AI background' });
    }
}

