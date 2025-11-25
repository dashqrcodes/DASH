/**
 * Video Proxy API - Proxies Google Drive videos to bypass CORS
 * GET /api/heaven/video-proxy?url=VIDEO_URL
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'Video URL is required' });
    }

    // Fetch the video from Google Drive
    const videoResponse = await fetch(url, {
      headers: {
        'Range': req.headers.range || 'bytes=0-',
      },
      redirect: 'follow'
    });

    if (!videoResponse.ok) {
      console.error('Failed to fetch video:', videoResponse.status, videoResponse.statusText);
      return res.status(videoResponse.status).json({ 
        message: 'Failed to fetch video',
        status: videoResponse.status
      });
    }

    // Get content type
    const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
    const contentLength = videoResponse.headers.get('content-length');

    // Set response headers for video streaming
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Handle range requests for video seeking
    if (req.headers.range && videoResponse.headers.get('content-range')) {
      res.setHeader('Content-Range', videoResponse.headers.get('content-range') || '');
      res.status(206); // Partial Content
    }

    // Stream the video
    const videoBuffer = await videoResponse.arrayBuffer();
    res.send(Buffer.from(videoBuffer));

  } catch (error: any) {
    console.error('Error proxying video:', error);
    return res.status(500).json({ 
      message: 'Error proxying video',
      error: error.message 
    });
  }
}

