/**
 * API Route: Get Mux asset status and playback ID
 * GET /api/mux/asset-status?assetId=xxx
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { isMuxConfigured } from '../../../utils/mux-integration';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isMuxConfigured()) {
    return res.status(500).json({ error: 'Mux credentials not configured' });
  }

  try {
    const { assetId } = req.query;

    if (!assetId || typeof assetId !== 'string') {
      return res.status(400).json({ error: 'assetId is required' });
    }

    const Mux = require('@mux/mux-node');
    const mux = new Mux(
      process.env.MUX_TOKEN_ID || '',
      process.env.MUX_TOKEN_SECRET || ''
    );

    const asset = await mux.video.assets.retrieve(assetId);

    if (!asset || !asset.playback_ids || asset.playback_ids.length === 0) {
      return res.status(200).json({
        status: asset?.status || 'unknown',
        playbackId: null,
        ready: false,
      });
    }

    return res.status(200).json({
      status: asset.status,
      playbackId: asset.playback_ids[0].id,
      ready: asset.status === 'ready',
    });
  } catch (error: any) {
    console.error('Mux asset status error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to get asset status',
    });
  }
}

