/**
 * API endpoint to extract video URL from webpage
 * Server-side extraction to avoid CORS issues
 */

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return res.status(404).json({ error: 'Page not found' });
    }

    const html = await response.text();

    // Try to find video URLs in the HTML
    const videoUrl = extractVideoFromHTML(html, url);

    if (videoUrl) {
      return res.status(200).json({ videoUrl });
    }

    // If no video found, return the original URL
    // The page might serve video directly via JavaScript
    return res.status(200).json({ videoUrl: url });
  } catch (error) {
    console.error('Error extracting video URL:', error);
    return res.status(500).json({ error: 'Failed to extract video URL' });
  }
}

/**
 * Extract video URL from HTML content
 */
function extractVideoFromHTML(html: string, baseUrl: string): string | null {
  // Pattern 1: <video src="...">
  const videoSrcMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i);
  if (videoSrcMatch && videoSrcMatch[1]) {
    return resolveUrl(videoSrcMatch[1], baseUrl);
  }

  // Pattern 2: <source src="..." type="video/...">
  const sourceMatch = html.match(/<source[^>]+src=["']([^"']+)["'][^>]+type=["']video\//i);
  if (sourceMatch && sourceMatch[1]) {
    return resolveUrl(sourceMatch[1], baseUrl);
  }

  // Pattern 3: Video file URLs in script tags or data attributes
  const videoFilePatterns = [
    /["']([^"']+\.(mp4|m3u8|webm|m4v))["']/gi,
    /src:\s*["']([^"']+\.(mp4|m3u8|webm|m4v))["']/gi,
    /url\(["']?([^"')]+\.(mp4|m3u8|webm|m4v))["']?\)/gi,
  ];

  for (const pattern of videoFilePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return resolveUrl(match[1], baseUrl);
    }
  }

  // Pattern 4: Mux, Cloudinary, or other video service URLs
  const videoServicePatterns = [
    /(https?:\/\/[^"'\s]+stream\.mux\.com[^"'\s]+)/gi,
    /(https?:\/\/[^"'\s]+cloudinary\.com[^"'\s]+\/video[^"'\s]+)/gi,
    /(https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)/gi,
  ];

  for (const pattern of videoServicePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Resolve relative URLs to absolute URLs
 */
function resolveUrl(url: string, baseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
}

