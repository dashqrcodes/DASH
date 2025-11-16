import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Generate slideshow video with Spotify music
 * 
 * This endpoint:
 * 1. Downloads all photos
 * 2. Creates a video with transitions (using FFmpeg)
 * 3. Adds Spotify preview audio (or full track if available)
 * 4. Returns the final video file
 * 
 * Note: Spotify only allows 30-second previews via API.
 * For full tracks, user would need to provide audio file.
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { photos, spotifyTracks, duration, lovedOneName } = req.body;

    if (!photos || photos.length === 0) {
      return res.status(400).json({ error: 'No photos provided' });
    }

    // Spotify API Limitations:
    // - Only provides 30-second preview URLs per track
    // - Cannot download full tracks (Terms of Service restriction)
    // - Multiple tracks = multiple 30-second previews
    // - Can concatenate previews, but still limited to 30s each
    
    if (spotifyTracks && spotifyTracks.length > 0) {
      const totalPreviewDuration = spotifyTracks.length * 30; // seconds
      const videoDuration = duration || photos.length * 4; // seconds
      
      if (totalPreviewDuration < videoDuration) {
        console.warn(`Preview duration (${totalPreviewDuration}s) < video duration (${videoDuration}s)`);
        // Will need to loop audio or use user-uploaded audio
      }
    }

    // For now, return a placeholder response
    // In production, this would:
    // 1. Download all photos from URLs
    // 2. Use FFmpeg to create video with transitions
    // 3. Download all Spotify preview audio URLs (30s each)
    // 4. Concatenate audio previews if multiple tracks
    // 5. Loop audio if video is longer than total preview duration
    // 6. Combine video + audio
    // 7. Return final video file

    // TODO: Implement FFmpeg video generation
    // This requires:
    // - Server with FFmpeg installed
    // - Download photos to temp directory
    // - Create video with transitions (fade, slide, etc.)
    // - Download multiple Spotify preview URLs
    // - Concatenate/loop audio tracks
    // - Add audio track to video
    // - Stream back to client

    return res.status(501).json({ 
      error: 'Video generation not yet implemented',
      message: 'This feature requires FFmpeg server-side processing. Coming soon!',
      note: 'Spotify allows multiple track previews (30s each). For full tracks, users can upload their own audio files.',
      spotifyLimitation: 'Spotify API only provides 30-second previews per track. Full tracks require user-uploaded audio or royalty-free music.'
    });

  } catch (error: any) {
    console.error('Error generating video:', error);
    return res.status(500).json({ 
      error: 'Failed to generate video',
      message: error.message 
    });
  }
}

