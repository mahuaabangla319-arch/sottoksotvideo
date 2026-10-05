Replace my current camera with Vigo Video style camera system:

1. CAMERA UI LIKE VIGO:
- Full screen camera with bottom scroll filter list
- Categories on top of filter list: Voltage | Sticker | Makeup | Funny | Debota | Beauty
- When user scrolls filters, preview instantly changes on face.

2. VOLTAGE EFFECT (Main Vigo effect):
- Use canvas + WebGL glitch effect
- Add RGB split, electric line, shake, lightning on face edges
- Slider to control voltage intensity 0-100

3. STICKER SYSTEM:
- Use face-api.js or mediapipe face mesh to detect face landmarks
- Place PNG/GIF stickers on face (crown, glasses, heart, etc)
- Stickers should move with face

4. BEAUTY FILTERS:
- Smooth skin, big eyes, white face, slim face - with 0-100 slider like Vigo

5. ALL FILTERS FROM SUPABASE:
- Fetch all from vigo_filters table where is_active=true
- Group by category
- If user is admin (SOT ID 85953415 or SOTF19D6786), show + Add Filter button to upload new PNG/GIF/video filter to storage bucket 'camera-filters' and insert into vigo_filters table.

6. PERFORMANCE:
- Camera must be super fast, 60fps, no lag
- preload thumbnails, lazy load filter files
- Use requestAnimationFrame for effects

Make it look exactly like Vigo Video camera.