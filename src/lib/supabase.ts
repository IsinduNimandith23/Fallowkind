import { createClient } from "@supabase/supabase-js";

// Server-only client — never import this in client components.
// Uses the service role key to bypass RLS.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
