-- Write paths. Each function is SECURITY DEFINER with an explicit role check, an empty
-- search_path, and raises a short snake_case code the app maps to a translated message.

------------------------------------------------------------------------------------------
-- Opening hours
------------------------------------------------------------------------------------------

-- {"0":[{"open":"08:00","close":"23:00"}], ...}; weekday 0 = Sunday. close may be "24:00".
-- close <= open means the window runs past midnight into the next day.
create function public.validate_opening_hours(p_hours jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_key text;
  v_windows jsonb;
  v_w jsonb;
begin
  if p_hours is null or jsonb_typeof(p_hours) <> 'object' then
    return false;
  end if;
  for v_key, v_windows in select * from jsonb_each(p_hours) loop
    if v_key !~ '^[0-6]$' or jsonb_typeof(v_windows) <> 'array' or jsonb_array_length(v_windows) > 4 then
      return false;
    end if;
    for v_w in select * from jsonb_array_elements(v_windows) loop
      if jsonb_typeof(v_w) <> 'object'
         or coalesce(v_w ->> 'open', '') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
         or coalesce(v_w ->> 'close', '') !~ '^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$' then
        return false;
      end if;
    end loop;
  end loop;
  return true;
end;
$$;

create function public.hours_open_at(p_hours jsonb, p_timezone text, p_at timestamptz)
returns boolean
language plpgsql
stable
set search_path = ''
as $$
declare
  v_local timestamp := p_at at time zone p_timezone;
  v_dow   integer   := extract(dow from v_local)::integer;
  v_prev  integer   := (extract(dow from v_local)::integer + 6) % 7;
  v_t     time      := v_local::time;
  v_w     jsonb;
  v_open  time;
  v_close time;
begin
  -- Windows that start today.
  for v_w in select * from jsonb_array_elements(coalesce(p_hours -> v_dow::text, '[]'::jsonb)) loop
    v_open := (v_w ->> 'open')::time;
    v_close := (v_w ->> 'close')::time;
    if v_close > v_open then
      if v_t >= v_open and v_t < v_close then return true; end if;
    elsif v_t >= v_open then
      return true;  -- overnight window, before midnight
    end if;
  end loop;

  -- Overnight windows that started yesterday.
  for v_w in select * from jsonb_array_elements(coalesce(p_hours -> v_prev::text, '[]'::jsonb)) loop
    v_open := (v_w ->> 'open')::time;
    v_close := (v_w ->> 'close')::time;
    if v_close <= v_open and v_t < v_close then return true; end if;
  end loop;

  return false;
end;
$$;

alter table public.tenants
  add constraint tenants_opening_hours_valid check (public.validate_opening_hours(opening_hours));

create function public.ordering_is_paused(p_paused boolean, p_until timestamptz)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_paused and (p_until is null or p_until > now());
$$;

------------------------------------------------------------------------------------------
-- Customer: place_order
------------------------------------------------------------------------------------------

-- p_payload:
-- {
--   "customer_name": "Omar", "customer_phone": "+201001234567", "notes": "optional",
--   "items": [{ "item_id": uuid, "variant_id": uuid|null, "quantity": 1, "option_ids": [uuid] }]
-- }
-- Any price fields in the payload are ignored: prices come from the menu tables.
create function public.place_order(p_tenant_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid        uuid    := auth.uid();
  v_is_anon    boolean := coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false);
  v_tenant     public.tenants%rowtype;
  v_name       text    := btrim(p_payload ->> 'customer_name');
  v_phone      text    := btrim(p_payload ->> 'customer_phone');
  v_notes      text    := nullif(btrim(p_payload ->> 'notes'), '');
  v_lines      jsonb   := p_payload -> 'items';
  v_line       jsonb;
  v_item       record;
  v_variant_id uuid;
  v_variant_en text;
  v_variant_ar text;
  v_qty        integer;
  v_unit       numeric(10, 2);
  v_option_ids uuid[];
  v_delta      numeric(10, 2);
  v_mods       jsonb;
  v_out        jsonb := '[]'::jsonb;
  v_subtotal   numeric(10, 2) := 0;
  v_open_count integer;
  v_order_id   uuid;
  v_number     integer;
  v_pickup     timestamptz;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_tenant from public.tenants where id = p_tenant_id and is_active;
  if not found then
    raise exception 'tenant_not_found';
  end if;
  if public.ordering_is_paused(v_tenant.ordering_paused, v_tenant.paused_until) then
    raise exception 'store_paused';
  end if;
  if not public.hours_open_at(v_tenant.opening_hours, v_tenant.timezone, now()) then
    raise exception 'store_closed';
  end if;

  if v_name is null or length(v_name) not between 1 and 60 then
    raise exception 'invalid_name';
  end if;
  if v_phone is null or v_phone !~ '^\+201[0125][0-9]{8}$' then
    raise exception 'invalid_phone';
  end if;
  if v_notes is not null and length(v_notes) > 280 then
    raise exception 'invalid_notes';
  end if;
  if v_lines is null or jsonb_typeof(v_lines) <> 'array' or jsonb_array_length(v_lines) not between 1 and 30 then
    raise exception 'invalid_items';
  end if;

  -- One checkout at a time per customer and tenant, so the open-order limit cannot be raced.
  perform pg_advisory_xact_lock(hashtextextended(v_uid::text || ':' || p_tenant_id::text, 0));

  select count(*) into v_open_count
  from public.orders
  where tenant_id = p_tenant_id and customer_id = v_uid and status in ('received', 'preparing', 'ready');
  if v_open_count >= (case when v_is_anon then 1 else 3 end) then
    raise exception 'too_many_open_orders';
  end if;

  for v_line in select * from jsonb_array_elements(v_lines) loop
    v_qty := (v_line ->> 'quantity')::integer;
    if v_qty is null or v_qty not between 1 and 20 then
      raise exception 'invalid_quantity';
    end if;

    select i.id, i.name_en, i.name_ar, i.base_price, i.in_stock
      into v_item
    from public.items i
    join public.categories c on c.id = i.category_id
    where i.id = (v_line ->> 'item_id')::uuid
      and i.tenant_id = p_tenant_id
      and i.is_active
      and c.is_active;
    if not found then
      raise exception 'item_unavailable';
    end if;
    if not v_item.in_stock then
      raise exception 'item_out_of_stock' using detail = v_item.id::text;
    end if;

    -- Price: the chosen variant's price, or the item's single price.
    if exists (select 1 from public.item_variants where item_id = v_item.id) then
      select v.id, v.name_en, v.name_ar, v.price
        into v_variant_id, v_variant_en, v_variant_ar, v_unit
      from public.item_variants v
      where v.id = (v_line ->> 'variant_id')::uuid and v.item_id = v_item.id;
      if not found then
        raise exception 'invalid_variant';
      end if;
    else
      if v_line ->> 'variant_id' is not null or v_item.base_price is null then
        raise exception 'invalid_variant';
      end if;
      v_variant_id := null;
      v_variant_en := null;
      v_variant_ar := null;
      v_unit := v_item.base_price;
    end if;

    -- Modifiers: every option must belong to a group linked to this item.
    select coalesce(array_agg(distinct x::uuid), '{}')
      into v_option_ids
    from jsonb_array_elements_text(coalesce(v_line -> 'option_ids', '[]'::jsonb)) as x;

    if exists (
      select 1 from unnest(v_option_ids) as sel(option_id)
      where not exists (
        select 1
        from public.modifier_options mo
        join public.item_modifier_groups img on img.group_id = mo.group_id and img.item_id = v_item.id
        where mo.id = sel.option_id
      )
    ) then
      raise exception 'invalid_option';
    end if;

    if exists (select 1 from public.modifier_options where id = any (v_option_ids) and not in_stock) then
      raise exception 'option_out_of_stock';
    end if;

    if exists (
      select 1
      from public.item_modifier_groups img
      join public.modifier_groups g on g.id = img.group_id
      where img.item_id = v_item.id
        and (
          select count(*) from public.modifier_options mo
          where mo.group_id = g.id and mo.id = any (v_option_ids)
        ) not between g.min_select and g.max_select
    ) then
      raise exception 'invalid_option_selection';
    end if;

    select
      coalesce(sum(mo.price_delta), 0),
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'option_id', mo.id, 'group_id', mo.group_id,
            'name_en', mo.name_en, 'name_ar', mo.name_ar, 'price_delta', mo.price_delta
          ) order by g.sort, mo.sort
        ),
        '[]'::jsonb
      )
      into v_delta, v_mods
    from public.modifier_options mo
    join public.modifier_groups g on g.id = mo.group_id
    where mo.id = any (v_option_ids);

    v_unit := v_unit + v_delta;
    v_subtotal := v_subtotal + v_unit * v_qty;
    v_out := v_out || jsonb_build_object(
      'item_id', v_item.id, 'variant_id', v_variant_id,
      'name_en', v_item.name_en, 'name_ar', v_item.name_ar,
      'variant_name_en', v_variant_en, 'variant_name_ar', v_variant_ar,
      'unit_price', v_unit, 'quantity', v_qty, 'modifiers', v_mods,
      'line_total', v_unit * v_qty
    );
  end loop;

  insert into public.order_counters as oc (tenant_id, day, last_number)
  values (p_tenant_id, (now() at time zone v_tenant.timezone)::date, 1)
  on conflict (tenant_id, day) do update set last_number = oc.last_number + 1
  returning last_number into v_number;

  v_pickup := now() + make_interval(mins => v_tenant.pickup_lead_minutes);

  insert into public.orders (
    tenant_id, customer_id, order_number, pickup_type, pickup_at,
    customer_name, customer_phone, notes, subtotal, total
  ) values (
    p_tenant_id, v_uid, v_number, 'asap', v_pickup,
    v_name, v_phone, v_notes, v_subtotal, v_subtotal
  )
  returning id into v_order_id;

  insert into public.order_items (
    tenant_id, order_id, item_id, variant_id, name_en, name_ar,
    variant_name_en, variant_name_ar, unit_price, quantity, modifiers, line_total
  )
  select
    p_tenant_id, v_order_id, (l ->> 'item_id')::uuid, (l ->> 'variant_id')::uuid,
    l ->> 'name_en', l ->> 'name_ar', l ->> 'variant_name_en', l ->> 'variant_name_ar',
    (l ->> 'unit_price')::numeric, (l ->> 'quantity')::integer, l -> 'modifiers',
    (l ->> 'line_total')::numeric
  from jsonb_array_elements(v_out) as l;

  return jsonb_build_object(
    'id', v_order_id, 'order_number', v_number, 'pickup_at', v_pickup, 'total', v_subtotal
  );
exception
  when invalid_text_representation or numeric_value_out_of_range then
    raise exception 'invalid_payload';
end;
$$;

------------------------------------------------------------------------------------------
-- Customer: I'm outside
------------------------------------------------------------------------------------------

create function public.mark_outside(p_order_id uuid, p_car_description text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders
  set is_outside = true,
      outside_at = coalesce(outside_at, now()),
      car_description = nullif(btrim(left(p_car_description, 80)), '')
  where id = p_order_id
    and customer_id = (select auth.uid())
    and status in ('received', 'preparing', 'ready');
  if not found then
    raise exception 'order_not_found';
  end if;
end;
$$;

------------------------------------------------------------------------------------------
-- Staff (owner or staff)
------------------------------------------------------------------------------------------

create function public.set_order_status(p_order_id uuid, p_status public.order_status)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
  v_row public.orders%rowtype;
begin
  select tenant_id into v_tenant_id from public.orders where id = p_order_id;
  if v_tenant_id is null or not public.is_tenant_staff(v_tenant_id) then
    raise exception 'forbidden';
  end if;

  update public.orders set status = p_status where id = p_order_id returning * into v_row;

  return jsonb_build_object('id', v_row.id, 'status', v_row.status, 'updated_at', v_row.updated_at);
end;
$$;

create function public.set_item_stock(p_item_id uuid, p_in_stock boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
begin
  select tenant_id into v_tenant_id from public.items where id = p_item_id;
  if v_tenant_id is null or not public.is_tenant_staff(v_tenant_id) then
    raise exception 'forbidden';
  end if;
  update public.items set in_stock = p_in_stock where id = p_item_id;
end;
$$;

create function public.set_option_stock(p_option_id uuid, p_in_stock boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tenant_id uuid;
begin
  select tenant_id into v_tenant_id from public.modifier_options where id = p_option_id;
  if v_tenant_id is null or not public.is_tenant_staff(v_tenant_id) then
    raise exception 'forbidden';
  end if;
  update public.modifier_options set in_stock = p_in_stock where id = p_option_id;
end;
$$;

-- p_minutes null = paused until manually resumed.
create function public.set_ordering_paused(p_tenant_id uuid, p_paused boolean, p_minutes integer default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_tenant_staff(p_tenant_id) then
    raise exception 'forbidden';
  end if;
  if p_minutes is not null and p_minutes not between 1 and 720 then
    raise exception 'invalid_minutes';
  end if;
  update public.tenants
  set ordering_paused = p_paused,
      paused_until = case when p_paused and p_minutes is not null
                          then now() + make_interval(mins => p_minutes) end
  where id = p_tenant_id;
end;
$$;

------------------------------------------------------------------------------------------
-- Owner only
------------------------------------------------------------------------------------------

-- Null arguments leave that setting unchanged.
create function public.update_store_settings(
  p_tenant_id uuid,
  p_opening_hours jsonb default null,
  p_pickup_lead_minutes integer default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_tenant_owner(p_tenant_id) then
    raise exception 'forbidden';
  end if;
  if p_opening_hours is not null and not public.validate_opening_hours(p_opening_hours) then
    raise exception 'invalid_opening_hours';
  end if;
  if p_pickup_lead_minutes is not null and p_pickup_lead_minutes not between 0 and 240 then
    raise exception 'invalid_lead_time';
  end if;
  update public.tenants
  set opening_hours = coalesce(p_opening_hours, opening_hours),
      pickup_lead_minutes = coalesce(p_pickup_lead_minutes, pickup_lead_minutes)
  where id = p_tenant_id;
end;
$$;

-- Insights for [p_from, p_to] inclusive, as local calendar days in the tenant's timezone.
create function public.tenant_insights(p_tenant_id uuid, p_from date, p_to date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_tz     text;
  v_start  timestamptz;
  v_end    timestamptz;
  v_result jsonb;
begin
  if not public.is_tenant_owner(p_tenant_id) then
    raise exception 'forbidden';
  end if;
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 366 then
    raise exception 'invalid_range';
  end if;

  select timezone into v_tz from public.tenants where id = p_tenant_id;
  v_start := p_from::timestamp at time zone v_tz;
  v_end   := (p_to + 1)::timestamp at time zone v_tz;

  with o as (
    select * from public.orders
    where tenant_id = p_tenant_id and created_at >= v_start and created_at < v_end
  ),
  totals as (
    select
      count(*)                                                          as placed,
      count(*) filter (where status = 'cancelled')                      as cancelled,
      count(*) filter (where status = 'collected')                      as collected,
      coalesce(sum(total) filter (where status = 'collected'), 0)       as revenue,
      avg(extract(epoch from ready_at - received_at)) filter (where ready_at is not null) as avg_prep
    from o
  ),
  hours as (
    select jsonb_agg(coalesce(c.n, 0) order by h.hr) as by_hour
    from generate_series(0, 23) as h(hr)
    left join (
      select extract(hour from created_at at time zone v_tz)::integer as hr, count(*) as n
      from o where status <> 'cancelled' group by 1
    ) c on c.hr = h.hr
  ),
  top as (
    select coalesce(jsonb_agg(t order by t.quantity desc, t.revenue desc), '[]'::jsonb) as items
    from (
      select
        oi.item_id,
        (array_agg(oi.name_en order by oi.created_at desc))[1] as name_en,
        (array_agg(oi.name_ar order by oi.created_at desc))[1] as name_ar,
        sum(oi.quantity)::integer                               as quantity,
        sum(oi.line_total)                                      as revenue
      from public.order_items oi
      join o on o.id = oi.order_id
      where o.status <> 'cancelled'
      group by oi.item_id, case when oi.item_id is null then oi.name_en end
      order by quantity desc, revenue desc
      limit 10
    ) t
  ),
  cust as (
    -- Guests get a new anonymous user per device, so phone is the customer identity.
    select count(*) as customers, count(*) filter (where n >= 2) as repeat_customers
    from (
      select customer_phone, count(*) as n from o where status <> 'cancelled' group by customer_phone
    ) x
  )
  select jsonb_build_object(
    'from', p_from,
    'to', p_to,
    'timezone', v_tz,
    'orders', totals.placed - totals.cancelled,
    'placed', totals.placed,
    'collected', totals.collected,
    'cancelled', totals.cancelled,
    'revenue', totals.revenue,
    'avg_order_value', case when totals.collected > 0 then round(totals.revenue / totals.collected, 2) else 0 end,
    'avg_prep_seconds', case when totals.avg_prep is null then null else round(totals.avg_prep)::integer end,
    'cancellation_rate', case when totals.placed > 0 then round(totals.cancelled::numeric / totals.placed, 4) else 0 end,
    'customers', cust.customers,
    'repeat_customers', cust.repeat_customers,
    'orders_by_hour', hours.by_hour,
    'top_items', top.items
  )
  into v_result
  from totals, hours, top, cust;

  return v_result;
end;
$$;

------------------------------------------------------------------------------------------
-- Grants: signed-in users only (anonymous guests have the authenticated role too).
------------------------------------------------------------------------------------------

revoke execute on function public.place_order(uuid, jsonb)                          from public, anon;
revoke execute on function public.mark_outside(uuid, text)                          from public, anon;
revoke execute on function public.set_order_status(uuid, public.order_status)       from public, anon;
revoke execute on function public.set_item_stock(uuid, boolean)                     from public, anon;
revoke execute on function public.set_option_stock(uuid, boolean)                   from public, anon;
revoke execute on function public.set_ordering_paused(uuid, boolean, integer)       from public, anon;
revoke execute on function public.update_store_settings(uuid, jsonb, integer)       from public, anon;
revoke execute on function public.tenant_insights(uuid, date, date)                 from public, anon;

grant execute on function public.place_order(uuid, jsonb)                           to authenticated;
grant execute on function public.mark_outside(uuid, text)                           to authenticated;
grant execute on function public.set_order_status(uuid, public.order_status)        to authenticated;
grant execute on function public.set_item_stock(uuid, boolean)                      to authenticated;
grant execute on function public.set_option_stock(uuid, boolean)                    to authenticated;
grant execute on function public.set_ordering_paused(uuid, boolean, integer)        to authenticated;
grant execute on function public.update_store_settings(uuid, jsonb, integer)        to authenticated;
grant execute on function public.tenant_insights(uuid, date, date)                  to authenticated;
