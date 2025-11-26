/**
 * Extract actual video file URL from webpage URL or return direct video URL
 * Handles both direct video file URLs and webpage URLs that contain videos
 */

export async function extractVideoUrl(url: string): Promise<string | null> {
  if (!url) return null;

  // If it's already a direct video file URL, return it
  if (isDirectVideoUrl(url)) {
    return url;
  }

  // If it's a webpage URL, try to extract the video URL
  if (isWebpageUrl(url)) {
    try {
      const videoUrl = await extractVideoFromWebpage(url);
      if (videoUrl) {
        return videoUrl;
      }
    } catch (error) {
      console.warn('Failed to extract video from webpage:', error);
    }
  }

  // Return original URL if we can't extract (fallback)
  return url;
}

/**
 * Check if URL is a direct video file
 */
function isDirectVideoUrl(url: string): boolean {
  const videoExtensions = ['.mp4', '.m3u8', '.webm', '.m4v', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  
  // Check if URL ends with video extension
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }

  // Check if URL is from known video hosting services
  const videoHostingPatterns = [
    'stream.mux.com',
    'cloudinary.com/video',
    'vimeo.com/video',
    'youtube.com/embed',
    '.m3u8',
    '/video/',
  ];

  return videoHostingPatterns.some(pattern => lowerUrl.includes(pattern));
}

/**
 * Check if URL is a webpage (not a direct video file)
 */
function isWebpageUrl(url: string): boolean {
  // If it's clearly a webpage URL (no video extension, not from video hosting)
  return !isDirectVideoUrl(url) && 
         (url.includes('http://') || url.includes('https://'));
}

/**
 * Extract video URL from webpage by fetching and parsing
 * This is a client-side approach - for server-side, we'd use a different method
 */
async function extractVideoFromWebpage(url: string): Promise<string | null> {
  // For client-side, we can't easily fetch and parse HTML due to CORS
  // So we'll use a proxy API endpoint or return null to let the browser handle it
  
  try {
    // Try to fetch via our API proxy
    const response = await fetch(`/api/extract-video-url?url=${encodeURIComponent(url)}`);
    if (response.ok) {
      const data = await response.json();
      return data.videoUrl || null;
    }
  } catch (error) {
    console.warn('Video extraction API failed, trying direct URL:', error);
  }

  // Fallback: return null, let the page try to load it
  // The browser might handle it if the page serves video directly
  return null;
}

