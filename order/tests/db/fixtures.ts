import { randomUUID } from 'node:crypto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseEnv } from '../../supabase/seed/env';

export type Db = SupabaseClient<Database>;

const env = getSupabaseEnv();
if (!env.isLocal) {
  throw new Error('DB tests create and delete data; they only run against a local Supabase stack.');
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } } as const;

export const admin: Db = createClient<Database>(env.url, env.secretKey, opts);
export const publicClient = (): Db => createClient<Database>(env.url, env.publishableKey, opts);

const ALWAYS_OPEN: Record<string, { open: string; close: string }[]> = Object.fromEntries([0, 1, 2, 3, 4, 5, 6].map((d) => [String(d), [{ open: '00:00', close: '24:00' }]]));

function ok<R extends { data: unknown; error: { message: string } | null }>(res: R, what: string): NonNullable<R['data']> {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  if (res.data === null || res.data === undefined) throw new Error(`${what}: no data`);
  return res.data as NonNullable<R['data']>;
}

type Hours = Record<string, { open: string; close: string }[]>;

async function createTenant(label: string, openingHours: Hours) {
  const slug = `t-${label}-${randomUUID().slice(0, 8)}`;
  const row = ok(
    await admin
      .from('tenants')
      .insert({ slug, name_en: `Test ${label}`, name_ar: `تجربة ${label}`, opening_hours: openingHours, pickup_lead_minutes: 10 })
      .select('id')
      .single(),
    `tenant ${label}`,
  );
  return row.id;
}

/** A small menu: Latte (S 90 / L 110) with Milk (0..1) and Toppings (0..2); Croissant 70; out-of-stock Muffin. */
async function createMenu(tenantId: string) {
  const cat = ok(
    await admin.from('categories').insert({ tenant_id: tenantId, name_en: 'Coffee', name_ar: 'قهوة' }).select('id').single(),
    'category',
  );
  const items = ok(
    await admin
      .from('items')
      .insert([
        { tenant_id: tenantId, category_id: cat.id, name_en: 'Latte', name_ar: 'لاتيه', base_price: null, in_stock: true, sort: 0 },
        { tenant_id: tenantId, category_id: cat.id, name_en: 'Croissant', name_ar: 'كرواسان', base_price: 70, in_stock: true, sort: 1 },
        { tenant_id: tenantId, category_id: cat.id, name_en: 'Muffin', name_ar: 'مافن', base_price: 60, in_stock: false, sort: 2 },
      ])
      .select('id, name_en'),
    'items',
  );
  const id = (name: string) => items.find((i) => i.name_en === name)!.id;

  const variants = ok(
    await admin
      .from('item_variants')
      .insert([
        { tenant_id: tenantId, item_id: id('Latte'), name_en: 'Small', name_ar: 'صغير', price: 90, sort: 0 },
        { tenant_id: tenantId, item_id: id('Latte'), name_en: 'Large', name_ar: 'كبير', price: 110, sort: 1 },
      ])
      .select('id, name_en'),
    'variants',
  );

  const groups = ok(
    await admin
      .from('modifier_groups')
      .insert([
        { tenant_id: tenantId, name_en: 'Milk', name_ar: 'لبن', min_select: 0, max_select: 1, sort: 0 },
        { tenant_id: tenantId, name_en: 'Toppings', name_ar: 'إضافات', min_select: 0, max_select: 2, sort: 1 },
      ])
      .select('id, name_en'),
    'groups',
  );
  const group = (name: string) => groups.find((g) => g.name_en === name)!.id;

  const options = ok(
    await admin
      .from('modifier_options')
      .insert([
        { tenant_id: tenantId, group_id: group('Milk'), name_en: 'Full cream', name_ar: 'كامل', price_delta: 0, sort: 0 },
        { tenant_id: tenantId, group_id: group('Milk'), name_en: 'Oat', name_ar: 'شوفان', price_delta: 25, sort: 1 },
        { tenant_id: tenantId, group_id: group('Toppings'), name_en: 'Cream', name_ar: 'كريمة', price_delta: 25, sort: 0 },
      ])
      .select('id, name_en'),
    'options',
  );
  const option = (name: string) => options.find((o) => o.name_en === name)!.id;

  // Milk is linked to Latte only; Toppings is linked to nothing.
  ok(
    await admin
      .from('item_modifier_groups')
      .insert({ tenant_id: tenantId, item_id: id('Latte'), group_id: group('Milk'), sort: 0 })
      .select('item_id'),
    'links',
  );

  return {
    latte: id('Latte'),
    croissant: id('Croissant'),
    muffin: id('Muffin'),
    small: variants.find((v) => v.name_en === 'Small')!.id,
    large: variants.find((v) => v.name_en === 'Large')!.id,
    fullCream: option('Full cream'),
    oat: option('Oat'),
    cream: option('Cream'),
  };
}

const createdUsers: string[] = [];
const createdTenants: string[] = [];

async function passwordUser(label: string) {
  const email = `${label}-${randomUUID().slice(0, 8)}@test.local`;
  const password = `pw-${randomUUID()}`;
  const { data, error: createError } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (createError || !data.user) throw new Error(`user ${label}: ${createError?.message}`);
  const user = data.user;
  createdUsers.push(user.id);
  const client = publicClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`sign in ${label}: ${error.message}`);
  return { id: user.id, client };
}

async function anonymousUser(label: string) {
  const client = publicClient();
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) throw new Error(`anonymous sign in ${label}: ${error?.message}`);
  createdUsers.push(data.user.id);
  return { id: data.user.id, client };
}

async function addMember(tenantId: string, userId: string, role: 'owner' | 'staff') {
  ok(await admin.from('tenant_members').insert({ tenant_id: tenantId, user_id: userId, role }).select('id'), `member ${role}`);
}

export async function createFixture() {
  const tenantA = await createTenant('a', ALWAYS_OPEN);
  const tenantB = await createTenant('b', ALWAYS_OPEN);
  const tenantClosed = await createTenant('closed', {});
  createdTenants.push(tenantA, tenantB, tenantClosed);

  const menuA = await createMenu(tenantA);
  const menuB = await createMenu(tenantB);
  const menuClosed = await createMenu(tenantClosed);

  const ownerA = await passwordUser('owner-a');
  const staffA = await passwordUser('staff-a');
  const staffB = await passwordUser('staff-b');
  await addMember(tenantA, ownerA.id, 'owner');
  await addMember(tenantA, staffA.id, 'staff');
  await addMember(tenantB, staffB.id, 'staff');

  const regular = await passwordUser('customer'); // signed-in, non-anonymous customer
  const guest1 = await anonymousUser('guest-1');
  const guest2 = await anonymousUser('guest-2');

  return { tenantA, tenantB, tenantClosed, menuA, menuB, menuClosed, ownerA, staffA, staffB, regular, guest1, guest2 };
}

export async function destroyFixture() {
  for (const id of createdTenants) await admin.from('tenants').delete().eq('id', id);
  for (const id of createdUsers) await admin.auth.admin.deleteUser(id);
}

/** Today's date (YYYY-MM-DD) in a timezone, offset by `days`. */
export function localDate(timeZone: string, days = 0): string {
  const d = new Date(Date.now() + days * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** The UTC instant at which the wall clock in `timeZone` reads `date` `hh:mm`. */
export function zonedInstant(timeZone: string, date: string, hh: number, mm: number): Date {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  for (const offsetHours of [-1, 0, 1, 2, 3, 4]) {
    const candidate = new Date(guess - offsetHours * 3_600_000);
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(candidate);
    const get = (t: string) => parts.find((p) => p.type === t)!.value;
    if (`${get('year')}-${get('month')}-${get('day')}` === date && Number(get('hour')) === hh && Number(get('minute')) === mm) {
      return candidate;
    }
  }
  throw new Error(`Could not resolve ${date} ${hh}:${mm} in ${timeZone}`);
}
