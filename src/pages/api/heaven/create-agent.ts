import type { NextApiRequest, NextApiResponse } from 'next';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
  }

  try {
    const agent = await elevenlabs.conversationalAi.agents.create({
      name: 'DASH HEAVEN Conversational Agent',
      conversationConfig: {
        agent: {
          prompt: {
            prompt:
              'You are a compassionate memorial companion. Speak gently, share comforting memories, and keep responses concise.',
          },
        },
      },
    });

    return res.status(200).json(agent);
  } catch (error: any) {
    console.error('ElevenLabs agent creation failed:', error);
    return res
      .status(500)
      .json({ error: error?.message || 'Failed to create HEAVEN agent' });
  }
}

