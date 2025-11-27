# Current Flow Analysis - Don't Disrupt!

## ✅ **Existing Flow (KEEP AS IS)**

### 1. **Sign-Up Flow**
- User goes to `/sign-up`
- Enters phone number
- **Redirects to:** `/face-id` (line 67 in sign-up.tsx)
- Sets: `localStorage.setItem('userSignedUp', 'true')`

### 2. **Account Page** (`/account`)
- Already exists ✅
- Already has "Create New Dash" button ✅
- Button redirects to `/create-memorial` ✅

### 3. **Create Memorial Flow** (`/create-memorial`)
- Form for:
  - Name
  - Photo
  - Birth date (sunrise)
  - Death date (sunset)
- **Redirects to:** `/memorial-card-builder-4x6` after completion ✅
- Saves to `localStorage.profileData` ✅

---

## 🎯 **What User Wants (ADD, DON'T REPLACE)**

### User's Request:
1. ✅ User signs up in existing OTP experience
2. ✅ Simple account setup (name, photo) - **NEED TO ADD**
3. ✅ "Create a DASH" button - **ALREADY EXISTS**
4. ✅ Leads to existing deceased profile creation - **ALREADY WORKS**

### The Gap:
- After sign-up → `/face-id` → ??? → `/account`
- **Missing:** Simple account setup page (name, photo)
- **Solution:** Add account setup page between face-id and account

---

## 📋 **Recommended Approach: ZERO DISRUPTION**

### **Option 1: Add Account Setup Page (Safest)**
**Flow:**
```
/sign-up → /face-id → /account-setup (NEW) → /account
```

**Account Setup Page** (`/account-setup`):
- Simple form: Name, Photo
- Save to `localStorage.userProfile`
- Button: "Continue to Account" → `/account`

**Benefits:**
- ✅ Doesn't touch existing `/create-memorial` flow
- ✅ Doesn't touch existing `/account` page
- ✅ Just adds one new page
- ✅ Easy to test

---

### **Option 2: Add Account Setup to Account Page (Minimal)**
**Flow:**
```
/sign-up → /face-id → /account (if no profile, show setup first)
```

**Logic in `/account`:**
- Check if `localStorage.userProfile` exists
- If not → Show account setup form
- If yes → Show normal account page with "Create a DASH" button

**Benefits:**
- ✅ Uses existing `/account` page
- ✅ One-time setup, then normal flow
- ✅ No new routes needed

---

## ✅ **RECOMMENDATION: Option 2 (Minimal Change)**

### Why:
1. **Zero disruption** - `/create-memorial` stays exactly the same
2. **Uses existing route** - No new routes
3. **Simple logic** - Just check if profile exists
4. **Easy to test** - Test account page only

### Implementation:
```typescript
// In /account page
const [userProfile, setUserProfile] = useState(null);
const [showSetup, setShowSetup] = useState(false);

useEffect(() => {
  const profile = localStorage.getItem('userProfile');
  if (!profile) {
    setShowSetup(true);
  } else {
    setUserProfile(JSON.parse(profile));
  }
}, []);

// If showSetup → Show account setup form
// If userProfile → Show normal account page with "Create a DASH" button
```

---

## 🛡️ **What We WON'T Touch**

### ✅ **KEEP UNCHANGED:**
1. `/sign-up` - OTP sign-up experience
2. `/sign-in` - Sign-in flow
3. `/create-memorial` - Deceased profile creation
4. `/memorial-card-builder-4x6` - Card builder flow
5. All existing localStorage keys
6. All existing redirects

### ✅ **ONLY ADD:**
- Account setup form (name, photo) in `/account` page
- Check if profile exists, show setup if not
- Save to `localStorage.userProfile`
- Once setup done, show normal account page

---

## 📝 **Implementation Plan**

### Step 1: Add Account Setup State to `/account`
- Check if `userProfile` exists in localStorage
- If not → Show setup form
- If yes → Show normal page

### Step 2: Add Setup Form
- Name input
- Photo upload
- "Save" button
- Saves to `localStorage.userProfile`
- Redirects to normal account view

### Step 3: Test Flow
- Sign up → Face ID → Account (should show setup)
- Complete setup → See "Create a DASH" button
- Click "Create a DASH" → Goes to `/create-memorial` (existing flow)

---

## ✅ **Result: Zero Disruption**

- ✅ Existing flows unchanged
- ✅ Only addition: Account setup in `/account` page
- ✅ "Create a DASH" button works exactly as before
- ✅ `/create-memorial` flow untouched
- ✅ Easy to test and verify

---

## 🎯 **Next Step**

Would you like me to:
1. Add account setup form to `/account` page (Option 2)?
2. Or create separate `/account-setup` page (Option 1)?

**My recommendation:** Option 2 (add to existing account page) - simpler, less disruptive, easier to test.

