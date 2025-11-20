import type { NextApiRequest, NextApiResponse } from 'next';
import { isMuxConfigured } from '../../utils/mux-integration';

/**
 * Test endpoint to check if Mux is configured
 * GET /api/test-mux
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const configured = isMuxConfigured();
  const hasTokenId = !!process.env.MUX_TOKEN_ID;
  const hasTokenSecret = !!process.env.MUX_TOKEN_SECRET;
  const tokenIdLength = process.env.MUX_TOKEN_ID?.length || 0;
  const tokenSecretLength = process.env.MUX_TOKEN_SECRET?.length || 0;

  return res.status(200).json({
    muxConfigured: configured,
    hasTokenId,
    hasTokenSecret,
    tokenIdLength,
    tokenSecretLength,
    message: configured 
      ? '✅ Mux is configured correctly!' 
      : '❌ Mux is NOT configured. Check environment variables.',
    details: {
      'MUX_TOKEN_ID exists': hasTokenId,
      'MUX_TOKEN_SECRET exists': hasTokenSecret,
      'Token ID length': tokenIdLength,
      'Token Secret length': tokenSecretLength,
    }
  });
}


