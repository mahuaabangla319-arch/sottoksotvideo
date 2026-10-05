create table if not exists public.admin_wallets (sot_id text primary key, username text, balance numeric default 0, total_earned numeric default 0);
alter table public.admin_wallets enable row level security;
create policy "allow all" on public.admin_wallets for all using (true) with check (true);
insert into public.admin_wallets (sot_id, username) values ('85953415','kolkataofficial'), ('SOTF19D6786','sottokofficial') on conflict do nothing;