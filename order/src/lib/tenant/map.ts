import type { Database } from '@/lib/supabase/database.types';
import type { OpeningHours, Tenant, TenantFeatures, TenantTheme } from './types';

export type TenantRow = Database['public']['Tables']['tenants']['Row'];

const DEFAULT_THEME: TenantTheme = {
  primary: '#FBC02D',
  onPrimary: '#1B1813',
  accent: '#C8201B',
  accentDark: '#E0352F',
  charcoal: '#1F1D1A',
};

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/** DB row -> app type. jsonb columns are merged over safe defaults. */
export function mapTenant(row: TenantRow): Tenant {
  const theme = { ...DEFAULT_THEME, ...asObject(row.theme) } as TenantTheme;
  const features = { phoneOtp: false, ...asObject(row.features) } as TenantFeatures;
  const hours = asObject(row.opening_hours);
  const openingHours = Object.fromEntries(
    [0, 1, 2, 3, 4, 5, 6].map((d) => [d, Array.isArray(hours[String(d)]) ? hours[String(d)] : []]),
  ) as OpeningHours;

  return {
    id: row.id,
    slug: row.slug,
    nameEn: row.name_en,
    nameAr: row.name_ar,
    logoUrl: row.logo_url,
    theme,
    timezone: row.timezone,
    currency: 'EGP',
    openingHours,
    pickupLeadMinutes: row.pickup_lead_minutes,
    orderingPaused: row.ordering_paused,
    pausedUntil: row.paused_until,
    features,
    isActive: row.is_active,
  };
}
