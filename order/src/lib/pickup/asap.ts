import type { OpeningHours, Tenant } from '@/lib/tenant/types';

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

/** Weekday (0 = Sunday) and minutes since midnight for `at`, on the wall clock of `timeZone`. */
export function localClock(at: Date, timeZone: string): { weekday: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(at);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { weekday, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/**
 * Mirrors `public.hours_open_at` in SQL. close <= open means the window runs past midnight.
 * The database is the source of truth; this is for showing open/closed in the UI.
 */
export function isOpenAt(hours: OpeningHours, timeZone: string, at: Date): boolean {
  const { weekday, minutes } = localClock(at, timeZone);
  const prev = ((weekday + 6) % 7) as keyof OpeningHours;

  for (const w of hours[weekday as keyof OpeningHours] ?? []) {
    const open = toMinutes(w.open);
    const close = toMinutes(w.close);
    if (close > open ? minutes >= open && minutes < close : minutes >= open) return true;
  }
  for (const w of hours[prev] ?? []) {
    const open = toMinutes(w.open);
    const close = toMinutes(w.close);
    if (close <= open && minutes < close) return true;
  }
  return false;
}

export type StoreStatus = 'open' | 'paused' | 'closed';

export function storeStatus(tenant: Tenant, at: Date = new Date()): StoreStatus {
  const paused = tenant.orderingPaused && (!tenant.pausedUntil || new Date(tenant.pausedUntil) > at);
  if (paused) return 'paused';
  return isOpenAt(tenant.openingHours, tenant.timezone, at) ? 'open' : 'closed';
}
