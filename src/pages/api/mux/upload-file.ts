/**
 * API Route: Upload video file to Mux
 * POST /api/mux/upload-file
 * 
 * Uses Mux Direct Upload for secure client-side uploads
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadVideoToMux, isMuxConfigured } from '../../../utils/mux-integration';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isMuxConfigured()) {
    return res.status(500).json({ error: 'Mux credentials not configured' });
  }

  try {
    // This endpoint creates a direct upload URL
    // The client will upload directly to Mux using this URL
    const { passthrough, test } = req.body;

    // We'll return a direct upload URL for the client to use
    // This is more secure than uploading through our server
    const Mux = require('@mux/mux-node');
    const mux = new Mux(
      process.env.MUX_TOKEN_ID || '',
      process.env.MUX_TOKEN_SECRET || ''
    );

    const upload = await mux.video.directUploads.create({
      new_asset_settings: {
        playback_policy: ['public'],
        mp4_support: 'standard',
      },
      passthrough: passthrough || undefined,
      test: test || false,
    });

    return res.status(200).json({
      success: true,
      uploadId: upload.id,
      uploadUrl: upload.url,
      assetId: upload.asset_id,
    });
  } catch (error: any) {
    console.error('Mux direct upload creation error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to create Mux upload',
    });
  }
}


