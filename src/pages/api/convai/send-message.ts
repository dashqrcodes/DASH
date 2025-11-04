// API route for sending messages to Convai
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { characterId, message, sessionId } = req.body;
        const CONVAI_API_KEY = process.env.CONVAI_API_KEY;

        if (!CONVAI_API_KEY) {
            return res.status(500).json({ error: 'Convai API key not configured' });
        }

        // Send message via Convai API
        const response = await fetch('https://api.convai.com/v1/conversation/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONVAI_API_KEY}`
            },
            body: JSON.stringify({
                character_id: characterId,
                session_id: sessionId,
                message: message,
                user_text: message
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Convai API error: ${error}`);
        }

        const data = await response.json();

        return res.status(200).json({
            success: true,
            text: data.response_text,
            audioUrl: data.audio_url,
            characterId: characterId
        });
    } catch (error: any) {
        console.error('Convai message error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to send message' 
        });
    }
}

