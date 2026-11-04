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

/** hostname -> tenant slug, or null when no active tenant owns the host. */
export type DomainLookup = (hostname: string) => Promise<string | null>;

type Entry = { slug: string | null; expires: number };

/**
 * Wraps a lookup with a small in-memory TTL cache (per server instance). Unknown hosts are
 * cached too, so random Host headers cannot hammer the database.
 */
export function cachedLookup(
  lookup: DomainLookup,
  { hitTtlMs = 60_000, missTtlMs = 30_000, maxEntries = 500, now = Date.now } = {},
): DomainLookup {
  const cache = new Map<string, Entry>();
  return async (hostname) => {
    const hit = cache.get(hostname);
    if (hit && hit.expires > now()) return hit.slug;

    const slug = await lookup(hostname);
    if (cache.size >= maxEntries) cache.delete(cache.keys().next().value!);
    cache.set(hostname, { slug, expires: now() + (slug ? hitTtlMs : missTtlMs) });
    return slug;
  };
}

/** Looks the host up in `tenant_domains` through PostgREST (RLS only exposes active tenants). */
export function postgrestDomainLookup(url: string, apiKey: string): DomainLookup {
  return async (hostname) => {
    const endpoint = new URL('/rest/v1/tenant_domains', url);
    endpoint.searchParams.set('select', 'tenant:tenants(slug)');
    endpoint.searchParams.set('hostname', `eq.${hostname}`);
    const res = await fetch(endpoint, { headers: { apikey: apiKey, accept: 'application/json' } });
    if (!res.ok) throw new Error(`tenant lookup failed: ${res.status}`);
    const rows = (await res.json()) as { tenant: { slug: string } | null }[];
    return rows[0]?.tenant?.slug ?? null;
  };
}

/**
 * Hostname -> tenant slug, or null when the host belongs to no tenant.
 * localhost and *.vercel.app previews fall back to `defaultSlug` when the host is not registered.
 */
export async function resolveTenantSlug(
  rawHost: string | null | undefined,
  lookup: DomainLookup,
  defaultSlug: string | undefined = process.env.DEFAULT_TENANT_SLUG,
): Promise<string | null> {
  const host = normalizeHost(rawHost);
  if (!host) return null;

  const mapped = await lookup(host);
  if (mapped) return mapped;

  if (isDevOrPreviewHost(host) && defaultSlug) return defaultSlug;
  return null;
}
