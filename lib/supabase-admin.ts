// Server-side only — never import this from a "use client" file.
// Uses the service role key so it can update orders even when there's no
// logged-in user session (e.g. Safaricom's webhook calling our callback).
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
