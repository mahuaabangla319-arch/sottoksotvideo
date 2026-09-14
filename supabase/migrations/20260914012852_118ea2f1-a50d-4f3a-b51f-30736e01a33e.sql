
REVOKE EXECUTE ON FUNCTION public.sync_like_counts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_comment_counts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.sync_follow_counts() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.set_sot_id() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.generate_sot_id() FROM anon, authenticated, public;
