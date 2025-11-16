/**
 * HeyGen Streaming Avatar API
 * 
 * Creates and manages streaming avatar sessions for real-time conversations
 * Uses HeyGen's streaming avatar SDK for live avatar interactions
 */

import type { NextApiRequest, NextApiResponse } from 'next';

interface StreamingSessionRequest {
  avatarName?: string;
  avatarId?: string;
  quality?: 'low' | 'medium' | 'high';
  voiceId?: string;
  imageUrl?: string; // For creating avatar from photo
}

interface StreamingSessionResponse {
  sessionId: string;
  token: string;
  wsUrl: string;
  avatarId?: string;
  success: boolean;
}

/**
 * Get HeyGen access token
 * In production, this should be generated server-side using your API key
 */
async function getHeyGenToken(): Promise<string> {
  const apiKey = process.env.HEYGEN_API_KEY;
  
  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  // HeyGen token generation (simplified - use their actual token endpoint)
  // For production, use: https://api.heygen.com/v1/streaming.create_token
  try {
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expires_in: 3600, // 1 hour
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create HeyGen token');
    }

    const data = await response.json();
    return data.data.token;
  } catch (error) {
    console.error('Error creating HeyGen token:', error);
    // Fallback: return API key as token (not recommended for production)
    return apiKey;
  }
}

/**
 * Create avatar from photo if needed
 */
async function createAvatarFromPhoto(imageUrl: string, avatarName: string): Promise<string> {
  const apiKey = process.env.HEYGEN_API_KEY;
  
  if (!apiKey) {
    throw new Error('HEYGEN_API_KEY not configured');
  }

  try {
    // Step 1: Upload photo to HeyGen
    const uploadResponse = await fetch('https://api.heygen.com/v1/avatar/upload_photo', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photo_url: imageUrl,
        name: avatarName,
      }),
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload photo to HeyGen');
    }

    const uploadData = await uploadResponse.json();
    const photoId = uploadData.data.photo_id;

    // Step 2: Create avatar from photo
    const avatarResponse = await fetch('https://api.heygen.com/v1/avatar/create', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        photo_id: photoId,
        name: avatarName,
      }),
    });

    if (!avatarResponse.ok) {
      throw new Error('Failed to create avatar');
    }

    const avatarData = await avatarResponse.json();
    return avatarData.data.avatar_id;
  } catch (error) {
    console.error('Error creating avatar from photo:', error);
    throw error;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StreamingSessionResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { avatarName, avatarId, quality = 'high', voiceId, imageUrl } = req.body as StreamingSessionRequest;

    // Get HeyGen access token
    const token = await getHeyGenToken();

    let finalAvatarId = avatarId;

    // Create avatar from photo if imageUrl provided
    if (imageUrl && !avatarId && avatarName) {
      console.log('Creating avatar from photo...');
      finalAvatarId = await createAvatarFromPhoto(imageUrl, avatarName);
    }

    if (!finalAvatarId && !avatarName) {
      return res.status(400).json({ 
        error: 'Either avatarId or avatarName (with imageUrl) is required' 
      });
    }

    // Create streaming session
    const sessionResponse = await fetch('https://api.heygen.com/v1/streaming.create', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        avatar_id: finalAvatarId,
        avatar_name: avatarName,
        quality,
        voice_id: voiceId,
      }),
    });

    if (!sessionResponse.ok) {
      const errorData = await sessionResponse.json();
      throw new Error(errorData.message || 'Failed to create streaming session');
    }

    const sessionData = await sessionResponse.json();

    return res.status(200).json({
      success: true,
      sessionId: sessionData.data.session_id,
      token: sessionData.data.token || token,
      wsUrl: sessionData.data.ws_url || 'wss://api.heygen.com/v1/streaming',
      avatarId: finalAvatarId,
    });
  } catch (error: any) {
    console.error('HeyGen streaming error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to create streaming session' 
    });
  }
}

