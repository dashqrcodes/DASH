# 🌐 Setting Up dashmemories.com on Vercel (GoDaddy)

## Step-by-Step Guide

### Part 1: Add Domain in Vercel (5 minutes)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account
   - Select your project (DASH)

2. **Add Custom Domain**
   - Go to **Settings** → **Domains**
   - Click **"Add Domain"**
   - Enter: `dashmemories.com`
   - Click **"Add"**

3. **Vercel will show you DNS records to add**
   - You'll see something like:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

### Part 2: Configure DNS in GoDaddy (10 minutes)

1. **Log in to GoDaddy**
   - Go to [godaddy.com](https://godaddy.com)
   - Log in to your account
   - Go to **My Products** → **Domains**
   - Find `dashmemories.com`
   - Click **"DNS"** or **"Manage DNS"**

2. **Add/Update DNS Records**

   **For Root Domain (dashmemories.com):**
   - Find or add an **A Record**:
     - **Type**: A
     - **Name**: @ (or leave blank)
     - **Value**: `76.76.21.21` (Vercel will provide the exact IP)
     - **TTL**: 600 (or default)
   
   **For www subdomain (www.dashmemories.com):**
   - Find or add a **CNAME Record**:
     - **Type**: CNAME
     - **Name**: www
     - **Value**: `cname.vercel-dns.com` (Vercel will provide exact value)
     - **TTL**: 600 (or default)

3. **Remove Conflicting Records**
   - If there are existing A records pointing elsewhere, delete or update them
   - If there's a conflicting CNAME for www, remove it

4. **Save Changes**
   - Click **"Save"** or **"Save All"**
   - DNS changes can take 5 minutes to 48 hours (usually 15-30 minutes)

### Part 3: Verify in Vercel (5 minutes)

1. **Wait for DNS Propagation**
   - Go back to Vercel → Settings → Domains
   - Vercel will automatically verify DNS records
   - Status will show:
     - ⏳ **"Pending"** (waiting for DNS)
     - ✅ **"Valid Configuration"** (ready!)
     - ❌ **"Invalid Configuration"** (check DNS records)

2. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Once DNS is verified, SSL will be issued (usually within minutes)
   - Your site will be available at `https://dashqrcodes.com`

### Part 4: Update Environment Variables (2 minutes)

1. **In Vercel Dashboard**
   - Go to **Settings** → **Environment Variables**
   - Update `NEXT_PUBLIC_BASE_URL`:
     - **Key**: `NEXT_PUBLIC_BASE_URL`
     - **Value**: `https://dashqrcodes.com`
     - **Environment**: Production, Preview, Development
   - Click **"Save"**

2. **Redeploy**
   - Go to **Deployments**
   - Click **"..."** on latest deployment
   - Click **"Redeploy"**
   - This ensures the new domain is used

### Part 5: Update Spotify Redirect URIs (3 minutes)

1. **Go to Spotify Developer Dashboard**
   - Visit [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
   - Select your app
   - Click **"Edit Settings"**

2. **Update Redirect URIs**
   - Add: `https://dashmemories.com/api/spotify/callback`
   - Keep: `http://localhost:3000/api/spotify/callback` (for development)
   - Remove any old deployment-specific URLs
   - Click **"Add"** and **"Save"**

## ✅ Verification Checklist

After setup, verify:

- [ ] `https://dashmemories.com` loads your app
- [ ] `https://www.dashmemories.com` redirects to `https://dashmemories.com`
- [ ] SSL certificate is active (green lock in browser)
- [ ] Spotify OAuth works with new domain
- [ ] All internal links work correctly

## 🆘 Troubleshooting

### "Invalid Configuration" in Vercel
- **Check DNS records match exactly** (case-sensitive)
- **Wait 15-30 minutes** for DNS propagation
- **Clear DNS cache**: `nslookup dashmemories.com` (command line)

### Site Not Loading
- **Check DNS propagation**: Use [whatsmydns.net](https://www.whatsmydns.net)
- **Verify A record**: Should point to Vercel's IP
- **Check SSL**: Vercel should auto-provision, wait a few minutes

### SSL Certificate Not Issuing
- **Wait 5-10 minutes** after DNS verification
- **Check domain is verified** in Vercel dashboard
- **Contact Vercel support** if it takes > 1 hour

## 📝 Quick Reference

**Vercel DNS Records (example - use what Vercel shows you):**
```
A Record:
@ → 76.76.21.21

CNAME Record:
www → cname.vercel-dns.com
```

**GoDaddy DNS Settings:**
- Location: My Products → Domains → dashmemories.com → DNS
- Update A and CNAME records as shown above

**Vercel Settings:**
- Location: Project → Settings → Domains
- Add: `dashmemories.com`
- Wait for verification

**Environment Variables:**
- `NEXT_PUBLIC_BASE_URL` = `https://dashmemories.com`

---

**Total Setup Time: ~25 minutes**
**DNS Propagation: 15-30 minutes (can take up to 48 hours)**

