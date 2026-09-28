.====================================================
21. OWNER ADMIN + SECOND ADMIN SYSTEM
====================================================

Create a secure two-level administrator system.

PRIMARY OWNER ADMIN:
- Only my verified Gmail can be the PRIMARY OWNER.
- The Owner has full control of the application.
- Owner email must be stored securely through Firebase Authentication/custom claims.
- Do NOT rely only on a frontend email check.

SECONDARY ADMIN:
- The Owner can add ONE additional verified Gmail as Secondary Admin.
- The Secondary Admin can manage normal administrative tasks.
- Secondary Admin must NOT be able to:
  - Remove the Primary Owner
  - Change the Primary Owner email
  - Transfer ownership
  - Disable the Primary Owner
  - Change security rules
  - Access private user data unnecessarily
  - Delete the entire database
  - Permanently destroy the application

OWNER-ONLY ACTIONS:
- Add/remove Secondary Admin
- Change Owner security settings
- Transfer ownership
- Delete critical system data
- Change payment configuration
- Change Firebase/security configuration

When opening Admin:
→ Firebase Authentication
→ Verify Gmail
→ Check secure admin role
→ Open Admin Dashboard only if authorized.

Unauthorized Gmail:
→ Never show Admin Dashboard
→ Show "Access denied".

====================================================
22. VIDEO DOWNLOAD
====================================================

Add a Download button to videos where permitted.

Video menu:

Like
Comment
Share
Save
Download
Report

Download requirements:

- Download the original/allowed video file.
- Show download progress.
- Save to the device using the appropriate browser/mobile mechanism.
- Handle download failure.
- Do not expose private videos through download links.
- Respect the creator's download setting.

Creator can choose:

Allow Downloads: ON/OFF

If OFF:
→ Hide the Download button for that video.

Do not allow downloading of private/restricted content.

====================================================
23. COMPLETE SETTINGS PAGE
====================================================

Create a full Settings screen.

Sections:

ACCOUNT
- Edit Profile
- Username
- Email
- Phone
- Change Password
- Login & Security
- Logout
- Delete Account

PRIVACY
- Private Profile ON/OFF
- Who can follow me
- Who can comment
- Who can message me
- Who can mention me
- Show liked videos
- Allow video downloads
- Blocked Users

NOTIFICATIONS
- Likes
- Comments
- Replies
- Followers
- Messages
- Gifts/Rings
- Admin announcements
- Promotional notifications

VIDEO
- Autoplay
- Data Saver
- Video Quality
- Download permission
- Upload quality

APP
- Language
- Dark Mode
- Light Mode
- Cache management
- Clear temporary cache
- About SOT TOK
- Terms
- Privacy Policy
- Community Guidelines

SECURITY
- Login activity
- Active sessions
- Logout from other devices
- Security alerts

====================================================
24. PRIVATE PROFILE
====================================================

Allow users to switch:

Public Profile
Private Profile

PUBLIC:
- Anyone can view public profile.
- Anyone can view videos that are public.
- Follow button visible.

PRIVATE:
- Profile remains visible according to privacy rules.
- Videos are only visible to approved followers where applicable.
- Follow requests can be accepted/rejected.
- Private videos must NEVER be exposed through direct URLs/API responses.

Respect privacy settings at the database/security-rule level, not only the UI.

====================================================
25. REPORT SYSTEM
====================================================

Add Report option to:

- User profiles
- Videos
- Comments
- Messages where applicable

Report reasons:

- Spam
- Harassment
- Hate or abusive content
- Nudity/sexual content
- Violence
- Scam/fraud
- Copyright issue
- Impersonation
- Other

User can submit:

- Reason
- Optional description

Create Admin → Reports section.

Admin can:

- View report
- Review reported content
- Take appropriate moderation action
- Mark report as resolved
- Keep moderation history

Do not automatically delete content only because it was reported.

====================================================
26. PUBLIC PROFILE + VIDEO VISIBILITY
====================================================

For every PUBLIC user profile:

Profile page must clearly show:

- Profile photo
- Username
- Bio
- Followers
- Following
- Follow button
- User's public videos
- Saved/public content where applicable
- Gift/Ring information where enabled

Anyone should be able to open a public profile and see its public videos.

IMPORTANT:
This should apply equally to ALL users, including transgender users and users from any other group.

Do not create a separate visibility restriction based on gender, gender identity, caste, religion, or other personal characteristics.

Public videos should be discoverable through:

- Profile
- Home feed
- Search
- Appropriate discovery sections

Private videos must remain private.

====================================================
27. RED FOLLOW BUTTON
====================================================

Make the Follow button highly visible.

Default:

FOLLOW
- Red background
- White text
- Rounded corners
- Good touch size
- Smooth animation

After following:

FOLLOWING
- Use a clearly different visual state.

If a private account requires approval:

REQUESTED
- Show appropriate state.

When unfollowing:
- Ask for confirmation where appropriate.

The Follow button must work instantly with optimistic UI while keeping the Firebase state accurate.

====================================================
28. FAST PUBLIC VIDEO FEED
====================================================

Make public videos load quickly.

Use:

- Pagination
- Infinite scrolling
- Thumbnail-first loading
- Lazy video loading
- Preload only the next relevant video
- Video caching where appropriate
- Optimized video dimensions
- CDN/storage delivery
- Avoid loading every video at once

Feed behavior:

Current video
→ Play

Next video
→ Preload efficiently

Far-away videos
→ Do not download unnecessarily

This should reduce data usage and improve performance.

====================================================
29. PROFILE VIDEO LOADING
====================================================

When opening a public profile:

Load profile information first.

Then load videos using pagination.

Show skeleton loading.

Do not wait for every video to load before displaying the profile.

Support:

Pull to refresh
Infinite scroll
Empty state
Network error
Retry button

====================================================
30. FINAL SECURITY RULE
====================================================

Before completing the implementation:

Test that:

1. Primary Owner can access Admin.
2. Secondary Admin can access permitted Admin features.
3. Unauthorized Gmail cannot access Admin.
4. Secondary Admin cannot remove Primary Owner.
5. Secondary Admin cannot change ownership.
6. Private videos cannot be accessed by unauthorized users.
7. Private profiles respect follow approval.
8. Download is disabled when creator disables downloads.
9. Public profiles show their public videos.
10. Report submissions reach Admin Reports.
11. Follow button works correctly.
12. Videos load quickly with pagination.

Do not expose admin credentials, Firebase private keys, service-account credentials,
or secret API keys in frontend code.

3.  **FOR YOU FEED (Exact):**
    - Vertical snap scroll, full screen videos, loop, mute/unmute on tap, Tap for sound text top right.
    - Top tabs: Following | For You (For You active bold white)
    - Right actions: Creator profile circle with red + button, heart with 4.0K, comment 0, share 0, Save bookmark below. All icons white.
    - Bottom: @creator username, 1.0M views, Original sound - SOT TOK Artist, Button: Use this sound with music icon.
    - Use sample videos from /videos folder, Bangla kitchen cooking videos if possible.

4.  **EXPLORE PAGE (Exact):**
    - White bg. Top Search bar with search icon.
    - Pink banner #ffe3f0 rounded 24px: red badge SotTok with flame, big Bengali: নিজের সাথে ভুয়েট, pink small: প্রতি সপ্তাহে নতুন চ্যালেঞ্জ, black small: সেরা ১০ জন ক্রিয়েটর পাবেন বিশেষ পুরস্কার
    - Tabs: Trending (active black bold with pink underline), Comedy, Food, Dance|Sing, Family, Beauty - horizontal scroll.
    - Middle: gray text: এখনো কোনো ট্রেন্ডিং হ্যাশট্যাগ নেই।
    - Bottom: Recommended Users + Show all pink right.
    - Show 2-column user cards with Food category images.

5.  **ACTIVITY PAGE (Exact):**
    - Black bg. Header: back arrow + Activity title white.
    - Tabs: All (active pink underline), Likes, Comments, Followers gray.
    - Center: gray Bengali: এখনো কোনো অ্যাক্টিভিটি নেই।
    - Bottom nav highlight on bell yellow.

6.  **NEW VIDEO - CAMERA RECORDING FULLY WORKING (Nothing missing):**
    - Header: back arrow + নতুন ভিডিও title Bengali, 3 dots right.
    - Tabs: Record active blue #2a4bff with video icon, Gallery with image icon.
    - **CAMERA MUST WORK:** Request getUserMedia, show live camera preview in center rounded 24px, mirrored. If permission denied show black screen with "Camera access needed" button.
    - Right side inside preview: Flash icon (toggle torch), Flip icon (switch front/back camera).
    - Bottom controls: 15s and 30s pill selector, 15s active blue. Big blue record button #2a4bff with white border ring. On press start MediaRecorder, timer counting, on second press stop and save video to Firebase Storage, show preview and Post button. Left bottom small gallery thumbnail (last image from device), Right bottom Speed icon.
    - After record: Add caption screen with Post button -> upload to Firestore feed.

**BOTTOM NAVIGATION (Exact Bengali):**
Fixed bottom, black bg white icons, 5 items: হোম (home), এক্সপ্লোরার (compass), + blue button big (#2a4bff rounded-xl), ইনবক্স (bell), প্রোফাইল (user). Active state blue/yellow.

**SETUP:**
Use Firebase config placeholder. Use react-router. Mobile width 420px centered. All text Bengali exact as described. Production ready, deployable.

DO NOT SKIP CAMERA, DO NOT SKIP NEW GMAIL FORM. Everything must work.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://sottoksotvideo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7bcd7f5b-07c3-4d21-815f-e59f44663b92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

