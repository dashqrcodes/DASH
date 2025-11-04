// API route for starting Convai conversation
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { characterId } = req.body;
        const CONVAI_API_KEY = process.env.CONVAI_API_KEY;

        if (!CONVAI_API_KEY) {
            return res.status(500).json({ error: 'Convai API key not configured' });
        }

        // Start conversation session via Convai API
        const response = await fetch('https://api.convai.com/v1/conversation/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONVAI_API_KEY}`
            },
            body: JSON.stringify({
                character_id: characterId,
                session_type: 'video_call'
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Convai API error: ${error}`);
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            sessionId: data.session_id,
            streamUrl: data.webrtc_url,
            roomId: data.room_id
        });
    } catch (error: any) {
        console.error('Convai conversation start error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to start conversation' 
        });
    }
}

