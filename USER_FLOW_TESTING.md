# COMPLETE USER FLOW - TESTING GUIDE

## 📱 Complete Flow Sequence

### 1. **Sign Up** (`/sign-up`)
- User enters phone number
- Receives 5-digit verification code
- Agrees to terms
- Clicks "LET'S GET STARTED"
- **→ Goes to Face ID**

### 2. **Face ID** (`/face-id`)
- Shows Face ID animation
- Simulates authentication (2 seconds)
- Scanning animation
- **→ Goes to Account Created**

### 3. **Account Created!** (`/account-created`)
- Music note in glowing purple circle
- Gradient DASH text (DA purple/pink, SH blue/teal)
- "account created!" text
- Floating emoji faces background
- Glowing purple dots
- Attempts Spotify connection
- Shows "Try Again" button if Spotify fails
- **→ Auto-redirects to Dashboard after 5 seconds**

### 4. **Products Menu** (`/dashboard`)
- Shows product cards:
  - 4"×6" Memorial Card
  - 20"×30" Poster
  - Slideshow Creator
  - 11"×8.5" Program
- User selects product
- Customization modal appears
- **→ Goes to Card Builder**

### 5. **Card Builder** (`/memorial-card-builder-4x6`)
- User enters name, sunrise, sunset dates
- Uploads photo
- QR code generates automatically
- Customizes colors, fonts, backgrounds
- Clicks printer icon (approve button)
- **→ Goes to Checkout**

### 6. **Approve & Print** (`/checkout`)
- Shows order summary
- User reviews card details
- Clicks "Approve & Send to Print Shop"
- Order sent to elartededavid@gmail.com
- **→ Goes to Success**

### 7. **Success** (`/success`)
- Shows "Order Approved!" message
- Celebration animation
- Shows order sent confirmation
- **→ Auto-redirects to Slideshow Creator after 3 seconds**

### 8. **Slideshow Creator** (`/life-chapters-oct31`)
- User adds photos chronologically
- Can scan physical photos
- Sets dates for each photo
- Reorders photos
- Clicks "Complete Slideshow"
- **→ Goes to Slideshow**

---

## 🧪 Testing Instructions

### Start the Flow:
1. **Clear localStorage** (to start fresh):
   ```javascript
   localStorage.clear();
   ```

2. **Visit**: `http://localhost:3000`
   - Should redirect to `/sign-up`

3. **Follow the flow**:
   - Sign up → Face ID → Account Created → Dashboard → Card Builder → Checkout → Success → Slideshow Creator

### Quick Test Links:
- Sign Up: `http://localhost:3000/sign-up`
- Face ID: `http://localhost:3000/face-id`
- Account Created: `http://localhost:3000/account-created`
- Dashboard: `http://localhost:3000/dashboard`
- Card Builder: `http://localhost:3000/memorial-card-builder-4x6`
- Checkout: `http://localhost:3000/checkout`
- Success: `http://localhost:3000/success`
- Slideshow Creator: `http://localhost:3000/life-chapters-oct31`

### Mobile Testing:
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M / Cmd+Shift+M)
3. Select iPhone 14 Pro (9:16 portrait)
4. Visit: `http://localhost:3000`

---

## ✅ Flow Completion Checklist

- [ ] Sign up with phone number
- [ ] Complete Face ID authentication
- [ ] See Account Created screen with Spotify connection
- [ ] Navigate to Dashboard
- [ ] Select a product (4"×6" Card)
- [ ] Design card with photo, dates, QR code
- [ ] Approve card for print
- [ ] Review order on Checkout page
- [ ] Submit order
- [ ] See Success screen
- [ ] Auto-redirect to Slideshow Creator
- [ ] Add photos to slideshow
- [ ] Complete slideshow

---

## 🔄 Flow Diagram

```
Sign Up
  ↓
Face ID
  ↓
Account Created! (Spotify connection attempt)
  ↓
Dashboard (Products Menu)
  ↓
Card Builder (4"×6" or 20"×30")
  ↓
Checkout (Approve & Print)
  ↓
Success (Order Approved!)
  ↓
Slideshow Creator (life-chapters-oct31)
  ↓
Slideshow Viewing
```

---

## 📝 Notes

- All screens follow mobile-first 9:16 design
- Bottom navigation appears on main screens (Dashboard, Slideshow, etc.)
- Spotify connection is optional (can skip with "Try Again" or auto-continue)
- Order data stored in localStorage
- Slideshow photos stored in localStorage
- Face ID authentication stored in localStorage

