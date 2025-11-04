// API route for Convai character creation
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, photos, videos, voiceSample } = req.body;
        const CONVAI_API_KEY = process.env.CONVAI_API_KEY;

        if (!CONVAI_API_KEY) {
            return res.status(500).json({ error: 'Convai API key not configured' });
        }

        // Create character via Convai API
        const response = await fetch('https://api.convai.com/v1/character/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONVAI_API_KEY}`
            },
            body: JSON.stringify({
                name: name,
                description: `AI memorial character for ${name}`,
                knowledge_base: {
                    photos: photos || [],
                    videos: videos || []
                },
                voice_cloning: voiceSample ? {
                    voice_sample: voiceSample
                } : undefined
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Convai API error: ${error}`);
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            characterId: data.character_id,
            voiceId: data.voice_id
        });
    } catch (error: any) {
        console.error('Convai character creation error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to create Convai character' 
        });
    }
}

