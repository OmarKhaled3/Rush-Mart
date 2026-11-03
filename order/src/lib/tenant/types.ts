/** Hex color, validated before it is ever written into CSS. */
export type HexColor = `#${string}`;

/** Brand colors a tenant can override. Surfaces and text tones stay in globals.css. */
export type TenantTheme = {
  /** Primary CTA (Rush Mart: yellow). */
  primary: HexColor;
  /** Text on primary. */
  onPrimary: HexColor;
  /** Alerts, "I'm outside", destructive (Rush Mart: red). */
  accent: HexColor;
  /** Accent used in dark mode, usually a touch brighter. */
  accentDark: HexColor;
  /** Brand charcoal used for headers and the dark surface base. */
  charcoal: HexColor;
};

/** "HH:MM" in the tenant timezone. "24:00" is allowed as a close time. */
export type TimeOfDay = `${number}:${number}`;
export type OpeningWindow = { open: TimeOfDay; close: TimeOfDay };
/** Keyed by weekday, 0 = Sunday. An empty array means closed that day. */
export type OpeningHours = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, OpeningWindow[]>;

export type TenantFeatures = {
  phoneOtp: boolean;
};

/** Mirrors the `tenants` table (step 2). camelCase in app code, snake_case in SQL. */
export type Tenant = {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  logoUrl: string | null;
  theme: TenantTheme;
  timezone: string;
  currency: 'EGP';
  openingHours: OpeningHours;
  pickupLeadMinutes: number;
  orderingPaused: boolean;
  pausedUntil: string | null;
  features: TenantFeatures;
  isActive: boolean;
};
