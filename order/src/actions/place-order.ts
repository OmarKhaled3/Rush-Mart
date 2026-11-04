'use server';

import { z } from 'zod';
import { normalizeEgyptMobile } from '@/lib/phone';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getTenant } from '@/lib/tenant/get-tenant';

/** Error codes raised by `public.place_order`, plus app-side ones. Each has a translation in `Errors`. */
const KNOWN_ERRORS = [
  'not_authenticated',
  'tenant_not_found',
  'store_paused',
  'store_closed',
  'invalid_name',
  'invalid_phone',
  'invalid_notes',
  'invalid_items',
  'invalid_payload',
  'too_many_open_orders',
  'invalid_quantity',
  'item_unavailable',
  'item_out_of_stock',
  'invalid_variant',
  'invalid_option',
  'option_out_of_stock',
  'invalid_option_selection',
] as const;

export type PlaceOrderError = (typeof KNOWN_ERRORS)[number] | 'unknown';

export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: number }
  | { ok: false; error: PlaceOrderError };

const Input = z.object({
  customerName: z.string().trim().min(1).max(60),
  customerPhone: z.string().trim().min(1).max(30),
  notes: z.string().trim().max(280).optional(),
  lines: z
    .array(
      z.object({
        itemId: z.uuid(),
        variantId: z.uuid().nullable(),
        optionIds: z.array(z.uuid()).max(20),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
});

export type PlaceOrderInput = z.input<typeof Input>;

export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const parsed = Input.safeParse(input);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ok: false, error: field === 'customerName' ? 'invalid_name' : field === 'customerPhone' ? 'invalid_phone' : 'invalid_items' };
  }
  const phone = normalizeEgyptMobile(parsed.data.customerPhone);
  if (!phone) return { ok: false, error: 'invalid_phone' };

  // Tenant comes from the hostname (proxy), never from the client.
  const tenant = await getTenant();
  const supabase = await createSupabaseServerClient();

  const { data: claims } = await supabase.auth.getClaims();
  if (!claims) return { ok: false, error: 'not_authenticated' };

  const { data, error } = await supabase.rpc('place_order', {
    p_tenant_id: tenant.id,
    p_payload: {
      customer_name: parsed.data.customerName,
      customer_phone: phone,
      notes: parsed.data.notes || null,
      items: parsed.data.lines.map((l) => ({
        item_id: l.itemId,
        variant_id: l.variantId,
        option_ids: l.optionIds,
        quantity: l.quantity,
      })),
    },
  });

  if (error) {
    const code = (KNOWN_ERRORS as readonly string[]).includes(error.message) ? (error.message as PlaceOrderError) : 'unknown';
    if (code === 'unknown') console.error('place_order failed', error);
    return { ok: false, error: code };
  }

  const result = data as { id: string; order_number: number };
  return { ok: true, orderId: result.id, orderNumber: result.order_number };
}
