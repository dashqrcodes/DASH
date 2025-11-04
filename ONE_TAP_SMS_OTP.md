# ONE-TAP SMS OTP Implementation Guide

## ✅ Current Implementation

The sign-up page now supports **one-tap SMS OTP** using:

1. **Web OTP API** (Android Chrome)
2. **iOS SMS Autofill** (via `autocomplete="one-time-code"`)

## 📱 How It Works

### User Flow:
1. User enters phone number
2. User taps "Send Code"
3. **6-digit code** is sent via SMS
4. SMS arrives → Native prompt appears above keyboard
5. User taps SMS code → **Auto-fills** → **Auto-verifies**
6. Goes to Face ID screen

### Technical Implementation:

```typescript
// Web OTP API (Android Chrome)
useEffect(() => {
    if ('OTPCredential' in window && showVerification) {
        navigator.credentials.get({
            otp: { transport: ['sms'] },
            signal: abortController.signal
        }).then((otp) => {
            // Auto-fill and auto-verify
            setVerificationCode(otp.code.split(''));
            router.push('/face-id');
        });
    }
}, [showVerification]);

// iOS SMS Autofill (via HTML attribute)
<input 
    autoComplete="one-time-code"
    inputMode="numeric"
/>
```

## 📨 SMS Format Required

**For Web OTP API to work, your SMS must include:**

```
Your DASH verification code is: 123456

@localhost:3000 #123456
```

**Format requirements:**
- Code must be **6 digits**
- Must include your domain: `@yourdomain.com` or `@localhost:3000` for testing
- Must include `#` followed by the code: `#123456`
- The code itself should appear in the message

**Example SMS:**
```
DASH: Your verification code is 123456

@localhost:3000 #123456
```

## 🔧 Backend SMS Integration

You'll need to integrate with an SMS provider (Twilio, AWS SNS, etc.) and format the message correctly:

```javascript
// Example SMS sending (backend)
const message = `DASH: Your verification code is ${code}

@localhost:3000 #${code}`;

await sendSMS(phoneNumber, message);
```

## ✅ Current Status

- ✅ 6-digit code support
- ✅ Web OTP API integration
- ✅ iOS autofill support (`autocomplete="one-time-code"`)
- ✅ Auto-verify when code received
- ✅ Manual entry fallback
- ⚠️ **Backend SMS integration needed** (currently simulated)

## 🚀 Next Steps

1. **Integrate SMS provider** (Twilio, AWS SNS, etc.)
2. **Format SMS correctly** with domain and `#code` format
3. **Test on real device** (Web OTP API requires HTTPS)

## 📱 Testing

### Local Testing:
- Use `@localhost:3000` in SMS for localhost
- Or use your Vercel domain: `@your-app.vercel.app`

### Production:
- Use your production domain: `@dashmemories.com`
- Ensure HTTPS is enabled (required for Web OTP API)

## 💡 Notes

- **iOS**: Works automatically with `autocomplete="one-time-code"`
- **Android**: Requires Web OTP API (Chrome 84+)
- **Fallback**: Manual entry still works if API unavailable
- **Auto-verify**: Code auto-verifies when filled (one-tap!)

