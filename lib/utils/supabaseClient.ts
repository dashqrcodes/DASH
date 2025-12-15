import { supabaseAdmin } from '../supabaseAdmin';

export function getSupabaseAdmin() {
  return supabaseAdmin;
}

export interface Story {
  id: string;
  slug: string;
  name: string;
  story_text?: string | null;
  photo_url?: string | null;
  mux_asset_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface StoryMoment {
  id: string;
  slug: string;
  person_slug: string;
  photo_url?: string | null;
  mux_asset_id?: string | null;
  caption?: string | null;
  product_type?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface StoryPreview {
  id: string;
  slug: string;
  person_slug: string;
  moment_slug: string;
  person_name: string;
  story_text?: string | null;
  product_type?: string | null;
  photo_url: string;
  photo_storage_key: string;
  video_asset_id: string;
  status: string;
  expires_at: string;
  created_at: string;
}
