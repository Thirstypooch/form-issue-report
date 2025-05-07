import { createClient } from "supabase";

// Check if environment variables are available
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);