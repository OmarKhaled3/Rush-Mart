import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from './database.types';
import { AUTH_COOKIE_NAME, supabasePublishableKey, supabaseUrl } from './env';

/** The session lives in `${AUTH_COOKIE_NAME}` (chunked as `.0`, `.1`, ... when large). */
export function hasSupabaseSession(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name === AUTH_COOKIE_NAME || c.name.startsWith(`${AUTH_COOKIE_NAME}.`));
}

/**
 * Refreshes an expiring session and writes the new cookies onto `response`.
 * Skipped entirely for visitors without a session, so browsing the menu costs nothing.
 */
export async function refreshSupabaseSession(request: NextRequest, response: NextResponse) {
  if (!hasSupabaseSession(request)) return;

  const supabase = createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
    cookieOptions: { name: AUTH_COOKIE_NAME },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });
  await supabase.auth.getClaims();
}
