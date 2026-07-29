import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fallback.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "fallback";

  return createBrowserClient(url, key);
}
