# 🚀 Connect dash.gift to Your Site

## Steps:

### Step 1: In Vercel Dashboard
1. Go to your project dashboard
2. Click "Settings"
3. Click "Domains"
4. Click "Add Domain"
5. Type: dash.gift
6. Click "Add"

### Step 2: Update DNS
Vercel will show you DNS records. Update your domain provider:

**For dash.gift:**
- Type: A
- Name: @
- Value: 76.76.21.21

**For www.dash.gift:**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

### Step 3: Wait
- DNS propagation: 5-15 minutes
- Then dash.gift will work!

## Quick Check:
After adding domain in Vercel, what DNS records does it show you?
npx fix-react2sexthell-n