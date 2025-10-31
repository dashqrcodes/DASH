# 🎯 Memorial Card Builder - Complete Spec

## Requirements:

### Card Dimensions:
- **4"×6" portrait** (600px × 900px)
- Square corners (border-radius: 0)
- White border (3/16" for print)

### Front Side:
1. Photo area with round + button (tap to upload)
2. Name field (tap to edit inline)
3. Dates format: "Jun 28, 1965" (short month names)
4. QR code with:
   - Transparent background
   - Blue/purple gradient modules
   - White circle center
   - "DASH" text in center
   - No border

### Back Side:
1. "En memoria de" header
2. Psalm 23 Spanish text (dark blue)
3. QR code (same design as front)
4. Dates below QR

### UX Features:
- Tap photo → instant file picker
- Tap text → inline edit overlay
- Live preview as typing
- No rounded corners
- Kindergarten-simple

### Technical:
- Next.js React component
- Cloudinary photo upload
- QR code with transparent bg + gradient
- State management for live edits
- Mobile-responsive

Ready to build!
