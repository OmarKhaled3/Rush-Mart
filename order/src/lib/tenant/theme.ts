import type { TenantTheme } from './types';

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function safe(color: string, fallback: string): string {
  return HEX.test(color) ? color : fallback;
}

/**
 * CSS custom properties for a tenant's brand colors. Values come from the database,
 * so every color is validated as a hex literal before it reaches a <style> tag.
 */
export function tenantThemeCss(theme: TenantTheme): string {
  const primary = safe(theme.primary, '#FBC02D');
  const onPrimary = safe(theme.onPrimary, '#1B1813');
  const accent = safe(theme.accent, '#C8201B');
  const accentDark = safe(theme.accentDark, accent);
  const charcoal = safe(theme.charcoal, '#1F1D1A');

  return [
    `:root{--brand-primary:${primary};--brand-on-primary:${onPrimary};--brand-accent:${accent};--brand-charcoal:${charcoal};}`,
    `@media (prefers-color-scheme: dark){:root{--brand-accent:${accentDark};}}`,
  ].join('');
}
