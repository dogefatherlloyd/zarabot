import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

// Explicitly pass the Supabase URL and Anon Key from environment variables
const supabaseClient = createPagesBrowserClient({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

// Named export
export const supabase = supabaseClient;

// Default export
export default supabaseClient;

console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("Supabase Anon Key:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
