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


