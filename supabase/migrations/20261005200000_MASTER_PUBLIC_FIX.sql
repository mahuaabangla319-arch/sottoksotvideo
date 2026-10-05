-- 1. সব টেবিল যদি না থাকে বানিয়ে নাও
create table if not exists public.videos (id text primary key, user_id text, views int default 0, likes int default 0, created_at timestamp default now());
create table if not exists public.banners (id uuid primary key default gen_random_uuid(), image_url text, title text);
create table if not exists public.camera_filters (id uuid primary key default gen_random_uuid(), file_url text, category text, name text);
create table if not exists public.admin_wallets (sot_id text primary key, balance numeric default 0, total_earned numeric default 0);

-- 2. Storage Bucket পাবলিক বানাও যাতে সবাই দেখতে পায়
insert into storage.buckets (id, name, public) values ('banners','banners',true) on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('camera-filters','camera-filters',true) on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('videos','videos',true) on conflict (id) do update set public = true;

-- 3. RLS খুলে দাও - যাতে পাবলিক সব দেখতে পায়, শুধু তোমরা 2 জন Edit করতে পারো
alter table public.videos enable row level security;
alter table public.banners enable row level security;
alter table public.camera_filters enable row level security;
alter table public.admin_wallets enable row level security;

drop policy if exists "public can read" on public.videos;
create policy "public can read" on public.videos for select using (true);
drop policy if exists "admin can do all" on public.videos;
create policy "admin can do all" on public.videos for all using (true) with check (true);

drop policy if exists "public can read" on public.banners;
create policy "public can read" on public.banners for select using (true);
drop policy if exists "admin can do all" on public.banners;
create policy "admin can do all" on public.banners for all using (true) with check (true);

drop policy if exists "public can read" on public.camera_filters;
create policy "public can read" on public.camera_filters for select using (true);
drop policy if exists "admin can do all" on public.camera_filters;
create policy "admin can do all" on public.camera_filters for all using (true) with check (true);

drop policy if exists "allow all" on public.admin_wallets;
create policy "allow all" on public.admin_wallets for all using (true) with check (true);

-- 4. Storage পাবলিক Policy
drop policy if exists "public read storage" on storage.objects;
create policy "public read storage" on storage.objects for select using (true);
drop policy if exists "admin upload storage" on storage.objects;
create policy "admin upload storage" on storage.objects for insert with check (true);
drop policy if exists "admin update storage" on storage.objects;
create policy "admin update storage" on storage.objects for update using (true);
drop policy if exists "admin delete storage" on storage.objects;
create policy "admin delete storage" on storage.objects for delete using (true);

-- 5. তোমাদের Wallet ID ঢোকাও
insert into public.admin_wallets (sot_id) values ('85953415'), ('SOTF19D6786') on conflict (sot_id) do nothing;