# Twilio Setup Guide for One-Tap SMS OTP

## 📋 What You Need to Provide

I need **3 things** from your Twilio account:

1. **Account SID** (starts with `AC...`)
2. **Auth Token** (long string)
3. **Phone Number** (your Twilio phone number, format: `+1234567890`)

---

## 🚀 Step-by-Step: Get Your Twilio Credentials

### Step 1: Sign Up for Twilio (if you haven't)
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free trial with $15 credit)
3. Verify your email and phone number

### Step 2: Get Your Credentials
1. **Log into Twilio Console:** https://console.twilio.com
2. **Dashboard** → You'll see:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "View" to reveal)

### Step 3: Get a Phone Number
1. **Phone Numbers** → **Manage** → **Buy a number**
2. Choose a number (US numbers are free for trial)
3. Copy the phone number (format: `+1234567890`)

---

## 🔐 Add to Environment Variables

### For Local Development (`.env.local`):

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### For Vercel (Production):

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these three variables:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

---

## ✅ What I've Already Done

- ✅ Installed Twilio SDK (`npm install twilio`)
- ✅ Updated `/api/send-otp.ts` with Twilio integration
- ✅ SMS format configured for one-tap OTP
- ✅ Error handling and fallback
- ✅ Code storage for verification

---

## 🧪 Testing

### With Twilio Credentials:
- Real SMS will be sent
- One-tap OTP will work
- Code appears in SMS automatically

### Without Credentials (Development):
- Code logs to console
- Can manually verify with console code
- Good for testing flow

---

## 📱 SMS Format (Already Configured)

The SMS will be sent as:
```
DASH: Your verification code is 123456

@yourdomain.com #123456
```

This format enables:
- **iOS:** SMS autofill
- **Android:** Web OTP API one-tap

---

## 🎯 Next Steps

1. **Get your Twilio credentials** (see steps above)
2. **Add to `.env.local`** (for local testing)
3. **Add to Vercel** (for production)
4. **Test!** The code will automatically use Twilio when credentials are set

---

## 💰 Cost

- **Free Trial:** $15 credit (about 2,000 SMS)
- **After Trial:** ~$0.0075 per SMS (US)
- **Very affordable** for most use cases

---

## 🔒 Security Note

**NEVER commit `.env.local` to Git!**
- It's already in `.gitignore`
- Keep credentials secret
- Use Vercel environment variables for production

---

Once you add the credentials, the one-tap SMS OTP will work automatically! 🎉

