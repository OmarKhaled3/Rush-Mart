import type { OpeningHours, Tenant } from './types';

/**
 * Temporary in-code tenant registry for step 1.
 * Step 2 replaces this with the `tenants` and `tenant_domains` tables in Supabase;
 * the shapes here intentionally match those tables.
 */

const ALWAYS_OPEN: OpeningHours = {
  0: [{ open: '00:00', close: '24:00' }],
  1: [{ open: '00:00', close: '24:00' }],
  2: [{ open: '00:00', close: '24:00' }],
  3: [{ open: '00:00', close: '24:00' }],
  4: [{ open: '00:00', close: '24:00' }],
  5: [{ open: '00:00', close: '24:00' }],
  6: [{ open: '00:00', close: '24:00' }],
};

export const STUB_TENANTS: Record<string, Tenant> = {
  rushmart: {
    id: '00000000-0000-4000-8000-000000000001',
    slug: 'rushmart',
    nameEn: 'Rush Mart',
    nameAr: 'رش مارت',
    logoUrl: '/brand/rushmart-logo.png',
    theme: {
      primary: '#FBC02D',
      onPrimary: '#1B1813',
      accent: '#C8201B',
      accentDark: '#E0352F',
      charcoal: '#1F1D1A',
    },
    timezone: 'Africa/Cairo',
    currency: 'EGP',
    openingHours: ALWAYS_OPEN,
    pickupLeadMinutes: 10,
    orderingPaused: false,
    pausedUntil: null,
    features: { phoneOtp: false },
    isActive: true,
  },
};

/** hostname (no port, lowercase) -> tenant slug. Mirrors `tenant_domains`. */
export const STUB_DOMAINS: Record<string, string> = {
  'order.rushmart-eg.com': 'rushmart',
};
