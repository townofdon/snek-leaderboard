import { createClient } from '@supabase/supabase-js'

import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_PROJECT_URL } from './constants';
import { Database } from './types/supabaseTypes'

export const supabase = createClient<Database>(
  SUPABASE_PROJECT_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);
