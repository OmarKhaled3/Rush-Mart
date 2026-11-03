import { STUB_DOMAINS } from './stub';

/** Request header the proxy sets. Client-supplied values are always overwritten. */
export const TENANT_HEADER = 'x-tenant-slug';

/** Lowercase, strip port and a trailing dot. Returns '' for a missing host. */
export function normalizeHost(host: string | null | undefined): string {
  if (!host) return '';
  const first = host.split(',')[0] ?? '';
  return first.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

/** Hosts where we fall back to DEFAULT_TENANT_SLUG: local dev and Vercel previews. */
export function isDevOrPreviewHost(host: string): boolean {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host.endsWith('.localhost') ||
    host.endsWith('.vercel.app')
  );
}

/**
 * Hostname -> tenant slug, or null when the host belongs to no tenant.
 * Step 2 swaps the lookup for `tenant_domains` (with a short in-memory cache).
 */
export function resolveTenantSlug(
  rawHost: string | null | undefined,
  defaultSlug: string | undefined = process.env.DEFAULT_TENANT_SLUG,
): string | null {
  const host = normalizeHost(rawHost);
  if (!host) return null;

  const mapped = STUB_DOMAINS[host];
  if (mapped) return mapped;

  if (isDevOrPreviewHost(host) && defaultSlug) return defaultSlug;
  return null;
}
