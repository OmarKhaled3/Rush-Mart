import { describe, expect, it } from 'vitest';
import { mapTenant, type TenantRow } from '@/lib/tenant/map';

const row: TenantRow = {
  id: 't1',
  slug: 'rushmart',
  name_en: 'Rush Mart',
  name_ar: 'رش مارت',
  logo_url: null,
  theme: { primary: '#000000' },
  timezone: 'Africa/Cairo',
  currency: 'EGP',
  opening_hours: { '1': [{ open: '08:00', close: '23:00' }] },
  pickup_lead_minutes: 10,
  ordering_paused: false,
  paused_until: null,
  features: {},
  is_active: true,
  created_at: '',
  updated_at: '',
};

describe('mapTenant', () => {
  it('merges theme overrides over defaults', () => {
    const t = mapTenant(row);
    expect(t.theme.primary).toBe('#000000');
    expect(t.theme.accent).toBe('#C8201B');
  });
  it('fills every weekday, empty when closed', () => {
    const t = mapTenant(row);
    expect(t.openingHours[1]).toEqual([{ open: '08:00', close: '23:00' }]);
    expect(t.openingHours[0]).toEqual([]);
    expect(Object.keys(t.openingHours)).toHaveLength(7);
  });
  it('defaults features', () => {
    expect(mapTenant(row).features.phoneOtp).toBe(false);
  });
});
