import { describe, expect, it } from 'vitest';
import { tenantThemeCss } from '@/lib/tenant/theme';
import type { TenantTheme } from '@/lib/tenant/types';

const base: TenantTheme = {
  primary: '#FBC02D',
  onPrimary: '#1B1813',
  accent: '#C8201B',
  accentDark: '#E0352F',
  charcoal: '#1F1D1A',
};

describe('tenantThemeCss', () => {
  it('emits brand variables for light and dark', () => {
    const css = tenantThemeCss(base);
    expect(css).toContain('--brand-primary:#FBC02D');
    expect(css).toContain('prefers-color-scheme: dark');
    expect(css).toContain('--brand-accent:#E0352F');
  });
  it('rejects anything that is not a hex color', () => {
    const css = tenantThemeCss({ ...base, primary: 'red;}</style><script>alert(1)</script>' as `#${string}` });
    expect(css).not.toContain('script');
    expect(css).toContain('--brand-primary:#FBC02D');
  });
});
