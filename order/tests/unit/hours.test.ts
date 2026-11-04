import { describe, expect, it } from 'vitest';
import { isOpenAt, storeStatus } from '@/lib/pickup/asap';
import type { OpeningHours, Tenant } from '@/lib/tenant/types';

const closed: OpeningHours = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
const TZ = 'Africa/Cairo';
// 2026-11-04 is a Wednesday (3). Cairo is UTC+2 in November.
const cairo = (iso: string) => new Date(`${iso}+02:00`);

describe('isOpenAt', () => {
  it('handles a same-day window', () => {
    const hours = { ...closed, 3: [{ open: '08:00', close: '23:00' }] } as OpeningHours;
    expect(isOpenAt(hours, TZ, cairo('2026-11-04T07:59'))).toBe(false);
    expect(isOpenAt(hours, TZ, cairo('2026-11-04T08:00'))).toBe(true);
    expect(isOpenAt(hours, TZ, cairo('2026-11-04T22:59'))).toBe(true);
    expect(isOpenAt(hours, TZ, cairo('2026-11-04T23:00'))).toBe(false);
  });

  it('handles 24:00 as end of day', () => {
    const hours = { ...closed, 3: [{ open: '00:00', close: '24:00' }] } as OpeningHours;
    expect(isOpenAt(hours, TZ, cairo('2026-11-04T23:59'))).toBe(true);
    expect(isOpenAt(hours, TZ, cairo('2026-11-05T00:01'))).toBe(false);
  });

  it('handles a window past midnight from the previous day', () => {
    const hours = { ...closed, 3: [{ open: '18:00', close: '02:00' }] } as OpeningHours;
    expect(isOpenAt(hours, TZ, cairo('2026-11-04T19:00'))).toBe(true);
    expect(isOpenAt(hours, TZ, cairo('2026-11-05T01:30'))).toBe(true); // Thursday, from Wednesday's window
    expect(isOpenAt(hours, TZ, cairo('2026-11-05T02:00'))).toBe(false);
    expect(isOpenAt(hours, TZ, cairo('2026-11-04T01:30'))).toBe(false); // Tuesday had no window
  });

  it('uses the tenant timezone, not UTC', () => {
    const hours = { ...closed, 3: [{ open: '08:00', close: '09:00' }] } as OpeningHours;
    // 06:30 UTC = 08:30 Cairo
    expect(isOpenAt(hours, TZ, new Date('2026-11-04T06:30:00Z'))).toBe(true);
  });
});

describe('storeStatus', () => {
  const tenant = {
    timezone: TZ,
    openingHours: { ...closed, 3: [{ open: '00:00', close: '24:00' }] },
    orderingPaused: false,
    pausedUntil: null,
  } as unknown as Tenant;
  const at = cairo('2026-11-04T12:00');

  it('is open, paused or closed', () => {
    expect(storeStatus(tenant, at)).toBe('open');
    expect(storeStatus({ ...tenant, orderingPaused: true }, at)).toBe('paused');
    expect(storeStatus({ ...tenant, orderingPaused: true, pausedUntil: '2026-11-04T09:00:00Z' }, at)).toBe('open');
    expect(storeStatus(tenant, cairo('2026-11-05T12:00'))).toBe('closed');
  });
});
