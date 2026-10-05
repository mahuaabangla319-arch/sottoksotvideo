-- পুরানো ভুল Policy সব Delete
drop policy if exists "public can read" on public.videos;
drop policy if exists "admin can do all" on public.videos;
drop policy if exists "public can read" on public.banners;
drop policy if exists "admin can do all" on public.banners;
drop policy if exists "public read storage" on storage.objects;
drop policy if exists "admin upload storage" on storage.objects;

-- সব টেবিল ফাস্ট করার জন্য Index
create index if not exists idx_videos_fast on public.videos (created_at desc);
create index if not exists idx_banners_fast on public.banners (id);

-- সব কিছু পাবলিক আর ফাস্ট করার FINAL Policy
alter table public.videos enable row level security;
alter table public.banners enable row level security;
alter table public.camera_filters enable row level security;
alter table public.vigo_filters enable row level security;

create policy "allow_all_videos" on public.videos for all using (true) with check (true);
create policy "allow_all_banners" on public.banners for all using (true) with check (true);
create policy "allow_all_filters" on public.camera_filters for all using (true) with check (true);
create policy "allow_all_vigo" on public.vigo_filters for all using (true) with check (true);
create policy "allow_all_storage" on storage.objects for all using (true) with check (true);