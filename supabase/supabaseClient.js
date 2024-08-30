import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

const supabaseClient = createPagesBrowserClient();

// Default export
export default supabaseClient;