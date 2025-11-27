# Complete User Flow - DASH Memorial App

## User Journey Map 🗺️

### Step 1: User Account Creation
**Page:** `/sign-up`
- User enters: Name, Phone (OTP), Email (optional)
- Simple setup - just essentials
- Creates account in Supabase Auth
- Redirects to `/account` (user profile page)

---

### Step 2: User Profile Page
**Page:** `/account` or `/profile`
**What User Sees:**
- Their name
- Their photo (uploaded during sign-up)
- Their email/phone
- List of memorials they've created (starts empty)
- **Button: "Create a DASH"** (big, prominent)

**UX Design:**
```
┌─────────────────────────────┐
│  👤 User Profile            │
├─────────────────────────────┤
│  [User Photo]               │
│  John Smith                 │
│  john@email.com             │
│  555-1234                   │
├─────────────────────────────┤
│  My Memorials:              │
│                             │
│  [+ Create a DASH] ← Button │
│                             │
└─────────────────────────────┘
```

---

### Step 3: Create Memorial Flow
**When user clicks "Create a DASH":**

**Step 3a: Basic Info** (Modal or new page)
- Loved one's name
- Photo upload
- Date of birth
- Date of death (sunset)
- Submit → Creates memorial

**Step 3b: Memorial Created**
- Generates unique URL: `/memorial/[name-slug]`
- Generates QR code instantly (uses URL)
- Redirects to memorial design page

---

### Step 4: Memorial Design Page
**Page:** `/memorial/[name]/design` or `/memorial/[name]`
**What User Sees:**
- Preview of memorial page
- Design options:
  - **Card Design** - Choose template, QR code auto-populated
  - **Poster Design** - Choose template, same QR code
  - **Print Shop** - Order cards/posters (PDF generation, email to print shop)
- **Button: "View Memorial Page"** or "Go to Slideshow"

---

### Step 5: Memorial Profile Page (Public)
**Page:** `/memorial/[name]`
**What Anyone Sees (Public Access):**
- TopNav (same as slideshow)
- Deceased's name
- Dates (birth - death)
- Photo gallery (slideshow)
- Video gallery
- Comments section
- Donations section
- QR code (for sharing)
- **Slideshow Player** (full screen option)

**This is what QR code links to!**

---

### Step 6: Public QR Code Access
**Anyone scans QR code → Goes to `/memorial/[name]`**
- No login required
- Can view slideshow
- Can leave comments (optional - might need login)
- Can donate (optional - might need login)

---

## Implementation Plan 📋

### Phase 1: Build UX First (Hardcoded) ✅
**Goal:** Get the flow working visually, then connect data later

**What We'll Build:**

1. **User Account Page** (`/account`)
   - Show user name, photo, email
   - "Create a DASH" button
   - List of memorials (hardcoded for now)

2. **Create Memorial Modal/Page**
   - Form: name, photo, dates
   - Generate slug/URL
   - Create memorial object (localStorage for now)

3. **Memorial Design Page**
   - Card/poster design options
   - QR code preview (hardcoded URL)
   - Print shop button

4. **Memorial Profile Page** (Public)
   - Show memorial info
   - Slideshow integration
   - TopNav
   - Public access (no auth required)

**Data Storage:** localStorage for now, mock data

---

### Phase 2: Connect to Supabase 🔌
**Goal:** Make data persistent and real

**What We'll Connect:**
1. User account → `profiles` table
2. Memorial creation → `memorials` table
3. QR code → Real URL from database
4. Slideshow photos → `slideshow_media` table
5. Comments → `comments` table
6. Donations → `payments` table

---

## File Structure 🗂️

```
src/pages/
├── account.tsx              ← User profile page
├── create-memorial.tsx      ← Create memorial flow (or modal)
├── memorial/
│   ├── [name]/
│   │   ├── index.tsx        ← Public memorial page (QR code link)
│   │   ├── design.tsx       ← Design cards/posters
│   │   └── edit.tsx         ← Edit memorial (owner only)
└── slideshow.tsx            ← Current slideshow (will be integrated)

src/components/
├── CreateMemorialModal.tsx  ← Modal for creating memorial
├── MemorialCard.tsx         ← Card showing memorial in list
├── QRCodeGenerator.tsx      ← Generate QR code from URL
└── TopNav.tsx              ← Already exists
```

---

## Database Schema (Phase 2) 📊

### `profiles` table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- name (text)
- photo_url (text)
- email (text)
- phone (text)
- created_at (timestamp)
```

### `memorials` table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to profiles)
- slug (text, unique) ← Used for URL /memorial/[slug]
- name (text)
- photo_url (text)
- birth_date (date)
- death_date (date)
- qr_code_url (text)
- created_at (timestamp)
```

### `slideshow_media` table
```sql
- id (uuid, primary key)
- memorial_id (uuid, foreign key to memorials)
- media_items (jsonb) ← Array of photos/videos
- created_at (timestamp)
```

---

## QR Code Flow 🔲

1. **Memorial Created** → Generate slug: `kobe-bryant`
2. **URL Generated:** `https://dashmemories.com/memorial/kobe-bryant`
3. **QR Code Generated:** Uses URL (can use `qrcode.react` or API)
4. **QR Code Used In:**
   - Card design (auto-populated)
   - Poster design (auto-populated)
   - Memorial page (for sharing)
5. **Anyone Scans QR Code** → Goes to `/memorial/kobe-bryant` (public)

---

## Public vs Private Access 🔐

### Public (No Login Required):
- `/memorial/[name]` - View memorial page
- View slideshow
- View photos/videos
- View comments
- View donations (amounts)

### Private (Login Required):
- `/account` - User profile
- `/memorial/[name]/edit` - Edit memorial (owner only)
- `/memorial/[name]/design` - Design cards/posters (owner only)
- Upload photos/videos (owner only)
- Add comments (might be public, TBD)
- Donate (requires payment, so login needed)

---

## Next Steps (Recommended Order) 🎯

### Week 1: UX Phase (Hardcoded)
1. ✅ Update `/account` page with "Create a DASH" button
2. ✅ Create memorial creation modal/page
3. ✅ Build memorial profile page (`/memorial/[name]`)
4. ✅ Integrate slideshow into memorial page
5. ✅ Add QR code generation (hardcoded URL)
6. ✅ Test full flow with mock data

### Week 2: Supabase Connection
1. Connect user account to `profiles` table
2. Connect memorial creation to `memorials` table
3. Connect slideshow to `slideshow_media` table
4. Generate real URLs and QR codes
5. Test with real data

---

## UX Design Principles 🎨

1. **Simple & Clear**
   - One main action per page
   - "Create a DASH" button is prominent
   - Flow is linear: Account → Create → Design → View

2. **Mobile-First**
   - TopNav already at top
   - All forms work on mobile
   - QR code easy to scan

3. **Progressive Enhancement**
   - Works with localStorage first
   - Enhances with Supabase
   - Graceful degradation

4. **Public Access**
   - Memorial pages are public
   - QR code works for anyone
   - No barriers to viewing

---

## Questions to Decide 🤔

1. **Comments:**
   - Public (anyone can comment)?
   - Or require login to comment?

2. **Donations:**
   - Show donation amounts publicly?
   - Show donor names?
   - Or keep anonymous?

3. **Editing:**
   - Can owner edit memorial after creation?
   - Or locked once created?

4. **Multiple Memorials:**
   - Can user create multiple memorials?
   - Or one per user?

---

## Summary 📝

**User Flow:**
1. Sign up → User account page
2. Click "Create a DASH" → Create memorial
3. Design cards/posters → QR code auto-populated
4. View memorial page → Public slideshow
5. Anyone scans QR code → Sees memorial

**Implementation:**
1. **Phase 1:** Build UX with hardcoded data (this week)
2. **Phase 2:** Connect to Supabase (next week)

**Result:**
- Clean, simple user flow
- Public access via QR code
- Persistent data in Supabase
- Works perfectly on mobile
