-- Orders. Customers never write these tables directly; see place_order and friends.

create type public.order_status as enum ('received', 'preparing', 'ready', 'collected', 'cancelled');
create type public.pickup_type as enum ('asap', 'scheduled');  -- v1 only uses 'asap'
create type public.payment_method as enum ('pay_at_pickup');    -- 'paymob' etc. in v2
create type public.payment_status as enum ('unpaid', 'paid', 'refunded', 'failed');

create table public.orders (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants (id) on delete cascade,
  customer_id          uuid not null references auth.users (id) on delete cascade,
  -- Short number staff call out. Restarts daily per tenant (local time).
  order_number         integer not null check (order_number > 0),
  status               public.order_status not null default 'received',
  pickup_type          public.pickup_type not null default 'asap',
  pickup_at            timestamptz not null,
  customer_name        text not null check (length(customer_name) between 1 and 60),
  -- E.164, Egyptian mobile: +201[0125]XXXXXXXX
  customer_phone       text not null check (customer_phone ~ '^\+201[0125][0-9]{8}$'),
  notes                text check (length(notes) <= 280),
  subtotal             numeric(10, 2) not null check (subtotal >= 0),
  total                numeric(10, 2) not null check (total >= 0),
  payment_method       public.payment_method not null default 'pay_at_pickup',
  payment_status       public.payment_status not null default 'unpaid',
  payment_provider_ref text,
  is_outside           boolean not null default false,
  outside_at           timestamptz,
  car_description      text check (length(car_description) <= 80),
  received_at          timestamptz not null default now(),
  preparing_at         timestamptz,
  ready_at             timestamptz,
  collected_at         timestamptz,
  cancelled_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (id, tenant_id)
);
create index orders_tenant_status_idx on public.orders (tenant_id, status, created_at desc);
create index orders_tenant_created_idx on public.orders (tenant_id, created_at);
create index orders_customer_idx on public.orders (customer_id, created_at desc);

create table public.order_items (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants (id) on delete cascade,
  order_id        uuid not null,
  -- Kept for insights and v2 reorder; nulled if the menu row is deleted. Snapshots below stay.
  item_id         uuid references public.items (id) on delete set null,
  variant_id      uuid references public.item_variants (id) on delete set null,
  name_en         text not null,
  name_ar         text not null,
  variant_name_en text,
  variant_name_ar text,
  unit_price      numeric(10, 2) not null check (unit_price >= 0),
  quantity        integer not null check (quantity between 1 and 20),
  -- [{"option_id": uuid, "name_en": text, "name_ar": text, "price_delta": number}]
  modifiers       jsonb not null default '[]'::jsonb,
  line_total      numeric(10, 2) not null check (line_total >= 0),
  created_at      timestamptz not null default now(),
  foreign key (order_id, tenant_id) references public.orders (id, tenant_id) on delete cascade
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_tenant_item_idx on public.order_items (tenant_id, item_id);

create table public.order_counters (
  tenant_id   uuid not null references public.tenants (id) on delete cascade,
  day         date not null,
  last_number integer not null default 0,
  primary key (tenant_id, day)
);

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Status machine: received -> preparing -> ready -> collected; cancel from any open state.
-- Also stamps the matching *_at column.
create function public.orders_status_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if not (
    (old.status = 'received'  and new.status in ('preparing', 'cancelled')) or
    (old.status = 'preparing' and new.status in ('ready', 'cancelled')) or
    (old.status = 'ready'     and new.status in ('collected', 'cancelled'))
  ) then
    raise exception 'invalid_status_transition'
      using detail = format('%s -> %s', old.status, new.status);
  end if;

  case new.status
    when 'preparing' then new.preparing_at := now();
    when 'ready'     then new.ready_at     := now();
    when 'collected' then new.collected_at := now();
    when 'cancelled' then new.cancelled_at := now();
    else null;
  end case;

  return new;
end;
$$;

create trigger orders_status_guard before update of status on public.orders
  for each row execute function public.orders_status_guard();
