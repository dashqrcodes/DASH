# Future Deployment Workflow

## Current Status ✅
- Kobe video is working at: `https://dashmemories.com/heaven/kobe-bryant`
- Uses hardcoded Mux playback ID: `BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624`
- Direct Mux iframe embed (most reliable method)

---

## How to Make Commits Going Forward

### Option 1: Use Vercel CLI (Current Method - Works Now)

**For each deployment:**
```bash
git add .
git commit -m "Your commit message"
git push origin main
vercel --prod --yes
```

✅ **Pros:** Works immediately, bypasses GPG verification  
❌ **Cons:** Manual step required

---

### Option 2: Setup GPG Signing (Recommended for Public Repo)

**One-time setup:**
1. Install GPG (see `INSTALL_GPG_MACOS.md`)
2. Generate key and add to GitHub
3. Configure Git: `git config --global commit.gpgsign true`

**Then normal workflow works:**
```bash
git add .
git commit -m "Your commit message"  # Automatically signed
git push origin main                  # Vercel auto-deploys ✅
```

✅ **Pros:** Automatic deployments, secure, "Verified" on GitHub  
❌ **Cons:** One-time setup required

---

### Option 3: Disable GPG Verification (Easiest but Less Secure)

**One-time change in Vercel:**
1. Go to: Vercel Dashboard → Settings → Git
2. Disable "Only deploy verified commits"

**Then normal workflow works:**
```bash
git add .
git commit -m "Your commit message"
git push origin main                  # Vercel auto-deploys ✅
```

✅ **Pros:** No setup needed, automatic deployments  
❌ **Cons:** Less secure for public repo

---

## Protecting the Mux Video

### What's Already in Place ✅

1. **Hardcoded playback ID** for `kobe-bryant`:
   ```typescript
   if (nameKey === 'kobe-bryant') {
     const playbackId = 'BVzwixnKSqqpqmEdELwUWRIMQ7kKI02YZamR00wJdI624';
     // ... immediate setup, no API calls needed
   }
   ```

2. **Direct Mux iframe embed** (most reliable):
   ```typescript
   <iframe src={`https://player.mux.com/${playbackId}?autoplay=true&loop=true`} />
   ```

3. **No external dependencies** - doesn't rely on Supabase, JSON files, or env vars for Kobe video

### Future Changes That Are Safe

✅ **Safe to change:**
- Styling/CSS
- Other pages/components
- Adding new features
- Bug fixes

⚠️ **Be careful with:**
- The `heaven/[name].tsx` file (especially the Kobe video section)
- Don't remove the hardcoded playback ID without testing
- Don't change the iframe embed method without verifying it works

---

## Recommended Workflow

### For You (Right Now):

**Short term:** Use Vercel CLI (what we did today)
```bash
git add .
git commit -m "Your changes"
git push
vercel --prod --yes
```

**Long term:** Set up GPG signing or disable verification
- If repo stays public → GPG signing (most secure)
- If repo goes private → Disable verification (simplest)

---

## Testing Before Committing

### Quick Test Checklist:
- [ ] TypeScript compiles: `npm run build`
- [ ] No lint errors: `npm run lint` (if you have it)
- [ ] Kobe video still works: `https://dashmemories.com/heaven/kobe-bryant`

### If You Break Something:
```bash
# Revert last commit
git reset --soft HEAD~1

# Or revert specific file
git checkout HEAD -- src/pages/heaven/[name].tsx
```

---

## Summary

**My Plan for Future Commits:**
1. Use normal git workflow: `git add`, `commit`, `push`
2. Use `vercel --prod` to deploy (until GPG is set up)
3. Always verify Kobe video still works after deployment
4. Keep the hardcoded playback ID for Kobe (don't remove it)
5. Eventually: Set up GPG or disable verification for auto-deploy

**The Mux video is protected because:**
- It's hardcoded (no external dependencies)
- Uses reliable iframe embed
- Has its own code path (bypasses all other logic)

