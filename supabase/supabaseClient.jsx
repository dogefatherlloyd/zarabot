import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabaseClient = createPagesBrowserClient();

// Named export
export const supabase = supabaseClient;

// Default export
export default supabaseClient;