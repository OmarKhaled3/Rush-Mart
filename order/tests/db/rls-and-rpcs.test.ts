import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Insights } from '@/lib/insights/types';
import type { Json } from '@/lib/supabase/database.types';
import { admin, createFixture, destroyFixture, localDate, publicClient, zonedInstant } from './fixtures';

type Fixture = Awaited<ReturnType<typeof createFixture>>;
let f: Fixture;

const PHONE_GUEST = '+201001112223';
const PHONE_REGULAR = '+201223334445';
const TZ = 'Africa/Cairo';

beforeAll(async () => {
  f = await createFixture();
});

afterAll(async () => {
  await destroyFixture();
});

function order(items: object[], phone = PHONE_REGULAR): Json {
  return { customer_name: 'Test', customer_phone: phone, items } as unknown as Json;
}

describe('public reads', () => {
  it('lets anonymous visitors read the menu but no orders', async () => {
    const db = publicClient();
    const { data: items } = await db.from('items').select('id').eq('tenant_id', f.tenantA);
    expect(items?.length).toBe(3);
    const { data: orders } = await db.from('orders').select('id');
    expect(orders).toEqual([]);
  });

  it('does not let visitors call write RPCs without a session', async () => {
    const { error } = await publicClient().rpc('place_order', {
      p_tenant_id: f.tenantA,
      p_payload: order([{ item_id: f.menuA.croissant, quantity: 1 }]),
    });
    expect(error).not.toBeNull();
  });
});

describe('place_order', () => {
  let guestOrderId: string;

  it('computes prices in the database and ignores client prices', async () => {
    const { data, error } = await f.guest1.client.rpc('place_order', {
      p_tenant_id: f.tenantA,
      p_payload: order(
        [
          { item_id: f.menuA.latte, variant_id: f.menuA.large, quantity: 2, option_ids: [f.menuA.oat], unit_price: 1, line_total: 1 },
          { item_id: f.menuA.croissant, quantity: 1, price: 0 },
        ],
        PHONE_GUEST,
      ),
    });
    expect(error).toBeNull();
    const result = data as { id: string; order_number: number; total: number };
    // (110 + 25) * 2 + 70
    expect(result.total).toBe(340);
    expect(result.order_number).toBe(1);
    guestOrderId = result.id;

    const { data: lines } = await f.guest1.client
      .from('order_items')
      .select('name_en, variant_name_en, unit_price, quantity, line_total, modifiers')
      .eq('order_id', guestOrderId)
      .order('line_total', { ascending: false });
    expect(lines).toHaveLength(2);
    expect(lines![0]).toMatchObject({ name_en: 'Latte', variant_name_en: 'Large', unit_price: 135, quantity: 2, line_total: 270 });
    expect(lines![0]!.modifiers).toEqual([expect.objectContaining({ name_en: 'Oat', price_delta: 25 })]);
  });

  it('limits guests to one open order', async () => {
    const { error } = await f.guest1.client.rpc('place_order', {
      p_tenant_id: f.tenantA,
      p_payload: order([{ item_id: f.menuA.croissant, quantity: 1 }], PHONE_GUEST),
    });
    expect(error?.message).toBe('too_many_open_orders');
  });

  it('hides one customer’s order from another', async () => {
    const { data } = await f.guest2.client.from('orders').select('id').eq('id', guestOrderId);
    expect(data).toEqual([]);
    const { error } = await f.guest2.client.rpc('mark_outside', { p_order_id: guestOrderId });
    expect(error?.message).toBe('order_not_found');
  });

  it.each([
    ['an out-of-stock item', () => [{ item_id: f.menuA.muffin, quantity: 1 }], 'item_out_of_stock'],
    ['another tenant’s item', () => [{ item_id: f.menuB.croissant, quantity: 1 }], 'item_unavailable'],
    ['a missing variant', () => [{ item_id: f.menuA.latte, quantity: 1 }], 'invalid_variant'],
    ['a variant on a single-price item', () => [{ item_id: f.menuA.croissant, variant_id: f.menuA.small, quantity: 1 }], 'invalid_variant'],
    ['an option from an unlinked group', () => [{ item_id: f.menuA.latte, variant_id: f.menuA.small, quantity: 1, option_ids: [f.menuA.cream] }], 'invalid_option'],
    ['too many options in a group', () => [{ item_id: f.menuA.latte, variant_id: f.menuA.small, quantity: 1, option_ids: [f.menuA.oat, f.menuA.fullCream] }], 'invalid_option_selection'],
    ['a zero quantity', () => [{ item_id: f.menuA.croissant, quantity: 0 }], 'invalid_quantity'],
    ['a malformed id', () => [{ item_id: 'not-a-uuid', quantity: 1 }], 'invalid_payload'],
  ])('rejects %s', async (_label, items, code) => {
    const { error } = await f.regular.client.rpc('place_order', { p_tenant_id: f.tenantA, p_payload: order(items()) });
    expect(error?.message).toBe(code);
  });

  it('rejects an invalid phone number', async () => {
    const { error } = await f.regular.client.rpc('place_order', {
      p_tenant_id: f.tenantA,
      p_payload: order([{ item_id: f.menuA.croissant, quantity: 1 }], '01001234567'),
    });
    expect(error?.message).toBe('invalid_phone');
  });

  it('rejects orders while the store is paused, and accepts them again after resuming', async () => {
    expect((await f.staffA.client.rpc('set_ordering_paused', { p_tenant_id: f.tenantA, p_paused: true, p_minutes: 15 })).error).toBeNull();
    const paused = await f.regular.client.rpc('place_order', {
      p_tenant_id: f.tenantA,
      p_payload: order([{ item_id: f.menuA.croissant, quantity: 1 }]),
    });
    expect(paused.error?.message).toBe('store_paused');
    expect((await f.staffA.client.rpc('set_ordering_paused', { p_tenant_id: f.tenantA, p_paused: false })).error).toBeNull();
  });

  it('rejects orders outside opening hours', async () => {
    const { error } = await f.regular.client.rpc('place_order', {
      p_tenant_id: f.tenantClosed,
      p_payload: order([{ item_id: f.menuClosed.croissant, quantity: 1 }]),
    });
    expect(error?.message).toBe('store_closed');
  });

  it('limits signed-in customers to three open orders', async () => {
    for (let i = 0; i < 3; i++) {
      const { error } = await f.regular.client.rpc('place_order', {
        p_tenant_id: f.tenantA,
        p_payload: order([{ item_id: f.menuA.croissant, quantity: 1 }]),
      });
      expect(error).toBeNull();
    }
    const { error } = await f.regular.client.rpc('place_order', {
      p_tenant_id: f.tenantA,
      p_payload: order([{ item_id: f.menuA.croissant, quantity: 1 }]),
    });
    expect(error?.message).toBe('too_many_open_orders');
  });
});

describe('order lifecycle and staff permissions', () => {
  let guestOrderId: string;

  beforeAll(async () => {
    const { data } = await f.guest1.client.from('orders').select('id').limit(1).single();
    guestOrderId = data!.id;
  });

  it('blocks customers from writing orders directly or changing status', async () => {
    const direct = await f.guest1.client.from('orders').update({ total: 0 }).eq('id', guestOrderId);
    expect(direct.error).not.toBeNull();
    const rpc = await f.guest1.client.rpc('set_order_status', { p_order_id: guestOrderId, p_status: 'collected' });
    expect(rpc.error?.message).toBe('forbidden');
  });

  it('isolates staff to their own tenant', async () => {
    const { data } = await f.staffB.client.from('orders').select('id').eq('tenant_id', f.tenantA);
    expect(data).toEqual([]);
    const status = await f.staffB.client.rpc('set_order_status', { p_order_id: guestOrderId, p_status: 'preparing' });
    expect(status.error?.message).toBe('forbidden');
    const stock = await f.staffB.client.rpc('set_item_stock', { p_item_id: f.menuA.croissant, p_in_stock: false });
    expect(stock.error?.message).toBe('forbidden');
    const pause = await f.staffB.client.rpc('set_ordering_paused', { p_tenant_id: f.tenantA, p_paused: true });
    expect(pause.error?.message).toBe('forbidden');
  });

  it('lets staff see their tenant’s orders', async () => {
    const { data } = await f.staffA.client.from('orders').select('id').eq('tenant_id', f.tenantA);
    expect(data?.length).toBe(4);
  });

  it('enforces the status machine and stamps timestamps', async () => {
    const skip = await f.staffA.client.rpc('set_order_status', { p_order_id: guestOrderId, p_status: 'ready' });
    expect(skip.error?.message).toBe('invalid_status_transition');

    for (const status of ['preparing', 'ready'] as const) {
      expect((await f.staffA.client.rpc('set_order_status', { p_order_id: guestOrderId, p_status: status })).error).toBeNull();
    }
    const { data } = await f.staffA.client.from('orders').select('status, preparing_at, ready_at').eq('id', guestOrderId).single();
    expect(data).toMatchObject({ status: 'ready' });
    expect(data!.preparing_at).not.toBeNull();
    expect(data!.ready_at).not.toBeNull();
  });

  it('lets the customer flag they are outside, visible to staff', async () => {
    expect((await f.guest1.client.rpc('mark_outside', { p_order_id: guestOrderId, p_car_description: ' Red Kia, plate 123 ' })).error).toBeNull();
    const { data } = await f.staffA.client.from('orders').select('is_outside, car_description').eq('id', guestOrderId).single();
    expect(data).toEqual({ is_outside: true, car_description: 'Red Kia, plate 123' });
  });

  it('does not allow moving a final order', async () => {
    expect((await f.staffA.client.rpc('set_order_status', { p_order_id: guestOrderId, p_status: 'collected' })).error).toBeNull();
    const again = await f.staffA.client.rpc('set_order_status', { p_order_id: guestOrderId, p_status: 'cancelled' });
    expect(again.error?.message).toBe('invalid_status_transition');
    const outside = await f.guest1.client.rpc('mark_outside', { p_order_id: guestOrderId });
    expect(outside.error?.message).toBe('order_not_found');
  });

  it('lets staff toggle stock and the customer menu reflects it', async () => {
    expect((await f.staffA.client.rpc('set_item_stock', { p_item_id: f.menuA.croissant, p_in_stock: false })).error).toBeNull();
    const { data } = await publicClient().from('items').select('in_stock').eq('id', f.menuA.croissant).single();
    expect(data?.in_stock).toBe(false);
    expect((await f.staffA.client.rpc('set_item_stock', { p_item_id: f.menuA.croissant, p_in_stock: true })).error).toBeNull();
    expect((await f.staffA.client.rpc('set_option_stock', { p_option_id: f.menuA.oat, p_in_stock: false })).error).toBeNull();
    expect((await f.staffA.client.rpc('set_option_stock', { p_option_id: f.menuA.oat, p_in_stock: true })).error).toBeNull();
  });
});

describe('owner-only: insights and store settings', () => {
  it('blocks staff from insights', async () => {
    const { error } = await f.staffA.client.rpc('tenant_insights', {
      p_tenant_id: f.tenantA,
      p_from: localDate(TZ, -7),
      p_to: localDate(TZ),
    });
    expect(error?.message).toBe('forbidden');
  });

  it('blocks staff from changing store settings, by RPC or directly', async () => {
    const rpc = await f.staffA.client.rpc('update_store_settings', { p_tenant_id: f.tenantA, p_pickup_lead_minutes: 30 });
    expect(rpc.error?.message).toBe('forbidden');
    const direct = await f.staffA.client.from('tenants').update({ pickup_lead_minutes: 30 }).eq('id', f.tenantA);
    expect(direct.error).not.toBeNull();
    const { data } = await admin.from('tenants').select('pickup_lead_minutes').eq('id', f.tenantA).single();
    expect(data?.pickup_lead_minutes).toBe(10);
  });

  it('blocks customers and other tenants’ staff from insights', async () => {
    for (const client of [f.regular.client, f.staffB.client]) {
      const { error } = await client.rpc('tenant_insights', { p_tenant_id: f.tenantA, p_from: localDate(TZ), p_to: localDate(TZ) });
      expect(error?.message).toBe('forbidden');
    }
  });

  it('lets the owner update settings, with validation', async () => {
    const hours = { '0': [{ open: '08:00', close: '02:00' }], '5': [{ open: '10:00', close: '24:00' }] };
    const okRes = await f.ownerA.client.rpc('update_store_settings', {
      p_tenant_id: f.tenantA,
      p_pickup_lead_minutes: 15,
      p_opening_hours: hours,
    });
    expect(okRes.error).toBeNull();
    const bad = await f.ownerA.client.rpc('update_store_settings', {
      p_tenant_id: f.tenantA,
      p_opening_hours: { '0': [{ open: '25:00', close: '26:00' }] },
    });
    expect(bad.error?.message).toBe('invalid_opening_hours');
    // Restore 24/7 so nothing else depends on the clock.
    const allDay = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [String(d), [{ open: '00:00', close: '24:00' }]]));
    expect((await f.ownerA.client.rpc('update_store_settings', { p_tenant_id: f.tenantA, p_opening_hours: allDay })).error).toBeNull();
  });

  it('returns correct insights for the owner', async () => {
    // Cancel one of the regular customer's three open orders.
    const { data: open } = await f.staffA.client
      .from('orders')
      .select('id')
      .eq('tenant_id', f.tenantA)
      .eq('customer_phone', PHONE_REGULAR)
      .limit(1)
      .single();
    expect((await f.staffA.client.rpc('set_order_status', { p_order_id: open!.id, p_status: 'cancelled' })).error).toBeNull();

    const today = localDate(TZ);
    const { data, error } = await f.ownerA.client.rpc('tenant_insights', { p_tenant_id: f.tenantA, p_from: today, p_to: today });
    expect(error).toBeNull();
    const ins = data as unknown as Insights;

    // 1 guest order (collected, 340) + 3 regular orders (1 cancelled).
    expect(ins.timezone).toBe(TZ);
    expect(ins.placed).toBe(4);
    expect(ins.cancelled).toBe(1);
    expect(ins.orders).toBe(3);
    expect(ins.collected).toBe(1);
    expect(ins.revenue).toBe(340);
    expect(ins.avg_order_value).toBe(340);
    expect(ins.cancellation_rate).toBe(0.25);
    expect(ins.customers).toBe(2);
    expect(ins.repeat_customers).toBe(1); // the regular customer has 2 non-cancelled orders
    expect(ins.avg_prep_seconds).not.toBeNull();
    expect(ins.orders_by_hour).toHaveLength(24);
    expect(ins.orders_by_hour.reduce((a, b) => a + b, 0)).toBe(3);
    expect(ins.top_items[0]).toMatchObject({ name_en: 'Croissant', quantity: 3 });
    expect(ins.top_items[1]).toMatchObject({ name_en: 'Latte', quantity: 2, revenue: 270 });
  });

  it('uses Africa/Cairo day boundaries', async () => {
    // An order at 23:30 Cairo time yesterday belongs to yesterday, in the 23:00 bucket,
    // even though it may be "today" in UTC.
    const yesterday = localDate(TZ, -1);
    const at = zonedInstant(TZ, yesterday, 23, 30).toISOString();
    const { error: insertError } = await admin.from('orders').insert({
      tenant_id: f.tenantA,
      customer_id: f.regular.id,
      order_number: 999,
      status: 'collected',
      pickup_at: at,
      customer_name: 'Late',
      customer_phone: '+201009998887',
      subtotal: 50,
      total: 50,
      created_at: at,
      received_at: at,
    });
    expect(insertError).toBeNull();

    const y = await f.ownerA.client.rpc('tenant_insights', { p_tenant_id: f.tenantA, p_from: yesterday, p_to: yesterday });
    const yIns = y.data as unknown as Insights;
    expect(yIns.placed).toBe(1);
    expect(yIns.revenue).toBe(50);
    expect(yIns.orders_by_hour[23]).toBe(1);

    const today = localDate(TZ);
    const t = await f.ownerA.client.rpc('tenant_insights', { p_tenant_id: f.tenantA, p_from: today, p_to: today });
    expect((t.data as unknown as Insights).placed).toBe(4);
  });

  it('rejects invalid ranges', async () => {
    const { error } = await f.ownerA.client.rpc('tenant_insights', {
      p_tenant_id: f.tenantA,
      p_from: localDate(TZ),
      p_to: localDate(TZ, -1),
    });
    expect(error?.message).toBe('invalid_range');
  });
});
