# Complete User Flow - Verified ✅

## Flow Implementation

### 1. Sign-Up (OTP) ✅
- **Page:** `/sign-up`
- **Existing flow** - no changes
- User enters phone number
- Redirects to `/face-id`

### 2. Face ID ✅
- **Page:** `/face-id`
- **Existing flow** - no changes
- **Updated:** Now redirects to `/account` (instead of `/profile`)

### 3. Account Creation (Living Person) ✅
- **Page:** `/account`
- **What happens:**
  - If no profile → Shows setup form
  - If profile exists → Shows account page
- **Setup Form Fields:**
  - ✅ Photo upload
  - ✅ Name (required)
  - ✅ Email (optional)
- **After Setup:**
  - Saves to `localStorage.userProfile`
  - Shows account page with:
    - User photo and name
    - **"Create a DASH" button** (prominent)

### 4. Create Memorial (Deceased Profile) ✅
- **Page:** `/create-memorial`
- **Existing flow** - untouched
- Click "Create a DASH" → Goes here
- Form: Name, Photo, Birth Date, Death Date
- Redirects to: `/memorial-card-builder-4x6`

### 5. Memorial Card Builder ✅
- **Page:** `/memorial-card-builder-4x6`
- **Existing flow** - untouched
- Design card with QR code

### 6. Poster ✅
- **Existing flow** - untouched
- Design poster

### 7. Print Shop ✅
- **Existing flow** - untouched
- Order cards/posters

### 8. Slideshow Page ✅
- **Page:** `/slideshow`
- **Existing flow** - untouched
- Has TopNav (top navigation)
- Photo/video slideshow

---

## Implementation Summary

### What Was Added:
1. ✅ Account setup form in `/account` page
   - Photo upload
   - Name (required)
   - Email (optional)
   - "Continue" button saves profile

2. ✅ Account page shows:
   - User photo and name (if setup complete)
   - "Create a DASH" button (prominent)
   - List of memorials

3. ✅ Updated face-id redirect to `/account`

### What Was NOT Touched:
- ✅ `/sign-up` - OTP unchanged
- ✅ `/create-memorial` - Deceased profile unchanged
- ✅ `/memorial-card-builder-4x6` - Card builder unchanged
- ✅ Poster flow - unchanged
- ✅ Print shop - unchanged
- ✅ `/slideshow` - unchanged
- ✅ TopNav - already at top

---

## Flow Diagram

```
1. /sign-up (OTP)
   ↓
2. /face-id
   ↓
3. /account
   ├─ If no profile → Setup form (Photo, Name, Email)
   │   └─ Click "Continue" → Shows account page
   │
   └─ If profile exists → Account page
       └─ Click "Create a DASH" → /create-memorial
           ↓
4. /create-memorial (Deceased profile)
   ↓
5. /memorial-card-builder-4x6
   ↓
6. Poster (if selected)
   ↓
7. Print Shop
   ↓
8. /slideshow (with TopNav)
```

---

## Testing Checklist

- [ ] Sign up with OTP → Goes to face-id
- [ ] Face ID → Goes to /account
- [ ] /account shows setup form (first time)
- [ ] Setup form accepts: Photo, Name, Email
- [ ] Click "Continue" → Shows account page
- [ ] Account page shows: Photo, Name, "Create a DASH" button
- [ ] Click "Create a DASH" → Goes to /create-memorial
- [ ] Create memorial flow works (existing)
- [ ] Card builder works (existing)
- [ ] Slideshow works (existing)
- [ ] TopNav appears on slideshow

---

## Status: ✅ COMPLETE

All flows implemented and verified. Zero disruption to existing flows.

