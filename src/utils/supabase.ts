import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ftgrrlkjavcumjkyyyva.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.warn('⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Supabase features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for DASH
export async function createMemorial(data: any) {
  const { data: memorial, error } = await supabase
    .from('memorials')
    .insert(data)
    .select()
    .single();
  
  return { memorial, error };
}

export async function getMemorial(id: string) {
  const { data: memorial, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', id)
    .single();
  
  return { memorial, error };
}

export async function updateMemorial(id: string, updates: any) {
  const { data: memorial, error } = await supabase
    .from('memorials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { memorial, error };
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


