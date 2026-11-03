import { describe, expect, it } from 'vitest';
import { normalizeHost, resolveTenantSlug } from '@/lib/tenant/resolve';

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
  it('maps a registered domain', () => {
    expect(resolveTenantSlug('order.rushmart-eg.com', undefined)).toBe('rushmart');
  });
  it('falls back to the default slug on localhost and Vercel previews', () => {
    expect(resolveTenantSlug('localhost:3000', 'rushmart')).toBe('rushmart');
    expect(resolveTenantSlug('rush-order-git-x.vercel.app', 'rushmart')).toBe('rushmart');
  });
  it('does not fall back on unknown production hosts', () => {
    expect(resolveTenantSlug('evil.example.com', 'rushmart')).toBeNull();
  });
  it('returns null on localhost when no default is configured', () => {
    expect(resolveTenantSlug('localhost:3000', undefined)).toBeNull();
  });
});
