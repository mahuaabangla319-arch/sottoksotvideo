

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
Add a 'Divine Makeover & Video' section. Users can upload their photo and choose templates like 'Maa Durga', 'Maa Kali' for females, and 'Lord Shiva', 'Lord Narayan' for males. Include an AI processing button to transform their face into these legendary characters and generate a short festival video clip."
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

