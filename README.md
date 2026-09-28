SOT TOK — COMPLETE PRODUCTION UPGRADE MASTER PROMPT

IMPORTANT:
This is an EXISTING SOT TOK project.
DO NOT rebuild the application from scratch.
First inspect the complete existing codebase, routing, components, Firebase configuration, database structure, authentication flow, storage flow, UI components and existing features.

Preserve all working existing features unless they conflict with the requirements below.

Goal:
Turn the existing SOT TOK app into a polished, secure, fast, production-ready short-video social platform suitable for Android/Web deployment and future Play Store release.

==================================================
1. BRANDING + SPLASH SCREEN
==================================================

App name:
SOT TOK

Use the existing SOT TOK branding.

Create a professional splash screen using the provided SOT TOK logo/image asset.

Requirements:
- Show splash screen immediately when app starts.
- Splash duration: EXACTLY 5000 milliseconds.
- After 5000ms automatically navigate to the existing Login/Home flow.
- Do not show splash repeatedly during normal internal navigation.
- Prevent layout flashing.
- Preload the splash asset.
- Optimize the image.
- Keep the splash responsive for mobile screens.
- Do not replace the existing app functionality.

Create:
src/assets/sottok-splash.png

If the exact asset is already available in the project, use it instead of creating a duplicate.

==================================================
2. AUTHENTICATION
==================================================

Use Firebase Authentication.

Support:
- Email/password
- Google Sign-In if already configured
- Secure session persistence
- Logout
- Password reset
- Account deletion

Never trust frontend-only authentication checks.

Protect private routes.

==================================================
3. USER PROFILE
==================================================

Profile must support:

- Profile photo
- Username
- Display name
- Bio
- Followers
- Following
- Video count
- Likes count
- Public/private account
- Follow button
- Edit profile
- Settings
- Report profile
- Block user

Follow button states:

FOLLOW
FOLLOWING
REQUESTED

For private accounts:
- Follow request required.
- Creator can accept/reject requests.

For public accounts:
- Follow immediately.

Do not discriminate against users based on identity.

==================================================
4. VIDEO FEED
==================================================

Create/maintain a full-screen vertical short-video feed.

Requirements:
- 9:16 video layout
- Swipe vertically
- Autoplay current video
- Pause previous video
- Mute/unmute
- Like
- Comment
- Share
- Follow
- Download if creator allows
- Report
- Save/bookmark if existing architecture supports it
- Video description
- Hashtags
- Creator profile link

Performance:
- Lazy load videos
- Load thumbnail before video
- Preload only current and next video
- Do not preload the entire feed
- Use pagination/infinite scrolling
- Avoid duplicate Firebase reads
- Cache thumbnails
- Compress uploaded videos
- Use proper loading skeletons
- Handle slow networks
- Handle low-end Android devices

==================================================
5. VIDEO UPLOAD
==================================================

Create a professional upload screen.

Allow:
- Video selection
- Preview
- Caption
- Hashtags
- Thumbnail
- Allow Downloads ON/OFF
- Public/private visibility where appropriate
- Upload progress
- Cancel upload
- Retry failed upload

Video validation:
- File type validation
- File size validation
- Duration validation
- Safe error messages

Never expose Firebase secrets.

==================================================
6. DOWNLOAD SYSTEM
==================================================

Creator controls:

Allow Downloads = ON/OFF

If ON:
Users can download public videos.

If OFF:
Hide/disable download option.

Private videos:
Never allow public downloading.

Respect creator settings.

==================================================
7. NOTIFICATION SYSTEM
==================================================

Create a complete notification system.

Notifications for:

- New follower
- Follow request
- Follow request accepted
- Video like
- Comment
- Comment reply
- Mention
- Video share
- Gift/ring received
- Admin announcement
- Wallet events
- Coin purchase result
- Security/account events

Notification document structure should include:

id
recipientId
actorId
type
title
message
videoId
commentId
createdAt
read
metadata

Features:
- Notification page
- Unread badge
- Mark as read
- Mark all as read
- Delete notification if appropriate
- Notification preferences

Use Firebase Cloud Messaging (FCM) for push notifications.

Never send push notifications from untrusted client code.

==================================================
8. WALLET + COINS
==================================================

Create a secure wallet architecture.

Each user can have:

wallet balance
coin balance
transaction history

Users can purchase coins through approved payment infrastructure.

IMPORTANT:
Never trust the frontend for payment success.

Payment verification must happen server-side.

Every transaction must have:

transactionId
userId
packageId
amount
coins
status
provider
createdAt
verifiedAt

Allowed states:

PENDING
SUCCESS
FAILED
REFUNDED

Never directly increase coins simply because frontend says payment succeeded.

Prevent:
- duplicate transactions
- replay attacks
- fake success responses
- negative balances
- client-side balance manipulation

==================================================
9. RINGS / VIRTUAL GIFTS
==================================================

Create virtual gifts/rings.

Users purchase gifts using coins.

Example:
Ring Gift
Heart Gift
Star Gift
Special Gift

Admin should be able to create/edit/disable gifts.

Gift fields:

id
name
icon
animation
coinPrice
enabled

Sending a gift:

sender
recipient
giftId
coinPrice
createdAt
status

When sending:
- Validate balance server-side
- Deduct coins atomically
- Create gift transaction
- Notify recipient
- Prevent duplicate processing

==================================================
10. ADMIN / OWNER SECURITY
==================================================

PRIMARY OWNER:

digtorebangla@gmail.com

ONLY this account is the Primary Owner/Admin.

Do NOT implement admin access only by checking an email in frontend JavaScript.

Use:

Firebase Authentication
+
secure custom claims
+
Firestore Security Rules
+
server-side authorization

Admin routes must be protected.

If a normal user changes frontend code manually, they must NOT gain admin access.

No secondary admin is required at this stage.

==================================================
11. ADMIN DASHBOARD
==================================================

Create a protected Admin Dashboard.

Sections:

Dashboard
Users
Videos
Comments
Reports
Notifications
Activity
Wallets
Coin Packages
Rings/Gifts
Transactions
Payments
Games
Game Statistics
Settings
Security
Audit Logs

Dashboard statistics:

Total Users
Active Users
Total Videos
Total Comments
Total Likes
Total Followers
Coin Transactions
Gift Transactions
Pending Reports
Failed Payments

Use pagination for large datasets.

==================================================
12. ADMIN ACTIVITY CENTER
==================================================

Track:

New user
User login
Video upload
Video deletion
Follow
Unfollow
Like
Unlike
Comment
Reply
Report
Coin purchase
Gift sent
Gift received
Payment success
Payment failure
Account changes
Admin actions
Game activity

Create audit logs for sensitive admin actions.

Admin log fields:

id
adminId
action
targetType
targetId
metadata
createdAt
ip/device metadata only where legally appropriate

==================================================
13. REPORTING + MODERATION
==================================================

Users can report:

Profile
Video
Comment
Reply

Report categories:

Spam
Harassment
Impersonation
Inappropriate content
Scam/fraud
Copyright concern
Other

Admin can:

View
Review
Resolve
Dismiss
Take moderation action

Never automatically delete content based only on a single client-side report.

==================================================
14. BLOCK SYSTEM
==================================================

Users can block/unblock users.

When blocked:
- Hide relevant interactions
- Prevent unwanted direct interaction
- Respect block relationship throughout feed/profile/comments

Enforce important restrictions server-side.

==================================================
15. SETTINGS
==================================================

Create a complete Settings page.

Sections:

Account
Profile
Privacy
Security
Notifications
Video
Downloads
Data
Appearance
Language
Help
About
Logout
Delete Account

Privacy options:

Public Account
Private Account
Allow Follow Requests
Allow Comments
Allow Mentions
Allow Notifications

Notification settings:

Likes
Comments
Replies
Followers
Messages/events if implemented
Gifts
Admin announcements

Video settings:

Autoplay
Data Saver
Allow Downloads default
Mute by default

==================================================
16. GAMES
==================================================

Create a Games section.

Games must be FREE and non-gambling.

Include lightweight games:

Tic-Tac-Toe
Rock Paper Scissors
Memory Cards
Tap Challenge
Number Guess
Snake
Flappy-style game
Puzzle

Do NOT implement:
- Betting
- Gambling
- Real-money wagering
- Casino mechanics

Track basic game statistics:

gamesPlayed
wins
losses
highScore
lastPlayedAt

==================================================
17. SEARCH
==================================================

Implement search for:

Users
Usernames
Videos
Hashtags

Add debounce.

Do not execute a Firebase search request on every keystroke.

Show:
- Recent searches
- Clear search history
- Empty state
- Loading state

==================================================
18. HOME NAVIGATION
==================================================

Create/maintain:

Home
Discover/Search
Create/Upload
Notifications
Profile

Use mobile-first navigation.

Make navigation smooth.

==================================================
19. SECURITY
==================================================

Review ALL Firebase Security Rules.

Important:

Users can only edit their own profile.

Users cannot modify another user's wallet.

Users cannot create fake successful payment records.

Users cannot increase their own coin balance.

Users cannot modify gift transactions.

Users cannot make themselves admin.

Users cannot modify audit logs.

Users cannot access another user's private content.

Admin operations require proper authorization.

Use server-side trusted operations for:

Wallet changes
Coin purchases
Gift transactions
Payment verification
Admin operations
Sensitive notifications

==================================================
20. DATABASE DESIGN
==================================================

Use a clean scalable Firestore structure.

Suggested collections:

users
videos
comments
likes
follows
followRequests
notifications
wallets
coinPackages
transactions
gifts
giftTransactions
reports
blocks
games
gameStats
adminLogs
settings

Use indexes where necessary.

Avoid deeply nested structures that create expensive queries.

==================================================
21. PERFORMANCE
==================================================

Optimize aggressively for:

Android
low-end phones
slow networks
mobile Chrome
PWA

Implement:

Lazy loading
Code splitting
Route splitting
Image optimization
Video thumbnails
Pagination
Infinite scroll
Debounced search
Firebase query optimization
Caching
Memoization
Virtualization where useful
Skeleton loaders
Error boundaries

Avoid:
- unnecessary re-renders
- repeated Firebase listeners
- duplicate API requests
- loading all videos at once
- loading all users at once

==================================================
22. ERROR HANDLING
==================================================

Every important screen needs:

Loading state
Empty state
Error state
Retry action

Never expose raw Firebase errors to normal users.

Use friendly messages.

==================================================
23. RESPONSIVE UI
==================================================

Design for:

360px Android
390px Android/iPhone
412px Android
Tablet
Desktop

Do not break existing desktop layout.

Maintain a consistent SOT TOK design system.

Use accessible buttons and readable typography.

==================================================
24. PWA / APP PREPARATION
==================================================

Prepare the project for future Android/Play Store packaging.

Check:

App name
Manifest
Icons
Splash
Theme color
Orientation
Installability
Offline fallback
Safe-area support

Do not claim Play Store compliance automatically.

Create a production checklist.

==================================================
25. CODE QUALITY
==================================================

Before making changes:

Inspect existing code.

Reuse existing components where possible.

Do not create duplicate components.

Do not remove working functionality unnecessarily.

Use TypeScript types.

Remove obvious unused code.

Fix console errors.

Fix broken imports.

Fix broken routes.

Fix Firebase listener cleanup.

==================================================
26. FINAL VALIDATION
==================================================

After implementation:

Run build.

Run lint/type checks if configured.

Fix TypeScript errors.

Fix runtime errors.

Test:

Signup
Login
Logout
Profile
Follow
Private account
Video upload
Video feed
Like
Comment
Reply
Share
Download ON
Download OFF
Notifications
FCM
Wallet
Coin transaction
Gift
Reports
Block
Settings
Games
Admin authentication
Admin dashboard
Firestore security

IMPORTANT:
Do not fake successful payments.
Do not fake Firebase functionality.
Do not expose secrets.
Do not create insecure admin authentication.

==================================================
FINAL OUTPUT
==================================================

After completing the implementation, provide:

1. Files changed
2. New files created
3. Firebase changes required
4. Firestore indexes required
5. Firestore Security Rules changes
6. Cloud Functions/backend requirements
7. Environment variables required
8. FCM setup requirements
9. Payment provider integration requirements
10. Build/test result
11. Remaining issues, if any

DO NOT rebuild the project from scratch.
UPGRADE THE EXISTING SOT TOK PROJECT.
