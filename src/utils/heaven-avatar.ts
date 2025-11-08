// Avatar creation client for HEAVEN
// Uses D-ID or HeyGen API to create talking avatars from photos

export interface AvatarCreationResult {
  avatarId: string;
  avatarUrl?: string;
}

export interface TalkingVideoResult {
  videoUrl: string;
  duration: number;
}

/**
 * Create avatar from photo using D-ID or HeyGen API
 * @param imageUrl - URL of the person's photo
 * @param avatarName - Name identifier for the avatar
 */
export async function createAvatar(
  imageUrl: string,
  avatarName: string
): Promise<string> {
  try {
    const response = await fetch('/api/heaven/create-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        avatarName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create avatar');
    }

    const data = await response.json();
    return data.avatarId;
  } catch (error: any) {
    console.error('Error creating avatar:', error);
    throw new Error(`Avatar creation failed: ${error.message}`);
  }
}

/**
 * Generate talking video from avatar + audio
 * @param avatarId - D-ID/HeyGen avatar ID
 * @param audioUrl - URL of synthesized speech audio
 * @param text - Original text (for transcript)
 */
export async function generateTalkingVideo(
  avatarId: string,
  audioUrl: string,
  text: string
): Promise<string> {
  try {
    const response = await fetch('/api/heaven/generate-talking-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatarId,
        audioUrl,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate talking video');
    }

    const data = await response.json();
    return data.videoUrl;
  } catch (error: any) {
    console.error('Error generating talking video:', error);
    throw new Error(`Video generation failed: ${error.message}`);
  }
}

