import { createBrowserClient } from "@supabase/ssr";

// Build-time stub: a recursive no-op proxy that safely handles any
// property access or method call (e.g. supabase.auth.getUser()) without
// throwing, so Next.js static prerendering won't crash.
const buildStubHandler: ProxyHandler<any> = {
  get: () =>
    new Proxy(() => Promise.resolve({ data: null, error: null }), buildStubHandler),
  apply: () => Promise.resolve({ data: null, error: null }),
};

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During static generation the env vars may be absent — return a
  // harmless stub so the build doesn't crash. At runtime the real
  // values are always present.
  if (!url || !key) {
    return new Proxy({}, buildStubHandler) as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(url, key);
}
