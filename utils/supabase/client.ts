import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client (used by the login form + sign-out button).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
