import { execFileSync } from 'node:child_process';

export type SupabaseEnv = { url: string; publishableKey: string; secretKey: string; isLocal: boolean };

/**
 * Supabase URL and keys for scripts and DB tests.
 * Uses NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_SECRET_KEY when set,
 * otherwise asks the local CLI stack (`supabase status`), so local dev needs no config.
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (url && publishableKey && secretKey) {
    return { url, publishableKey, secretKey, isLocal: isLocalUrl(url) };
  }

  let status: Record<string, string>;
  try {
    const out = execFileSync('npx', ['supabase', 'status', '-o', 'json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    status = JSON.parse(out.slice(out.indexOf('{')));
  } catch {
    throw new Error(
      'Supabase env not set and no local stack found. Run `npm run db:start`, or set ' +
        'NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and SUPABASE_SECRET_KEY.',
    );
  }

  const localUrl = status.API_URL;
  const localPublishable = status.PUBLISHABLE_KEY ?? status.ANON_KEY;
  const localSecret = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY;
  if (!localUrl || !localPublishable || !localSecret) {
    throw new Error('Could not read URL and keys from `supabase status`.');
  }
  return { url: localUrl, publishableKey: localPublishable, secretKey: localSecret, isLocal: true };
}

export function isLocalUrl(url: string): boolean {
  const host = new URL(url).hostname;
  return host === '127.0.0.1' || host === 'localhost' || host === '::1';
}
