// Audio extraction utility for HEAVEN
// Extracts audio track from slideshow video files

export interface AudioExtractionResult {
  audioUrl: string;
  duration: number;
}

/**
 * Extract audio from video file
 * Uses client-side MediaRecorder API as fallback
 * TODO: Replace with server-side ffmpeg endpoint /api/extract-audio
 */
export async function extractAudioFromVideo(videoUrl: string): Promise<string> {
  try {
    // Step 1: Try server-side extraction first (recommended)
    const response = await fetch('/api/heaven/extract-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.audioUrl;
    }

    // Step 2: Fallback to client-side extraction
    console.warn('Server-side extraction failed, using client-side fallback');
    return await extractAudioClientSide(videoUrl);
  } catch (error) {
    console.error('Error extracting audio:', error);
    // Fallback to client-side
    return await extractAudioClientSide(videoUrl);
  }
}

/**
 * Client-side audio extraction using MediaRecorder API
 * NOTE: This is a fallback. Use server-side ffmpeg for production.
 */
async function extractAudioClientSide(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;

    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };

    video.oncanplay = async () => {
      try {
        const stream = (video as any).captureStream?.() || 
                      (video as any).mozCaptureStream?.();
        
        if (!stream) {
          throw new Error('Stream capture not supported');
        }

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);

        const mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: 'audio/webm;codecs=opus'
        });

        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          resolve(audioUrl);
        };

        mediaRecorder.start();
        video.play();

        video.onended = () => {
          mediaRecorder.stop();
          audioContext.close();
        };
      } catch (error) {
        reject(error);
      }
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
}

/**
 * Get slideshow video URL from localStorage
 */
export function getSlideshowVideoUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const slideshowMedia = localStorage.getItem('slideshowMedia');
  if (!slideshowMedia) return null;

  try {
    const media: Array<{ type: string; url: string; muxPlaybackId?: string }> = JSON.parse(slideshowMedia);
    // Find first video
    const video = media.find(m => m.type === 'video');
    if (video) {
      // Prefer Mux playback URL if available
      if (video.muxPlaybackId) {
        return `https://stream.mux.com/${video.muxPlaybackId}.m3u8`;
      }
      return video.url;
    }
  } catch (e) {
    console.error('Error parsing slideshow media:', e);
  }

  return null;
}

/**
 * Get primary photo URL from slideshow or card design
 */
export function getPrimaryPhotoUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // Try card design first
  const cardDesign = localStorage.getItem('cardDesign');
  if (cardDesign) {
    try {
      const card = JSON.parse(cardDesign);
      if (card.front?.photo) {
        return card.front.photo;
      }
    } catch (e) {
      console.error('Error parsing card design:', e);
    }
  }

  // Try slideshow media
  const slideshowMedia = localStorage.getItem('slideshowMedia');
  if (!slideshowMedia) return null;

  try {
    const media: Array<{ type: string; url: string }> = JSON.parse(slideshowMedia);
    // Find first photo
    const photo = media.find(m => m.type === 'photo');
    if (photo) {
      return photo.url;
    }
  } catch (e) {
    console.error('Error parsing slideshow media:', e);
  }

  return null;
}

