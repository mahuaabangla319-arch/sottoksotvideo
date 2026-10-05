-- 1. Groups Table
create table if not exists public.groups (id uuid primary key default gen_random_uuid(), name text, created_at timestamp default now());
-- 2. Live Table
create table if not exists public.live_streams (id uuid primary key default gen_random_uuid(), user_id text, status text default 'live', created_at timestamp default now());
-- 3. Banners Table
create table if not exists public.banners (id uuid primary key default gen_random_uuid(), image_url text, active boolean default true);
-- 4. Verify Table
create table if not exists public.verify_requests (id uuid primary key default gen_random_uuid(), user_id text, status text default 'pending', created_at timestamp default now());
-- 5. Payments Table
create table if not exists public.payments (id uuid primary key default gen_random_uuid(), amount numeric, sot_id text, status text default 'success', created_at timestamp default now());
-- 6. Storage for Camera Filter
insert into storage.buckets (id, name, public) values ('camera-filters','camera-filters',true) on conflict (id) do nothing;

-- RLS Allow All for Admin Panel
alter table public.groups enable row level security;
alter table public.live_streams enable row level security;
alter table public.banners enable row level security;
alter table public.verify_requests enable row level security;
alter table public.payments enable row level security;

drop policy if exists "allow all" on public.groups;
create policy "allow all" on public.groups for all using (true) with check (true);
drop policy if exists "allow all" on public.live_streams;
create policy "allow all" on public.live_streams for all using (true) with check (true);
drop policy if exists "allow all" on public.banners;
create policy "allow all" on public.banners for all using (true) with check (true);
drop policy if exists "allow all" on public.verify_requests;
create policy "allow all" on public.verify_requests for all using (true) with check (true);
drop policy if exists "allow all" on public.payments;
create policy "allow all" on public.payments for all using (true) with check (true);

-- Storage Policy
create policy "allow all storage" on storage.objects for all using (true) with check (true);