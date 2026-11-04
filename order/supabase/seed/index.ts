/**
 * Seeds Rush Mart (tenant #1): tenant config, domain, menu, modifier groups, and an owner and a
 * staff login.
 *
 *   npm run db:seed                 # local stack, or whatever the env vars point at
 *   npm run db:seed -- --reset-menu # wipe and rebuild this tenant's menu
 *
 * Safe to re-run. The menu is only built when the tenant has no categories yet (or with
 * --reset-menu), so stock toggles and dashboard edits survive a re-run.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/supabase/database.types';
import { getSupabaseEnv } from './env';
import { categories, modifierGroups, type ModifierGroupKey } from './rushmart-menu';

type Admin = SupabaseClient<Database>;

const TENANT = {
  slug: 'rushmart',
  name_en: 'Rush Mart',
  name_ar: 'رش مارت',
  logo_url: '/brand/rushmart-logo.png',
  timezone: 'Africa/Cairo',
  pickup_lead_minutes: 10,
  theme: {
    primary: '#FBC02D',
    onPrimary: '#1B1813',
    accent: '#C8201B',
    accentDark: '#E0352F',
    charcoal: '#1F1D1A',
  },
  // Open 24/7.
  opening_hours: Object.fromEntries(
    [0, 1, 2, 3, 4, 5, 6].map((d) => [String(d), [{ open: '00:00', close: '24:00' }]]),
  ),
  features: { phoneOtp: false },
};

const DOMAINS = ['order.rushmart-eg.com'];

const LOCAL_DEFAULTS = {
  ownerEmail: 'owner@rushmart.test',
  ownerPassword: 'rushmart-owner-local',
  staffEmail: 'staff@rushmart.test',
  staffPassword: 'rushmart-staff-local',
};

function must<T>(value: T | null | undefined, what: string): T {
  if (value === null || value === undefined) throw new Error(`Seed failed: ${what}`);
  return value;
}

function check(error: { message: string } | null, what: string) {
  if (error) throw new Error(`Seed failed (${what}): ${error.message}`);
}

function credentials(isLocal: boolean) {
  const env = {
    ownerEmail: process.env.SEED_OWNER_EMAIL,
    ownerPassword: process.env.SEED_OWNER_PASSWORD,
    staffEmail: process.env.SEED_STAFF_EMAIL,
    staffPassword: process.env.SEED_STAFF_PASSWORD,
  };
  if (isLocal) {
    return {
      ownerEmail: env.ownerEmail ?? LOCAL_DEFAULTS.ownerEmail,
      ownerPassword: env.ownerPassword ?? LOCAL_DEFAULTS.ownerPassword,
      staffEmail: env.staffEmail ?? LOCAL_DEFAULTS.staffEmail,
      staffPassword: env.staffPassword ?? LOCAL_DEFAULTS.staffPassword,
    };
  }
  // Hosted: everything must be set explicitly, and no short passwords.
  for (const [key, value] of Object.entries(env)) {
    if (!value) throw new Error(`Seeding a hosted project requires ${key} (see .env.example).`);
  }
  for (const pw of [env.ownerPassword!, env.staffPassword!]) {
    if (pw.length < 12) throw new Error('Seed passwords for a hosted project must be at least 12 characters.');
  }
  return env as typeof LOCAL_DEFAULTS;
}

async function upsertTenant(db: Admin): Promise<string> {
  const { data, error } = await db
    .from('tenants')
    .upsert(TENANT, { onConflict: 'slug' })
    .select('id')
    .single();
  check(error, 'tenant');
  const tenantId = must(data, 'tenant row').id;

  const { error: domainError } = await db
    .from('tenant_domains')
    .upsert(DOMAINS.map((hostname) => ({ hostname, tenant_id: tenantId })), { onConflict: 'hostname' });
  check(domainError, 'domains');
  return tenantId;
}

async function seedMenu(db: Admin, tenantId: string, reset: boolean) {
  const { count, error: countError } = await db
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId);
  check(countError, 'count categories');

  if (count && !reset) {
    console.log(`  menu: ${count} categories already present, skipping (use --reset-menu to rebuild)`);
    return;
  }
  if (reset) {
    // Cascades to items, variants, options and links. Past order lines keep their snapshots.
    check((await db.from('categories').delete().eq('tenant_id', tenantId)).error, 'reset categories');
    check((await db.from('modifier_groups').delete().eq('tenant_id', tenantId)).error, 'reset modifier groups');
  }

  // Modifier groups and options.
  const groupIds = new Map<ModifierGroupKey, string>();
  let groupSort = 0;
  for (const [key, group] of Object.entries(modifierGroups) as [ModifierGroupKey, (typeof modifierGroups)[ModifierGroupKey]][]) {
    const { data, error } = await db
      .from('modifier_groups')
      .insert({
        tenant_id: tenantId,
        name_en: group.nameEn,
        name_ar: group.nameAr,
        min_select: group.minSelect,
        max_select: group.maxSelect,
        sort: groupSort++,
      })
      .select('id')
      .single();
    check(error, `modifier group ${key}`);
    const groupId = must(data, key).id;
    groupIds.set(key, groupId);

    const { error: optError } = await db.from('modifier_options').insert(
      group.options.map((o, i) => ({
        tenant_id: tenantId,
        group_id: groupId,
        name_en: o.nameEn,
        name_ar: o.nameAr,
        price_delta: o.priceDelta,
        sort: i,
      })),
    );
    check(optError, `options for ${key}`);
  }

  // Categories, items, variants, item -> group links.
  let itemCount = 0;
  for (const [catSort, cat] of categories.entries()) {
    const { data: catRow, error: catError } = await db
      .from('categories')
      .insert({ tenant_id: tenantId, name_en: cat.nameEn, name_ar: cat.nameAr, sort: catSort })
      .select('id')
      .single();
    check(catError, `category ${cat.key}`);
    const categoryId = must(catRow, cat.key).id;

    const { data: itemRows, error: itemError } = await db
      .from('items')
      .insert(
        cat.items.map((item, i) => ({
          tenant_id: tenantId,
          category_id: categoryId,
          name_en: item.nameEn,
          name_ar: item.nameAr,
          description_en: item.descriptionEn ?? null,
          description_ar: item.descriptionAr ?? null,
          base_price: item.variants?.length ? null : must(item.price, `price for ${item.nameEn}`),
          sort: i,
        })),
      )
      .select('id, sort');
    check(itemError, `items in ${cat.key}`);
    const idBySort = new Map(must(itemRows, 'items').map((r) => [r.sort, r.id]));

    const variants = cat.items.flatMap((item, i) =>
      (item.variants ?? []).map((v, vi) => ({
        tenant_id: tenantId,
        item_id: idBySort.get(i)!,
        name_en: v.nameEn,
        name_ar: v.nameAr,
        price: v.price,
        sort: vi,
      })),
    );
    if (variants.length) check((await db.from('item_variants').insert(variants)).error, `variants in ${cat.key}`);

    const links = cat.items.flatMap((item, i) =>
      (item.groups ?? []).map((g, gi) => ({
        tenant_id: tenantId,
        item_id: idBySort.get(i)!,
        group_id: must(groupIds.get(g), `group ${g}`),
        sort: gi,
      })),
    );
    if (links.length) check((await db.from('item_modifier_groups').insert(links)).error, `links in ${cat.key}`);
    itemCount += cat.items.length;
  }
  console.log(`  menu: ${categories.length} categories, ${itemCount} items, ${groupIds.size} modifier groups`);
}

async function findUserByEmail(db: Admin, email: string) {
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    check(error, 'list users');
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < 200) return null;
  }
}

async function ensureMember(db: Admin, tenantId: string, email: string, password: string, role: 'owner' | 'staff') {
  let user = await findUserByEmail(db, email);
  if (!user) {
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
    check(error, `create ${role}`);
    user = must(data.user, `${role} user`);
    console.log(`  ${role}: created ${email}`);
  } else {
    console.log(`  ${role}: ${email} already exists (password unchanged)`);
  }
  const { error } = await db
    .from('tenant_members')
    .upsert({ tenant_id: tenantId, user_id: user.id, role }, { onConflict: 'tenant_id,user_id' });
  check(error, `${role} membership`);
}

async function main() {
  const env = getSupabaseEnv();
  const creds = credentials(env.isLocal);
  const db = createClient<Database>(env.url, env.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log(`Seeding ${env.isLocal ? 'local' : 'HOSTED'} Supabase at ${env.url}`);
  const tenantId = await upsertTenant(db);
  console.log(`  tenant: ${TENANT.slug} (${tenantId})`);
  await seedMenu(db, tenantId, process.argv.includes('--reset-menu'));
  await ensureMember(db, tenantId, creds.ownerEmail, creds.ownerPassword, 'owner');
  await ensureMember(db, tenantId, creds.staffEmail, creds.staffPassword, 'staff');
  console.log('Done.');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
