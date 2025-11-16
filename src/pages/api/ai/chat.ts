import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const result = await streamText({
      model: openai('gpt-4-turbo'), // Using gpt-4-turbo (gpt-5 doesn't exist yet)
      prompt: prompt,
    });

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the response
    for await (const chunk of result.textStream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('AI chat error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to generate AI response' 
    });
  }
}

