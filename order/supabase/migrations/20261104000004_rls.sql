-- Row Level Security. App users only ever SELECT; every write goes through a
-- SECURITY DEFINER function that checks the caller's role (see *_rpcs.sql).

alter table public.tenants              enable row level security;
alter table public.tenant_domains       enable row level security;
alter table public.tenant_members       enable row level security;
alter table public.platform_admins      enable row level security;
alter table public.categories           enable row level security;
alter table public.items                enable row level security;
alter table public.item_variants        enable row level security;
alter table public.modifier_groups      enable row level security;
alter table public.modifier_options     enable row level security;
alter table public.item_modifier_groups enable row level security;
alter table public.orders               enable row level security;
alter table public.order_items          enable row level security;
alter table public.order_counters       enable row level security;

-- Belt and braces: no direct writes from the API roles, whatever the policies say.
revoke insert, update, delete, truncate on all tables in schema public from anon, authenticated;
revoke all on public.order_counters from anon, authenticated;
alter default privileges in schema public revoke insert, update, delete, truncate on tables from anon, authenticated;

-- Tenant config and domains: public, active tenants only.
create policy tenants_public_read on public.tenants
  for select to anon, authenticated
  using (is_active or public.is_tenant_staff(id));

create policy tenant_domains_public_read on public.tenant_domains
  for select to anon, authenticated
  using (exists (select 1 from public.tenants t where t.id = tenant_id and t.is_active));

-- Membership: your own rows; owners see their team.
create policy tenant_members_read on public.tenant_members
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_tenant_owner(tenant_id));

create policy platform_admins_self_read on public.platform_admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- Menu: public reads active rows; staff also see inactive rows (stock screen).
create policy categories_read on public.categories
  for select to anon, authenticated
  using (is_active or public.is_tenant_staff(tenant_id));

create policy items_read on public.items
  for select to anon, authenticated
  using (is_active or public.is_tenant_staff(tenant_id));

create policy item_variants_read on public.item_variants
  for select to anon, authenticated
  using (true);

create policy modifier_groups_read on public.modifier_groups
  for select to anon, authenticated
  using (true);

create policy modifier_options_read on public.modifier_options
  for select to anon, authenticated
  using (true);

create policy item_modifier_groups_read on public.item_modifier_groups
  for select to anon, authenticated
  using (true);

-- Orders: the customer who placed it, or that tenant's staff.
create policy orders_read on public.orders
  for select to authenticated
  using (customer_id = (select auth.uid()) or public.is_tenant_staff(tenant_id));

create policy order_items_read on public.order_items
  for select to authenticated
  using (
    public.is_tenant_staff(tenant_id)
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.customer_id = (select auth.uid())
    )
  );

-- order_counters: no policies, no grants. Only SECURITY DEFINER functions touch it.
