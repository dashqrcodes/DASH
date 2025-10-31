# �� QR Code Design Requirements

## Key Features to Implement:

### 1. **DASH Branding in Center**
- White circular area in QR center
- "DASH" text in black letters
- Slight 3D/shadow effect
- Replaces some QR modules (error correction allows)

### 2. **Gradient QR Code**
- Modules: Blue/purple gradient
- NOT black & white
- Matches card design
- Maintains scannability

### 3. **Card Layout**
- 4"×6" size (600px × 900px)
- White border
- Square corners (NOT rounded!)
- QR in center
- Name below QR

### 4. **Design Principles**
- Kindergarten-simple
- Tap photo area → file picker
- Tap name → edit inline
- Tap dates → edit inline
- Live preview as you type

### 5. **Back Side**
- Psalm 23 text
- Dark blue color
- Fits within 4×6 inches
- Same QR design

## Technical Implementation:
- Use QR library with logo option
- Custom module rendering for gradient
- White circle for DASH logo
- Error correction level: Medium/High (to allow logo)
