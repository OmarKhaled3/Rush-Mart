/** Public Supabase settings. Safe for the browser: RLS is the security boundary. */
export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return url;
}

/**
 * One cookie name for every client, so the session set in the browser is the one the server
 * reads even when the browser talks to Supabase through a different URL (see SUPABASE_PROXY_TARGET).
 */
export const AUTH_COOKIE_NAME = 'sb-rush-order-auth-token';

/**
 * URL the browser uses for Supabase. Defaults to NEXT_PUBLIC_SUPABASE_URL. A relative value such
 * as "/sb" (with SUPABASE_PROXY_TARGET set on the server) routes it through this app's origin,
 * for local previews where the browser cannot reach the local Supabase stack.
 */
export function supabaseBrowserUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SUPABASE_BROWSER_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configured) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  return configured.startsWith('/') ? `${window.location.origin}${configured}` : configured;
}

export function supabasePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set');
  return key;
}
