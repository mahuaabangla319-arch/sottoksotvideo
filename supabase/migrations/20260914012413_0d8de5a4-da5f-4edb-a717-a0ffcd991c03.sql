create index if not exists idx_videos_created_at on videos(created_at desc);
create index if not exists idx_videos_user_id on videos(user_id);