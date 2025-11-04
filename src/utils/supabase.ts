import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

