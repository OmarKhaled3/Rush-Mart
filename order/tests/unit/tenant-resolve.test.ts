import { describe, expect, it, vi } from 'vitest';
import { cachedLookup, fallbackForAllHosts, normalizeHost, resolveTenantSlug, type DomainLookup } from '@/lib/tenant/resolve';

const domains: Record<string, string> = { 'order.rushmart-eg.com': 'rushmart' };
const fakeLookup: DomainLookup = async (host) => domains[host] ?? null;

describe('normalizeHost', () => {
  it('lowercases and strips port and trailing dot', () => {
    expect(normalizeHost('Order.RushMart-EG.com:443')).toBe('order.rushmart-eg.com');
    expect(normalizeHost('order.rushmart-eg.com.')).toBe('order.rushmart-eg.com');
  });
  it('takes the first value of a comma list', () => {
    expect(normalizeHost('a.example.com, b.example.com')).toBe('a.example.com');
  });
  it('handles missing hosts', () => {
    expect(normalizeHost(null)).toBe('');
    expect(normalizeHost(undefined)).toBe('');
  });
});

describe('resolveTenantSlug', () => {
  it('maps a registered domain', async () => {
    expect(await resolveTenantSlug('order.rushmart-eg.com', fakeLookup, undefined)).toBe('rushmart');
  });
  it('falls back to the default slug on localhost and Vercel previews', async () => {
    expect(await resolveTenantSlug('localhost:3000', fakeLookup, 'rushmart')).toBe('rushmart');
    expect(await resolveTenantSlug('rush-order-git-x.vercel.app', fakeLookup, 'rushmart')).toBe('rushmart');
  });
  it('does not fall back on unknown production hosts', async () => {
    expect(await resolveTenantSlug('evil.example.com', fakeLookup, 'rushmart', false)).toBeNull();
  });
  it('falls back for any host only when explicitly allowed', async () => {
    expect(await resolveTenantSlug('tunnel.example.dev', fakeLookup, 'rushmart', true)).toBe('rushmart');
    expect(fallbackForAllHosts({ TENANT_FALLBACK_ALL_HOSTS: 'true' })).toBe(true);
    expect(fallbackForAllHosts({ TENANT_FALLBACK_ALL_HOSTS: 'true', VERCEL_ENV: 'production' })).toBe(false);
    expect(fallbackForAllHosts({})).toBe(false);
  });
  it('returns null on localhost when no default is configured', async () => {
    expect(await resolveTenantSlug('localhost:3000', fakeLookup, undefined)).toBeNull();
  });
  it('returns null for an empty host without a lookup', async () => {
    const lookup = vi.fn(fakeLookup);
    expect(await resolveTenantSlug('', lookup, 'rushmart')).toBeNull();
    expect(lookup).not.toHaveBeenCalled();
  });
});

describe('cachedLookup', () => {
  it('caches hits and misses until their TTL expires', async () => {
    let t = 0;
    const inner = vi.fn(fakeLookup);
    const lookup = cachedLookup(inner, { hitTtlMs: 100, missTtlMs: 50, now: () => t });

    expect(await lookup('order.rushmart-eg.com')).toBe('rushmart');
    expect(await lookup('order.rushmart-eg.com')).toBe('rushmart');
    expect(await lookup('nope.example.com')).toBeNull();
    expect(await lookup('nope.example.com')).toBeNull();
    expect(inner).toHaveBeenCalledTimes(2);

    t = 60; // miss expired, hit still fresh
    await lookup('nope.example.com');
    await lookup('order.rushmart-eg.com');
    expect(inner).toHaveBeenCalledTimes(3);
  });

  it('evicts the oldest entry when full', async () => {
    const inner = vi.fn(fakeLookup);
    const lookup = cachedLookup(inner, { maxEntries: 2 });
    await lookup('a.test');
    await lookup('b.test');
    await lookup('c.test'); // evicts a.test
    await lookup('a.test');
    expect(inner).toHaveBeenCalledTimes(4);
  });
});
