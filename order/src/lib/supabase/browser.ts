'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { AUTH_COOKIE_NAME, supabaseBrowserUrl } from './env';

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

/** Singleton browser client (Realtime, anonymous sign-in). */
export function getSupabaseBrowserClient() {
  client ??= createBrowserClient<Database>(supabaseBrowserUrl(), process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { name: AUTH_COOKIE_NAME },
  });
  return client;
}
