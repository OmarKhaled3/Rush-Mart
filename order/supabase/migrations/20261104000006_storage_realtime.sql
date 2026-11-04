-- Menu photos: public read. v1 uploads happen through the dashboard (service role).
-- Path convention: {tenant_id}/{item_id}.webp
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 2 * 1024 * 1024, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do nothing;

-- Live order updates for the staff queue and the customer status page. RLS applies to
-- subscribers, so each client only receives rows it may select.
alter publication supabase_realtime add table public.orders;
