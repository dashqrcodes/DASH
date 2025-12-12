import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
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

// Order functions
export async function createOrder(data: any) {
  const { data: order, error } = await supabase
    .from('orders')
    .insert(data)
    .select()
    .single();
  
  return { order, error };
}

export async function getOrder(id: string) {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  return { order, error };
}

export async function updateOrder(id: string, updates: any) {
  const { data: order, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  return { order, error };
}

// User functions
export async function createOrGetUser(data: { email?: string; phone?: string; name?: string }) {
  // Try to find existing user
  let query = supabase.from('users').select('*');
  
  if (data.email) {
    query = query.eq('email', data.email);
  } else if (data.phone) {
    query = query.eq('phone', data.phone);
  }
  
  const { data: existing } = await query.single();
  
  if (existing) {
    return { user: existing, error: null };
  }
  
  // Create new user
  const { data: user, error } = await supabase
    .from('users')
    .insert(data)
    .select()
    .single();
  
  return { user, error };
}

// Slideshow functions
export async function createSlideshow(data: any) {
  const { data: slideshow, error } = await supabase
    .from('slideshows')
    .insert(data)
    .select()
    .single();
  
  return { slideshow, error };
}

// Life Chapters functions
export async function createLifeChapter(data: any) {
  const { data: chapter, error } = await supabase
    .from('life_chapters')
    .insert(data)
    .select()
    .single();
  
  return { chapter, error };
}

export async function getLifeChapters(memorialId: string) {
  const { data: chapters, error } = await supabase
    .from('life_chapters')
    .select('*')
    .eq('memorial_id', memorialId)
    .order('chapter_order', { ascending: true });
  
  return { chapters, error };
}
