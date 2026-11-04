-- Menu. Child rows reference their parent through (id, tenant_id) composite keys, so a row can
-- never point at another tenant's data even if application code gets a tenant id wrong.

create table public.categories (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  name_en    text not null,
  name_ar    text not null,
  sort       integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, tenant_id)
);
create index categories_tenant_sort_idx on public.categories (tenant_id, sort);

create table public.items (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenants (id) on delete cascade,
  category_id    uuid not null,
  name_en        text not null,
  name_ar        text not null,
  description_en text,
  description_ar text,
  image_path     text,
  -- Null when the item is sold by variant (Small / Large).
  base_price     numeric(10, 2) check (base_price >= 0),
  in_stock       boolean not null default true,
  is_active      boolean not null default true,
  sort           integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (category_id, tenant_id) references public.categories (id, tenant_id) on delete cascade
);
create index items_tenant_category_idx on public.items (tenant_id, category_id, sort);

create table public.item_variants (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  item_id    uuid not null,
  name_en    text not null,
  name_ar    text not null,
  price      numeric(10, 2) not null check (price >= 0),
  sort       integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (item_id, tenant_id) references public.items (id, tenant_id) on delete cascade
);
create index item_variants_item_idx on public.item_variants (item_id, sort);

create table public.modifier_groups (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  name_en    text not null,
  name_ar    text not null,
  min_select integer not null default 0 check (min_select >= 0),
  max_select integer not null default 1 check (max_select >= 1),
  sort       integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, tenant_id),
  check (min_select <= max_select)
);
create index modifier_groups_tenant_idx on public.modifier_groups (tenant_id);

create table public.modifier_options (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  group_id    uuid not null,
  name_en     text not null,
  name_ar     text not null,
  price_delta numeric(10, 2) not null default 0 check (price_delta >= 0),
  in_stock    boolean not null default true,
  sort        integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (group_id, tenant_id) references public.modifier_groups (id, tenant_id) on delete cascade
);
create index modifier_options_group_idx on public.modifier_options (group_id, sort);

create table public.item_modifier_groups (
  tenant_id  uuid not null references public.tenants (id) on delete cascade,
  item_id    uuid not null,
  group_id   uuid not null,
  sort       integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (item_id, group_id),
  foreign key (item_id, tenant_id) references public.items (id, tenant_id) on delete cascade,
  foreign key (group_id, tenant_id) references public.modifier_groups (id, tenant_id) on delete cascade
);
create index item_modifier_groups_group_idx on public.item_modifier_groups (group_id);

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger items_updated_at before update on public.items
  for each row execute function public.set_updated_at();
create trigger item_variants_updated_at before update on public.item_variants
  for each row execute function public.set_updated_at();
create trigger modifier_groups_updated_at before update on public.modifier_groups
  for each row execute function public.set_updated_at();
create trigger modifier_options_updated_at before update on public.modifier_options
  for each row execute function public.set_updated_at();
