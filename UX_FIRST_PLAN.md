# UX First, Supabase Later - Implementation Plan

## ✅ **YES - Build UX First!**

**Strategy:** 
1. **Week 1:** Build complete user flow with localStorage/mock data
2. **Week 2:** Connect to Supabase (swap localStorage for database calls)

**Why This Works:**
- ✅ Get flow working visually first
- ✅ Test UX before worrying about database
- ✅ Easier to iterate on design
- ✅ Can demo to users immediately
- ✅ Database connection is just "data swap" later

---

## Implementation Plan 🎯

### Phase 1: UX Components (Hardcoded Data)

#### 1. **Update `/account` Page** ⏱️ 2 hours
**Current State:** Already exists, loads from Supabase
**What to Add:**
- Big prominent **"Create a DASH"** button
- Better memorial list display
- User photo display (from sign-up)

**Mock Data:**
```typescript
// For now, use localStorage or hardcoded
const [memorials, setMemorials] = useState([
  // Mock memorials for testing
]);
```

---

#### 2. **Create Memorial Modal/Page** ⏱️ 3 hours
**New Component:** `CreateMemorialModal.tsx` or `/create-memorial` page

**Form Fields:**
- Loved one's name (text)
- Photo upload (file input)
- Date of birth (date picker)
- Date of death (date picker)

**What Happens on Submit:**
1. Generate slug from name: `"John Smith"` → `"john-smith"`
2. Create memorial object (save to localStorage)
3. Generate URL: `/memorial/john-smith`
4. Redirect to memorial design page

**Storage (Phase 1):**
```typescript
const memorial = {
  id: `memorial-${Date.now()}`,
  slug: 'john-smith',
  name: 'John Smith',
  photoUrl: blobUrl,
  birthDate: '1950-01-01',
  deathDate: '2024-12-01',
  url: '/memorial/john-smith',
  qrCodeUrl: 'https://dashmemories.com/memorial/john-smith'
};

// Save to localStorage
const memorials = JSON.parse(localStorage.getItem('memorials') || '[]');
memorials.push(memorial);
localStorage.setItem('memorials', JSON.stringify(memorials));
```

---

#### 3. **Memorial Design Page** ⏱️ 4 hours
**Page:** `/memorial/[name]/design`

**What User Sees:**
- Preview of memorial page
- **Card Design** section:
  - Choose template (3-4 options)
  - QR code auto-populated in preview
  - "Download PDF" button
- **Poster Design** section:
  - Choose template (3-4 options)
  - Same QR code auto-populated
  - "Download PDF" button
- **Print Shop** section:
  - "Send to Print Shop" button
  - Generates PDF
  - Emails to print shop (API route)

**QR Code Generation:**
```typescript
import QRCode from 'qrcode.react'; // or use API

const memorialUrl = `https://dashmemories.com/memorial/${slug}`;
<QRCode value={memorialUrl} size={200} />
```

---

#### 4. **Public Memorial Page** ⏱️ 5 hours
**Page:** `/memorial/[name]` (public, no auth required)

**What Anyone Sees:**
- TopNav at top
- Deceased's name (big)
- Dates: "Born: Jan 1, 1950 - Died: Dec 1, 2024"
- Photo gallery
- **Slideshow Player** (existing slideshow component)
- Video gallery (if videos uploaded)
- Comments section (read-only for now)
- Donations section (read-only for now)
- QR code (for sharing)

**Key Features:**
- **No login required** (public access)
- **Slideshow integrated** (use existing `SlideshowPlayer` component)
- **Responsive** (mobile-first)

**Data Loading (Phase 1):**
```typescript
// Get slug from URL
const { name } = router.query;

// Load from localStorage (mock)
const memorials = JSON.parse(localStorage.getItem('memorials') || '[]');
const memorial = memorials.find(m => m.slug === name);

// If not found, show 404
```

---

#### 5. **QR Code Component** ⏱️ 1 hour
**Component:** `QRCodeGenerator.tsx`

**Features:**
- Generate QR code from URL
- Download QR code as image
- Embed in card/poster designs
- Display on memorial page

**Implementation:**
```typescript
import QRCode from 'qrcode.react';

const QRCodeGenerator = ({ url, size = 200 }) => {
  return (
    <div>
      <QRCode value={url} size={size} />
      <button onClick={downloadQR}>Download QR Code</button>
    </div>
  );
};
```

---

### Phase 2: Connect to Supabase (Next Week)

**Simple Swap:**
1. Replace `localStorage.getItem('memorials')` → `supabase.from('memorials').select()`
2. Replace `localStorage.setItem()` → `supabase.from('memorials').insert()`
3. Add real user authentication
4. Generate real URLs from database

---

## File Structure 📁

```
src/
├── pages/
│   ├── account.tsx                    ← Update: Add "Create a DASH" button
│   ├── create-memorial.tsx            ← NEW: Create memorial flow
│   ├── memorial/
│   │   └── [name]/
│   │       ├── index.tsx              ← NEW: Public memorial page (QR code link)
│   │       └── design.tsx             ← NEW: Design cards/posters
│   └── slideshow.tsx                  ← Existing (will integrate)
│
├── components/
│   ├── CreateMemorialModal.tsx        ← NEW: Modal for creating memorial
│   ├── QRCodeGenerator.tsx            ← NEW: QR code component
│   ├── MemorialCard.tsx               ← NEW: Card showing memorial in list
│   └── TopNav.tsx                     ← Existing
│
└── utils/
    └── qrcode.ts                      ← NEW: QR code utilities
```

---

## Week 1 Timeline 📅

**Day 1-2:** Update account page + Create memorial flow
**Day 3-4:** Memorial design page + QR code
**Day 5:** Public memorial page + Slideshow integration
**Day 6-7:** Polish, test, fix bugs

**Total: ~15 hours of work**

---

## Testing Checklist ✅

### Account Page:
- [ ] User name/photo displays
- [ ] "Create a DASH" button works
- [ ] Memorial list displays (even if empty)

### Create Memorial:
- [ ] Form accepts all inputs
- [ ] Photo upload works
- [ ] Generates slug correctly
- [ ] Saves to localStorage
- [ ] Redirects to design page

### Design Page:
- [ ] QR code generates correctly
- [ ] QR code appears in card preview
- [ ] QR code appears in poster preview
- [ ] PDF download works (basic)
- [ ] Print shop button works (API route)

### Public Memorial Page:
- [ ] Loads memorial data from localStorage
- [ ] Displays name, dates, photo
- [ ] Slideshow works
- [ ] QR code displays
- [ ] Works without login (public)
- [ ] Mobile responsive

---

## Next Steps 🚀

**Start Here:**
1. Update `/account` page with "Create a DASH" button
2. Create memorial creation modal/page
3. Build memorial design page
4. Build public memorial page

**Then (Week 2):**
- Connect to Supabase
- Real user authentication
- Persistent data

---

## Summary 📝

**Build UX first** = Smart approach!
- Get flow working visually
- Test with mock data
- Iterate on design
- Connect database later (easy swap)

**Result:**
- Complete user flow working
- Can demo immediately
- Database is just "data layer swap" later

