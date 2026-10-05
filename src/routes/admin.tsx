BUILD GOD MODE SUPER ADMIN PANEL - Full Control Without Coding - Package com.sottok.sottovideo

SECURITY: Only email mahuaabangla319@gmail.com can access /admin. For others redirect to home. Add second password layer: Admin password is SOT@2026Admin. Secure Supabase RLS.

Create /admin with dark mode sidebar, super fast, mobile responsive, with 17 sections:

=== EXISTING 10 SECTIONS (KEEP AND IMPROVE) ===
1. DASHBOARD OVERVIEW: Total Users, Total Videos, Total Reports, Coins Distributed, Today's Uploads, Earnings graph, Active Users graph.
2. USER MANAGEMENT: List users with SOT ID, name, email, followers, videos, coins, join date. Actions: View Profile, Ban/Unban, Delete, Add/Remove Coins, Make Verified Blue Tick, Search by SOT ID/email.
3. VIDEO MANAGEMENT: List all videos with thumbnail, uploader, views, likes, reports. Actions: Play, Delete, Hide, Make Featured/Trending, Boost.
4. BANNER & ADS MANAGEMENT: Add Banner Images for Home Slider with Upload, Link, Start/End Date, Active toggle. Manage AdMob Enable/Disable and Change Ad IDs. Announcement Popup - Write message show to all users on app open.
5. CONTENT MODERATION: Reported Videos Queue with reason, Approve/Delete/Warn/Ban. Blocked Words List.
6. COIN & WALLET CONTROL: Set coin rates per upload/ad/login, Set conversion 1000 coins = INR, Withdraw Requests list with UPI ID Approve/Reject, Manually add coins.
7. NOTIFICATIONS: Send Push to All Users or single user by SOT ID. Send from "SOT TOK Official" account.
8. HASHTAG & TRENDING CONTROL: Add/Edit/Delete Trending Hashtags, Make #Trending/#Featured.
9. SETTINGS CONTROL: Change App Name, Logo, Splash Screen, Maintenance Mode On/Off, App Version Control.
10. ADMIN LOGS: Show who did what.

=== NEW 7 GOD MODE SECTIONS YOU ASKED FOR (ADD THESE NOW) ===

11. VIRAL BOOST ENGINE (Like/View/Follower Badhano):
- Create page /admin/boost
- For ANY Video: Enter Video ID or select from list -> Add Custom Likes (e.g. +1000 likes), Add Custom Views (e.g. +10K views), Add Custom Comments, Add Shares. System will show real-looking fake users as likers. Add Gradual Boost option - Add likes slowly in 24 hours to look natural, not instantly.
- For ANY User: Enter SOT ID -> Add Custom Followers (e.g. +5000 followers), Add Following count, Add Total Likes on profile. Option to add with real-looking bot profiles.
- Show boost history and active boosts.

12. VERIFICATION & PROFILE FRAME SYSTEM (Blue Tick & Diamond Frame):
- Create page /admin/verification
- Verification Types: Blue Tick (Official), Gold Tick (Top Creator), Red Tick (SOT TOK Team). Admin can assign any tick to any user by SOT ID.
- Profile Frame System: Create Frame Library. Admin can Upload Frames: Example - Diamond Frame, Fire Frame, Crown Frame, Gold Circle, Rainbow Border. Each frame is PNG with transparent center. Assign frame to any user by SOT ID or give to all users above 10K followers. User can choose frame from profile settings if admin gave them. Also option to Change Shape: Circle, Square with rounded, Diamond Shape, Star Shape.

13. BANNER & LOGO DESIGN SYSTEM:
- In Banner Management add: Upload Multiple Banners, Set Banner Position (Home Top Slider, Profile Top, Between Feed videos).
- Logo Frame Changer: Change App Logo, Splash Logo, Admin can push new logo to all users without app update (Remote Config).
- Giveaway Banner: Admin can create "Win 10000 Coins" banner.

14. OFFICIAL NOTIFICATION & POSTING SYSTEM:
- Create Official Account: @sottokofficial - All notifications and posts from this account will have special Official badge.
- Daily Notification Scheduler: Write notification today and schedule for tomorrow 8PM. Auto send daily from SOT TOK Official. Includes image notification.
- Official Post: Admin can upload video from admin panel which will be posted as @sottokofficial and will be shown as Featured to all users on top of feed.

15. MUSIC & SOUND LIBRARY MANAGEMENT:
- Create page /admin/music
- Add New Song: Upload MP3 (max 60s), Add Song Name, Artist Name, Thumbnail, Category (Trending, Bengali, Hindi, Remix, Devotional), Make Trending toggle.
- List all songs with Play, Delete, Edit, Make Trending, Views count.
- Users will see these songs in camera screen -> Add Music.
- Auto fetch trending songs option via API later.

16. CAMERA & FILTER CONTROL SYSTEM:
- Create page /admin/camera
- Filter Management: Upload Filter LUT or create filter presets. Fields: Filter Name (e.g. Beauty, Vintage, Cinematic, Black & White, Kolkata), Upload Filter Preview Image, Intensity slider. Add/Edit/Delete filters.
- Effect Management: Add effects like Heart Eyes, Dog Face, Crown, Glasses (AR effects list). Enable/Disable.
- Camera Settings Control: From admin set Default Camera Mode (15s/30s/60s), Max Recording Time, Enable/Disable Beauty by default, Enable/Disable Flash.
- Background Management: Upload Video Backgrounds for Green Screen effect.

17. GIFT & REWARD & GITHUB SYNC:
- Gift Management: Upload Gifts (Rose, Diamond, Crown) with coin price. Users can send gifts to creators.
- Reward Rules: Set Level System - Level 1 to Level 100 based on followers/likes. Each level gets frame + badge.
- GitHub Sync Note: All admin changes must be saved to Supabase tables: admin_banners, admin_songs, admin_filters, admin_frames, admin_boost_logs, admin_notifications, trending_hashtags. So admin can control without redeploy.

UI: Use Tailwind, dark theme, Jio Blue #0066FF accent, cards with charts, tables with pagination and search, image upload with preview, confirm dialogs for Delete/Ban.

After build, make sure /admin is super fast and secure.