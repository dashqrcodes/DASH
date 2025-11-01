# DEPLOYMENT_DELETED Error - Fix Guide

## 1. The Fix

### Root Cause
The `DEPLOYMENT_DELETED` error occurs when your application references a Vercel deployment URL that has been deleted. This commonly happens when:
- `NEXT_PUBLIC_BASE_URL` is set to a specific deployment URL (e.g., `https://nextjs-auth-app-xyz123.vercel.app`)
- That deployment gets deleted automatically (after retention period) or manually
- Your Spotify OAuth callback or other redirects try to use that deleted URL

### Solution

**Option A: Use Vercel's Automatic URL Detection (Recommended)**

Update your API routes to automatically detect the correct URL:

```typescript
// In API routes, use Vercel's provided environment variables
const getBaseUrl = () => {
  // Vercel automatically provides these in production
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Fallback for production domain
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Development fallback
  return 'http://localhost:3000';
};
```

**Option B: Use Your Production Domain**

If you have a custom domain configured:
1. Set `NEXT_PUBLIC_BASE_URL` in Vercel dashboard to your production domain
   - Example: `https://yourdomain.com` (NOT `https://nextjs-auth-app-xyz123.vercel.app`)
2. Ensure this is set for Production environment specifically

### Implementation Steps

1. **Update Environment Variables in Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Remove or update `NEXT_PUBLIC_BASE_URL` if it points to a deployment-specific URL
   - Set it to your production domain (if you have one) or leave it unset to use auto-detection

2. **Update Your API Routes** (see code changes below)

3. **Update Spotify Dashboard:**
   - Ensure redirect URIs use your production domain
   - Example: `https://yourdomain.com/api/spotify/callback`
   - NOT: `https://nextjs-auth-app-xyz123.vercel.app/api/spotify/callback`

## 2. Root Cause Explanation

### What Was Happening vs. What Should Happen

**What Was Happening:**
- Your code was using `NEXT_PUBLIC_BASE_URL` which was likely set to a specific deployment URL
- Vercel deployments have unique URLs like `project-name-abc123.vercel.app`
- When that deployment gets deleted (retention policy or manual deletion), the URL becomes invalid
- Your Spotify callback or other redirects fail because they're trying to reach a deleted deployment

**What Should Happen:**
- Use stable URLs that don't change when deployments are deleted
- Production domain (if configured) or Vercel's automatic URL detection
- The app should always reference the current active deployment, not a specific one

### What Triggered This Error?

Common triggers:
1. **Automatic deletion**: Vercel deletes old deployments after retention period (default: 30 days for free tier)
2. **Manual deletion**: Someone deleted a deployment from the dashboard
3. **Bookmarked URLs**: Users accessing old deployment URLs directly
4. **Stale environment variables**: `NEXT_PUBLIC_BASE_URL` pointing to deleted deployment

### What Misconception Led to This?

- **Misconception**: "I can hardcode or use a specific deployment URL"
- **Reality**: Deployment URLs are temporary and will be deleted. Always use production domains or let Vercel auto-detect URLs.

## 3. Understanding the Concept

### Why Does This Error Exist?

Vercel implements deployment retention policies to:
- **Manage storage costs**: Old deployments consume storage
- **Prevent confusion**: Too many deployments clutter the dashboard
- **Performance**: Fewer deployments mean faster operations

The error protects you by:
- **Alerting you immediately**: You know something is wrong
- **Preventing silent failures**: Better than broken redirects that fail silently
- **Enforcing best practices**: Encourages using stable URLs

### The Correct Mental Model

**Deployment Lifecycle:**
```
New Commit → Build → New Deployment → Old Deployment Deleted (after retention)
                ↓
           Active URL (changes with each deployment)
                ↓
         Production Domain (stable, always points to latest)
```

**Key Principles:**
1. **Deployment URLs are temporary**: Each deployment gets a unique URL that expires
2. **Production domains are stable**: Your custom domain always points to the latest deployment
3. **Environment variables adapt**: Use Vercel's provided env vars that auto-update

### How This Fits Into Vercel's Framework

Vercel's architecture:
- **Deployments**: Immutable snapshots of your code
- **URLs**: Each deployment gets a unique preview URL
- **Production**: Custom domain or `project-name.vercel.app` always points to latest
- **Environment Variables**: `VERCEL_URL` is automatically injected with current deployment URL

## 4. Warning Signs & Prevention

### What to Look Out For

**Code Smells:**
- Hardcoded deployment URLs: `https://project-abc123.vercel.app`
- Using `NEXT_PUBLIC_BASE_URL` without fallback logic
- No handling for missing environment variables
- OAuth redirect URIs that don't match production domain

**Patterns to Avoid:**
```typescript
// ❌ BAD: Hardcoded deployment URL
const redirectUri = 'https://nextjs-auth-app-xyz123.vercel.app/api/callback';

// ❌ BAD: No fallback for missing env var
const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/callback`;

// ✅ GOOD: Auto-detection with fallbacks
const redirectUri = `${getBaseUrl()}/api/callback`;
```

### Similar Mistakes to Avoid

1. **Storing deployment URLs in databases**: Use production domains instead
2. **Email links with deployment URLs**: Always use production domain
3. **External service callbacks**: Ensure they use production domain
4. **Client-side redirects**: Don't hardcode deployment URLs

### Prevention Checklist

- [ ] Always use production domain for external integrations
- [ ] Implement URL detection with fallbacks
- [ ] Test with deployment URLs disabled
- [ ] Use Vercel's `VERCEL_URL` when available
- [ ] Never commit deployment-specific URLs to code

## 5. Alternative Approaches & Trade-offs

### Approach 1: Auto-Detection (Recommended)
**Pros:**
- Works in all environments automatically
- No manual configuration needed
- Adapts to preview/production deployments

**Cons:**
- Requires code changes
- Slightly more complex logic

**When to use:** Always, unless you have specific requirements

### Approach 2: Production Domain Only
**Pros:**
- Simple and explicit
- Stable across all deployments
- Better for external integrations

**Cons:**
- Requires custom domain setup
- Doesn't work for preview deployments
- Manual configuration needed

**When to use:** When you have a custom domain and don't need preview deployment support

### Approach 3: Environment-Specific URLs
**Pros:**
- Full control over each environment
- Explicit configuration

**Cons:**
- More maintenance
- Risk of using wrong URLs
- Doesn't solve the deletion problem

**When to use:** Complex multi-environment setups with specific requirements

### Recommended Approach: Hybrid
Use auto-detection with production domain fallback:
- Automatically detects URL in Vercel
- Falls back to production domain if available
- Uses localhost for development
- Best of all worlds

