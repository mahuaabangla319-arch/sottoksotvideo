# SOT TOK - SHORT TALK - FULL VIGO VIDEO ORIGINAL CLONE

Build 100% EXACT Vigo Video Original 2018-2019 clone rebranded as SOT TOK. Keep ALL original Vigo UI, screens, flow, positions. Only change name to SOT TOK and colors to orange #ff7a00 to yellow #facc15. Tech: React + Tailwind + Firebase Auth Firestore Storage Realtime.

BRANDING RULE - MUST:
App Name: SOT TOK everywhere, never show Vigo/Bigo
Colors: Orange #ff7a00 to Yellow #facc15 gradient
Logo: Fire logo orange-yellow square rounded 22px white play icon
Slogan: নিজের পরিচয় নিজেই তৈরি করো yellow #facc15

BUILD ALL THESE SCREENS EXACT VIGO ORIGINAL:

1. SPLASH SCREEN: Full black to dark blue radial gradient, center fire logo, SOT TOK 36px white bold, slogan yellow, bottom yellow progress bar 0-100% 2 sec then go to login.

2. LOGIN PAGE (From video): Black bg, back arrow, center logo + SOT TOK blue #2a4bff + slogan yellow, Bengali text "Gmail দিয়ে সাইন ইন করুন। নতুন অ্যাকাউন্টে একটি স্থায়ী SOT TOK আইডি তৈরি হবে এবং আপনার নাম সিস্টেমে সুরক্ষিত থাকবে।" Badge 100% Safe & Private green, Blue button #2a4bff white G "Gmail দিয়ে চালিয়ে যান" -> Firebase Google Auth signInWithPopup, save user to Firestore users {uid, name, email, sotId: SOT_1234, pic, bio:"", coins:0, followers:0, following:0, likes:0, createdAt}. Auto generate SOT ID.

3. HOME FEED: Vertical swipe full screen videos, right side profile circle + follow button, heart like count, comment count, share, gift button, bottom username caption music scrolling, top tabs Following For You Trending, fetch Firestore videos orderBy createdAt desc autoplay loop muted tap to unmute.

4. CAMERA PAGE /camera: Full preview getUserMedia user facing, top clean no text only right Flash Flip touch working, top center 00:15 Recording badge, left vertical Effects Beauty Filters blur rounded-2xl yellow border glow touch working, beauty slider 0-100 brightness filter, bottom Ready • Beauty level, bottom bar rounded-t-[32px] black/70 blur 5 buttons Beauty Stickers BIG RECORD Music Timer, BIG RECORD button SOT TOK gradient orange #ff7a00 to yellow #facc15 white inner circle hold to record release to stop scale animation yellow glow shadow, music picker bottom sheet trending songs, after stop preview + caption input + Upload button gradient -> upload Storage + save Firestore videos {id, userId, username, userPic, videoUrl, caption, likes:0, comments:0, gifts:0, musicName, createdAt}.

5. PROFILE PAGE /profile: Cover gradient orange-yellow, profile pic yellow border, SOT ID, name, bio, edit button, stats Videos Followers Following Likes touch to list, tabs Videos grid 3 cols thumbnails Liked, wallet button top right coins.

6. GIFT SYSTEM: Gift button in feed, bottom sheet gifts list Rose 10 coins, Heart 50, Diamond 100, Crown 500, Car 1000, on send deduct sender users.coins, add to owner coins, save giftHistory, show animation.

7. RECHARGE WALLET /wallet: Top balance card orange-yellow gradient big coins, recharge options 50 coins ₹0.5, 100 ₹1, 200 ₹2, 500 ₹5, 1000 ₹10, 5000 ₹50, UPI mock QR Pay button -> update users.coins, save rechargeHistory collection, history tabs.

8. EXPLORE TRENDING /explore: Search bar users videos, tabs Trending Nearby New, grid videos views overlay, hashtags #trending #funny, orderBy likes desc.

9. INBOX /inbox: Tabs Likes Comments Followers Gifts list from notifications collection.

10. ADMIN PANEL /admin CRITICAL: Admin email protected login, dashboard with Firestore appConfig document realtime onSnapshot listener. All app screens listen to appConfig for colors, logo, texts, banners. Fields: appName, logoUrl, primaryColor, secondaryColor, slogan, loginText, bannerImage, maintenanceMode, trendingHashtags array, giftList array with name icon coins, rechargeRates array, musicList array. When admin edits and saves to appConfig, all user apps auto update instantly via onSnapshot. Admin can manage users ban/delete, manage videos delete, view recharge and gift transactions.

BOTTOM NAV: 5 tabs Home Explore Camera center big orange-yellow + button Inbox Profile exact Vigo positions.

RULES: Mobile first, all buttons onClick onTouchStart working, Firebase realtime, SOT TOK orange-yellow theme, no Vigo/Bigo text, fully working no dummy UI.