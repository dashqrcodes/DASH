import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Get access token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No access token provided' });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(q)}&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error: error.error?.message || 'Search failed' });
    }

    const data = await response.json();
    const tracks = data.tracks?.items?.map((track: any) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((a: any) => a.name).join(', '),
      album: {
        name: track.album.name,
        image: track.album.images?.[0]?.url || track.album.images?.[1]?.url || null,
      },
      uri: track.uri,
      preview_url: track.preview_url,
    })) || [];

    return res.status(200).json({ tracks });
  } catch (error: any) {
    console.error('Spotify search error:', error);
    return res.status(500).json({ error: error.message || 'Search failed' });
  }
}

