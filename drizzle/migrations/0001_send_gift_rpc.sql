create or replace function public.send_gift(_video_id uuid, _gift_type text, _cost integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid := auth.uid();
  v_to uuid;
  v_balance integer;
begin
  if v_sender is null then
    raise exception 'not_authenticated';
  end if;
  if _cost is null or _cost < 1 then
    raise exception 'invalid_cost';
  end if;

  select user_id into v_to
  from public.videos
  where id = _video_id and is_deleted = false;
  if v_to is null then
    raise exception 'video_not_found';
  end if;
  if v_to = v_sender then
    raise exception 'cannot_gift_own_video';
  end if;

  select coins into v_balance from public.profiles where id = v_sender for update;
  if v_balance is null or v_balance < _cost then
    return -1;
  end if;

  update public.profiles set coins = coins - _cost, updated_at = now() where id = v_sender;
  update public.profiles set coins = coins + _cost, updated_at = now() where id = v_to;

  insert into public.gifts (from_user, to_user, video_id, gift_type, gift_value)
  values (v_sender, v_to, _video_id, _gift_type, _cost);

  return v_balance - _cost;
end;
$$;

revoke all on function public.send_gift(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.send_gift(uuid, text, integer) to authenticated;