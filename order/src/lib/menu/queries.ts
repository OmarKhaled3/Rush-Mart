import 'server-only';
import { cache } from 'react';
import { supabaseUrl } from '@/lib/supabase/env';
import { createSupabasePublicClient } from '@/lib/supabase/server';
import type { Menu, MenuCategory, MenuGroup, MenuItem } from './types';

const SELECT = `
  id, name_en, name_ar, sort,
  items (
    id, category_id, name_en, name_ar, description_en, description_ar, image_path,
    base_price, in_stock, is_active, sort,
    item_variants ( id, name_en, name_ar, price, sort ),
    item_modifier_groups (
      sort,
      modifier_groups ( id, name_en, name_ar, min_select, max_select, sort,
        modifier_options ( id, name_en, name_ar, price_delta, in_stock, sort ) )
    )
  )
`;

const bySort = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;

export function menuImageUrl(path: string | null): string | null {
  if (!path) return null;
  return `${supabaseUrl()}/storage/v1/object/public/menu-images/${path.split('/').map(encodeURIComponent).join('/')}`;
}

/** The tenant's active menu, as visitors see it (RLS applies). Cached per request. */
export const getMenu = cache(async (tenantId: string): Promise<Menu> => {
  const { data, error } = await createSupabasePublicClient()
    .from('categories')
    .select(SELECT)
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('sort');
  if (error) throw new Error(`Failed to load menu: ${error.message}`);

  const categories: MenuCategory[] = (data ?? []).map((c) => ({
    id: c.id,
    name: { en: c.name_en, ar: c.name_ar },
    items: [...c.items]
      .filter((i) => i.is_active)
      .sort(bySort)
      .map(
        (i): MenuItem => ({
          id: i.id,
          categoryId: i.category_id,
          name: { en: i.name_en, ar: i.name_ar },
          description:
            i.description_en || i.description_ar
              ? { en: i.description_en ?? '', ar: i.description_ar ?? i.description_en ?? '' }
              : null,
          imageUrl: menuImageUrl(i.image_path),
          basePrice: i.base_price,
          inStock: i.in_stock,
          variants: [...i.item_variants].sort(bySort).map((v) => ({
            id: v.id,
            name: { en: v.name_en, ar: v.name_ar },
            price: v.price,
          })),
          groups: [...i.item_modifier_groups]
            .sort(bySort)
            .flatMap((link) => (link.modifier_groups ? [link.modifier_groups] : []))
            .map(
              (g): MenuGroup => ({
                id: g.id,
                name: { en: g.name_en, ar: g.name_ar },
                minSelect: g.min_select,
                maxSelect: g.max_select,
                options: [...g.modifier_options].sort(bySort).map((o) => ({
                  id: o.id,
                  name: { en: o.name_en, ar: o.name_ar },
                  priceDelta: o.price_delta,
                  inStock: o.in_stock,
                })),
              }),
            ),
        }),
      ),
  }));

  return { categories: categories.filter((c) => c.items.length > 0) };
});
