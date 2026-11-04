-- Tenancy, membership and role helpers.
-- Every tenant-owned table carries tenant_id; RLS (see *_rls.sql) enforces isolation.

create type public.tenant_role as enum ('owner', 'staff');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create table public.tenants (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,39}$'),
  name_en             text not null check (length(name_en) between 1 and 80),
  name_ar             text not null check (length(name_ar) between 1 and 80),
  logo_url            text,
  theme               jsonb not null default '{}'::jsonb,
  timezone            text not null default 'Africa/Cairo',
  currency            text not null default 'EGP' check (currency = 'EGP'),
  -- {"0":[{"open":"08:00","close":"23:00"}], ...}, weekday 0 = Sunday, local time.
  opening_hours       jsonb not null default '{}'::jsonb,
  pickup_lead_minutes integer not null default 10 check (pickup_lead_minutes between 0 and 240),
  ordering_paused     boolean not null default false,
  paused_until        timestamptz,
  features            jsonb not null default '{}'::jsonb,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger tenants_updated_at before update on public.tenants
  for each row execute function public.set_updated_at();

create table public.tenant_domains (
  hostname   text primary key check (hostname = lower(hostname) and hostname !~ '[/:\s]'),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  created_at timestamptz not null default now()
);
create index tenant_domains_tenant_idx on public.tenant_domains (tenant_id);

create table public.tenant_members (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       public.tenant_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);
create index tenant_members_user_idx on public.tenant_members (user_id);
create trigger tenant_members_updated_at before update on public.tenant_members
  for each row execute function public.set_updated_at();

-- Platform operators (future super admin panel). Empty in v1.
create table public.platform_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Role helpers. SECURITY DEFINER so they can read membership tables regardless of the
-- caller's RLS, and so policies that call them do not recurse.

create function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins pa where pa.user_id = (select auth.uid())
  );
$$;

-- Owner or staff of the tenant (or a platform admin).
create function public.is_tenant_staff(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tenant_members m
    where m.tenant_id = p_tenant_id and m.user_id = (select auth.uid())
  ) or public.is_platform_admin();
$$;

-- Owner of the tenant (or a platform admin).
create function public.is_tenant_owner(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.tenant_members m
    where m.tenant_id = p_tenant_id and m.user_id = (select auth.uid()) and m.role = 'owner'
  ) or public.is_platform_admin();
$$;
