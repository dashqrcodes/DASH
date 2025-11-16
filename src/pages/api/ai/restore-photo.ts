import type { NextApiRequest, NextApiResponse } from 'next';
import Replicate from 'replicate';

/**
 * AI Photo Restoration API
 * Uses state-of-the-art AI models to:
 * - Upscale low-resolution photos
 * - Remove scratches, noise, and artifacts
 * - Colorize black & white photos
 * - Enhance facial features
 * - Restore damaged photos
 */

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, mode = 'restore' } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: 'imageUrl is required' });
  }

  if (!process.env.REPLICATE_API_TOKEN) {
    return res.status(500).json({ error: 'REPLICATE_API_TOKEN not configured' });
  }

  try {
    let output;

    switch (mode) {
      case 'restore':
        // GFPGAN - Face restoration and enhancement
        output = await replicate.run(
          'tencentarc/gfpgan:9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
          {
            input: {
              img: imageUrl,
              version: 'v1.4',
              scale: 2,
            },
          }
        );
        break;

      case 'upscale':
        // Real-ESRGAN - General image upscaling
        output = await replicate.run(
          'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
          {
            input: {
              image: imageUrl,
              scale: 4,
            },
          }
        );
        break;

      case 'colorize':
        // DeOldify - Colorize black & white photos
        output = await replicate.run(
          'jantic/deoldify:99a36b5b5e5b5e5b5e5b5e5b5e5b5e5b5',
          {
            input: {
              image: imageUrl,
              render_factor: 35,
            },
          }
        );
        break;

      case 'enhance':
        // CodeFormer - Face enhancement with better preservation
        output = await replicate.run(
          'sczhou/codeformer:7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cdd5',
          {
            input: {
              image: imageUrl,
              background_enhance: true,
              face_upsample: true,
              upscale: 2,
            },
          }
        );
        break;

      default:
        return res.status(400).json({ error: 'Invalid mode. Use: restore, upscale, colorize, or enhance' });
    }

    return res.status(200).json({
      restoredUrl: output,
      mode,
      success: true,
    });
  } catch (error: any) {
    console.error('Photo restoration error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to restore photo',
    });
  }
}

