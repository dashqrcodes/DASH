# 🚀 GoDaddy → Vercel: Simple Setup

## Easy Method (Recommended):

### Step 1: In Vercel (After Deployment)
1. Go to your project dashboard
2. Click "Settings"
3. Click "Domains"
4. Type: `mydash.love`
5. Click "Add"
6. Vercel will show you EXACT DNS records needed

### Step 2: In GoDaddy
1. Login to: https://www.godaddy.com
2. Click "My Products"
3. Find "mydash.love" → Click "DNS" button
4. Scroll to "DNS Records"

### Step 3: Update Records
Delete OLD records if needed, then add:

**For Root Domain (mydash.love):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600
```

**For WWW:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 600
```

### Step 4: Wait
- DNS propagation: 5 minutes to 24 hours
- Usually works in 5-15 minutes!

## Alternative: Nameservers (Even Easier!)
In GoDaddy DNS settings:
1. Change nameservers to Vercel's
2. Let Vercel handle ALL DNS

Want me to walk you through this live?
