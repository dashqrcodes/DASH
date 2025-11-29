import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Create the Supabase client ONLY when URL and ANON KEY are present.
 * This prevents build-time SSR errors when env vars are missing on Preview/Prod.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Do not throw during build; log once and export a null client.
  // Callers must guard for null (we also guard inside helpers below).
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ Supabase not initialized: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
}

export { supabase };

// Helper functions for DASH
export async function createMemorial(data: any) {
  if (!supabase) return { memorial: null, error: new Error('Supabase not configured') };
  const { data: memorial, error } = await supabase
    .from('memorials')
    .insert(data)
    .select()
    .single();
  
  return { memorial, error };
}

export async function getMemorial(id: string) {
  if (!supabase) return { memorial: null, error: new Error('Supabase not configured') };
  const { data: memorial, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', id)
    .single();
  
  return { memorial, error };
}

export async function updateMemorial(id: string, updates: any) {
  if (!supabase) return { memorial: null, error: new Error('Supabase not configured') };
  const { data: memorial, error } = await supabase
    .from('memorials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { memorial, error };
}

/**
 * Upload HEAVEN demo video to Supabase Storage
 * @param file - Video file
 * @param demoName - Demo name (e.g., "kobe-bryant")
 * @returns Public URL of uploaded video
 */
export async function uploadDemoVideo(
  file: File | Blob,
  demoName: string
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileName = `demo-videos/${demoName.toLowerCase()}-${Date.now()}.mp4`;
    
    const { data, error } = await supabase.storage
      .from('heaven-assets')
      .upload(fileName, file, {
        contentType: file.type || 'video/mp4',
        upsert: false
      });

    if (error) {
      console.error('Error uploading demo video:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('heaven-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading demo video:', error);
    return null;
  }
}

// HEAVEN Storage Functions
// Store slideshow videos/photos for voice cloning and avatar creation

/**
 * Upload slideshow video to Supabase Storage
 * @param file - Video file blob
 * @param userId - User ID or session ID
 * @param memorialId - Memorial/order ID
 */
export async function uploadSlideshowVideo(
  file: File | Blob,
  userId: string,
  memorialId: string
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileName = `slideshow-videos/${userId}/${memorialId}-${Date.now()}.mp4`;
    
    const { data, error } = await supabase.storage
      .from('heaven-assets')
      .upload(fileName, file, {
        contentType: file.type || 'video/mp4',
        upsert: false
      });

    if (error) {
      console.error('Error uploading video:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('heaven-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading slideshow video:', error);
    return null;
  }
}

/**
 * Upload primary photo to Supabase Storage
 * @param file - Photo file blob
 * @param userId - User ID or session ID
 * @param memorialId - Memorial/order ID
 */
export async function uploadPrimaryPhoto(
  file: File | Blob,
  userId: string,
  memorialId: string
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileName = `primary-photos/${userId}/${memorialId}-${Date.now()}.jpg`;
    
    const { data, error } = await supabase.storage
      .from('heaven-assets')
      .upload(fileName, file, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Error uploading photo:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('heaven-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading primary photo:', error);
    return null;
  }
}

/**
 * Upload extracted audio to Supabase Storage
 * @param audioBlob - Audio file blob
 * @param userId - User ID or session ID
 * @param memorialId - Memorial/order ID
 */
export async function uploadExtractedAudio(
  audioBlob: Blob,
  userId: string,
  memorialId: string
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const fileName = `extracted-audio/${userId}/${memorialId}-${Date.now()}.mp3`;
    
    const { data, error } = await supabase.storage
      .from('heaven-assets')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: false
      });

    if (error) {
      console.error('Error uploading audio:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('heaven-assets')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading extracted audio:', error);
    return null;
  }
}

/**
 * Store HEAVEN character data (voiceId, avatarId) in Supabase
 */
export async function storeHeavenCharacter(data: {
  userId: string;
  memorialId: string;
  voiceId: string;
  avatarId: string;
  slideshowVideoUrl?: string;
  primaryPhotoUrl?: string;
}) {
  if (!supabase) return null;
  try {
    const { data: character, error } = await supabase
      .from('heaven_characters')
      .insert({
        user_id: data.userId,
        memorial_id: data.memorialId,
        voice_id: data.voiceId,
        avatar_id: data.avatarId,
        slideshow_video_url: data.slideshowVideoUrl,
        primary_photo_url: data.primaryPhotoUrl,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing HEAVEN character:', error);
      return null;
    }

    return character;
  } catch (error) {
    console.error('Error storing HEAVEN character:', error);
    return null;
  }
}

/**
 * Get HEAVEN character data from Supabase
 */
export async function getHeavenCharacter(userId: string, memorialId: string) {
  if (!supabase) return null;
  try {
    const { data: character, error } = await supabase
      .from('heaven_characters')
      .select('*')
      .eq('user_id', userId)
      .eq('memorial_id', memorialId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error getting HEAVEN character:', error);
      return null;
    }

    return character;
  } catch (error) {
    console.error('Error getting HEAVEN character:', error);
    return null;
  }
}

/**
 * Upload slideshow photo/video to Supabase Storage for permanent storage
 * @param file - Photo or video file
 * @param userId - User ID or session ID
 * @param memorialId - Memorial/order ID (optional, can use session ID)
 * @param index - Photo index in slideshow
 */
export async function uploadSlideshowMedia(
  file: File | Blob,
  userId: string,
  memorialId?: string,
  index?: number
): Promise<string | null> {
  if (!supabase) return null;
  try {
    const isVideo = file.type?.startsWith('video/');
    const extension = isVideo ? 'mp4' : 'jpg';
    const folder = isVideo ? 'slideshow-videos' : 'slideshow-photos';
    const fileName = `${folder}/${userId}/${memorialId || 'session'}-${index || Date.now()}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('memorials')
      .upload(fileName, file, {
        contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
        upsert: false
      });

    if (error) {
      console.error('Error uploading slideshow media:', error);
      return null;
    }

    // Get public URL (permanent, accessible forever)
    const { data: { publicUrl } } = supabase.storage
      .from('memorials')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading slideshow media:', error);
    return null;
  }
}

/**
 * Store slideshow media metadata in database
 */
export async function storeSlideshowMedia(
  userId: string,
  memorialId: string,
  mediaItems: Array<{
    url: string;
    preview?: string;
    type: 'photo' | 'video';
    date?: string;
    muxPlaybackId?: string;
  }>
) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('slideshow_media')
      .insert({
        user_id: userId,
        memorial_id: memorialId,
        media_items: mediaItems,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing slideshow media:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error storing slideshow media:', error);
    return null;
  }
}

/**
 * Get slideshow media from database
 */
export async function getSlideshowMedia(userId: string, memorialId: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('slideshow_media')
      .select('*')
      .eq('user_id', userId)
      .eq('memorial_id', memorialId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error getting slideshow media:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting slideshow media:', error);
    return null;
  }
}

/**
 * OTP Code Management Functions
 * Store and verify OTP codes for phone number authentication
 */

/**
 * Store OTP code in Supabase
 * @param phoneNumber - Formatted phone number (e.g., +15551234567)
 * @param code - 6-digit verification code
 * @param expiresAt - Expiration timestamp (milliseconds since epoch)
 */
export async function storeOTPCode(phoneNumber: string, code: string, expiresAt: number) {
  if (!supabase) return { success: false, error: 'Supabase not configured' };
  
  try {
    // First, delete any existing codes for this phone number
    await supabase
      .from('otp_codes')
      .delete()
      .eq('phone_number', phoneNumber);

    // Insert new code
    const { data, error } = await supabase
      .from('otp_codes')
      .insert({
        phone_number: phoneNumber,
        code: code,
        expires_at: new Date(expiresAt).toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing OTP code:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error storing OTP code:', error);
    return { success: false, error };
  }
}

/**
 * Verify OTP code from Supabase
 * @param phoneNumber - Formatted phone number
 * @param code - Code to verify
 * @returns Success status and error message if failed
 */
export async function verifyOTPCode(phoneNumber: string, code: string) {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    // Get the most recent code for this phone number
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('phone_number', phoneNumber)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, error: 'Code not found. Please request a new code.' };
    }

    // Check expiration
    const expiresAt = new Date(data.expires_at).getTime();
    if (Date.now() > expiresAt) {
      // Delete expired code
      await supabase
        .from('otp_codes')
        .delete()
        .eq('id', data.id);
      return { success: false, error: 'Code expired. Please request a new code.' };
    }

    // Verify code
    if (data.code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }

    // Code verified - delete it (one-time use)
    await supabase
      .from('otp_codes')
      .delete()
      .eq('id', data.id);

    return { success: true };
  } catch (error: any) {
    console.error('Error verifying OTP code:', error);
    return { success: false, error: error.message || 'Failed to verify code' };
  }
}

/**
 * Clean up expired OTP codes (can be called periodically)
 */
export async function cleanupExpiredOTPCodes() {
  if (!supabase) return { success: false, error: 'Supabase not configured' };

  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('otp_codes')
      .delete()
      .lt('expires_at', now);

    if (error) {
      console.error('Error cleaning up expired OTP codes:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error cleaning up expired OTP codes:', error);
    return { success: false, error };
  }
}

