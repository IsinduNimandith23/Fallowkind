import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const clientOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
};

// Singleton for all data queries (.from, .storage, .rpc, .auth.admin.*).
// Never call signInWithPassword / refreshSession / verifyOtp on this —
// those leave the user's JWT in the client's in-memory session, which
// flips subsequent .from() calls from service-role to that user's role
// and trips RLS. Use createAuthClient() for session-creating auth calls.
export const supabase = createClient(url, serviceKey, clientOptions);

export function createAuthClient() {
  return createClient(url, serviceKey, clientOptions);
}
