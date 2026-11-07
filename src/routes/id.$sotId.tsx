FIX FULL APP - Make Everything REAL. Do NOT delete any existing design. Remove ALL fake/demo data.

1. REAL PROFILE - ON TAP ANY USER:
When I tap on ANY user's avatar / name / username anywhere (Feed, Explore, Comments, Live, Search), it MUST open that user's REAL profile page /profile/$userId
Show:
- Real avatar, real name, username, bio from profiles table
- Real followers count from follows table, following count, total likes from videos table
- If it's MY profile -> Show Edit Profile button
- If it's OTHER user's profile -> Show Follow / Unfollow button + Message button. NO Edit button.
- Follow button: On tap, insert into follows table (follower_id = my id, following_id = this profile id). Unfollow = delete that row. Update count instantly.
- Videos Grid: Fetch from videos table where user_id = this profile user_id, order newest first, 3-column TikTok grid. Tap any video -> open full video player with real like, comment, share. If no videos -> Show "No videos yet"

2. REAL VIDEOS - NO FAKE:
Remove all Unsplash images, hardcoded videos, demo posts.
Feed, Explore, Profile MUST fetch ONLY from videos table in Supabase.
Video must show: real video_url, real caption, real owner profile, real likes count, real comments count.
Upload from Create/Camera MUST insert into videos table with user_id, video_url, title, created_at. Then it must appear instantly in my Profile + Feed + Explore for everyone.

3. REAL LIVE - NO FAKE:
Remove ALL hardcoded data from id.$sotId.tsx and live files: NO viewers=1245, NO likes=3881, NO fake comments like @priya_12, @rahul_asansol, NO Unsplash image as video.
Make REAL LIVE:
- Host starts live -> create row in live_streams table (host_id, room_id, is_live=true)
- Viewer joins live -> insert into live_viewers, show REAL viewers count
- Like button -> insert into live_likes, show REAL likes count
- Comment -> insert into live_comments table, show REAL comments instantly to all viewers
- Gift -> insert into live_gifts, update coins
- If user is LIVE, show RED LIVE badge on his Profile + Feed + Explore. Tap LIVE badge -> join his REAL live room.
- If user is NOT live -> Show "User is not live now" + Show his videos + Follow button.
- Use REAL camera stream for host, NOT image.

4. REAL ACCOUNTS - NO FAKE USERS:
Remove all fake users. Show ONLY real users from profiles table (Supabase Auth).
Search must search real users only.
Comments must show real commenter's avatar + name from profiles table.

5. REAL LIKE / COMMENT EVERYWHERE:
Like on Video / Live -> Save in likes table, count must update for everyone.
Comment -> Save in comments table, show instantly.