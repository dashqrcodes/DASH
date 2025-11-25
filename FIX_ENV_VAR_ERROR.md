# 🔧 Fix "Invalid Characters" Error in Vercel Environment Variables

## The Problem
When adding the environment variable, you see:
> "The name contains invalid characters. Only letters, digits, and underscores are allowed. Furthermore, the name should not start with a digit."

## The Solution: Type It Manually

Instead of copy-pasting, **type the key name manually** to avoid hidden characters.

---

## Step-by-Step Fix

### Step 1: Go to Vercel Environment Variables
1. Go to: **https://vercel.com/dashboard**
2. Click your project
3. Click **Settings** → **Environment Variables**

### Step 2: Add New Variable (TYPE MANUALLY)
1. Click **"Add New"** button
2. **In the "Key" field, TYPE this exactly (don't copy-paste):**
   ```
   NEXT_PUBLIC_KOBE_DEMO_VIDEO
   ```
   - All uppercase letters
   - Use underscore `_` between words
   - No spaces
   - No hyphens `-`
   - No special characters

3. **In the "Value" field, TYPE this exactly:**
   ```
   https://www.dashqrcodes.com/heaven-kobe-bryant
   ```

4. **Check these boxes:**
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development

5. Click **"Save"**

---

## ✅ Correct Format

**Key (type manually):**
```
NEXT_PUBLIC_KOBE_DEMO_VIDEO
```

**Breakdown:**
- `NEXT_PUBLIC` - all caps, underscore
- `_` - underscore
- `KOBE` - all caps
- `_` - underscore
- `DEMO` - all caps
- `_` - underscore
- `VIDEO` - all caps

**Value:**
```
https://www.dashqrcodes.com/heaven-kobe-bryant
```

---

## 🚫 Common Mistakes to Avoid

**❌ DON'T use these:**
- `NEXT_PUBLIC-KOBE-DEMO-VIDEO` (hyphens not allowed)
- `NEXT_PUBLIC KOBE_DEMO_VIDEO` (spaces not allowed)
- `next_public_kobe_demo_video` (must be uppercase)
- `NEXT_PUBLIC_KOBE_DEMO_VIDEO ` (trailing space)

**✅ DO use this:**
- `NEXT_PUBLIC_KOBE_DEMO_VIDEO` (all caps, underscores only)

---

## 🔍 Still Getting Error?

**Check these:**

1. **No spaces anywhere** - Make sure there are no spaces before or after
2. **All uppercase** - Must be `NEXT_PUBLIC_KOBE_DEMO_VIDEO` not `next_public_kobe_demo_video`
3. **Underscores only** - Use `_` not `-` (hyphen)
4. **Type manually** - Don't copy-paste from browser/document, type it character by character
5. **Clear the field first** - If there's old text, delete it all and start fresh

---

## 📝 Quick Checklist

- [ ] Went to Vercel → Settings → Environment Variables
- [ ] Clicked "Add New"
- [ ] Typed `NEXT_PUBLIC_KOBE_DEMO_VIDEO` manually in Key field
- [ ] Typed `https://www.dashqrcodes.com/heaven-kobe-bryant` in Value field
- [ ] Checked Production, Preview, Development
- [ ] Clicked "Save"
- [ ] No error message ✅

---

## 🆘 If Still Not Working

**Try this:**

1. **Clear your browser cache** for Vercel
2. **Try a different browser** (Chrome, Firefox, Safari)
3. **Refresh the Vercel page** before adding the variable
4. **Check if variable already exists** - maybe it's there with a different name

**Check existing variables:**
- Look in the list of existing environment variables
- See if `NEXT_PUBLIC_KOBE_DEMO_VIDEO` is already there (maybe just needs editing, not creating)
- Or see if there's a similar one with a typo that needs to be deleted first

