# ⚡ Quick Integration Reference

## 🎯 What You Need to Hook Up

### 1. 💳 STRIPE (Payments)
**Status:** Code ready, needs keys + database
- ✅ API routes: `/api/checkout-complete`
- ⚠️ Needs: Stripe keys + `payments` table
- 📖 See: `COMPLETE_INTEGRATION_SETUP.md` section 1

### 2. 📱 TWILIO (SMS OTP)
**Status:** Code ready, needs credentials + database
- ✅ API routes: `/api/send-otp`, `/api/verify-otp`
- ⚠️ Needs: Twilio credentials + `profiles` table
- 📖 See: `COMPLETE_INTEGRATION_SETUP.md` section 2

### 3. 🎵 SPOTIFY (Music)
**Status:** Code ready, needs app + keys
- ✅ API routes: `/api/spotify/auth`, `/api/spotify/callback`, `/api/spotify/search`
- ⚠️ Needs: Spotify app + credentials
- 📖 See: `COMPLETE_INTEGRATION_SETUP.md` section 3

---

## 📋 Required Database Tables

**ALL these tables are needed:**

1. `heaven_characters` - Videos
2. `slideshow_media` - Slideshows
3. `memorials` - Memorials
4. `profiles` - User profiles + phone numbers
5. `payments` - Stripe payments
6. `orders` - Orders
7. `collaborators` - Collaboration
8. `comments` - Comments
9. `messages` - Messages
10. `likes` - Likes
11. `avatars` - AI avatars
12. `voices` - Voice cloning
13. `calls` - Voice calls
14. `ai_jobs` - AI jobs
15. `media` - Media metadata

**Don't delete any tables!** They're all needed.

---

## 🚀 Quick Start

1. **Open:** `COMPLETE_INTEGRATION_SETUP.md`
2. **Follow sections 1, 2, 3** in order
3. **Run SQL scripts** for missing tables
4. **Add environment variables** to `.env.local` and Vercel
5. **Test everything!**

**Time:** ~1.5 hours to set everything up

---

## ✅ Checklist

- [ ] Stripe keys added
- [ ] Twilio credentials added
- [ ] Spotify app created
- [ ] All database tables created
- [ ] Environment variables set
- [ ] Tested Stripe payment
- [ ] Tested Twilio SMS
- [ ] Tested Spotify OAuth

---

## 📞 Need Help?

See detailed guides:
- **Full setup:** `COMPLETE_INTEGRATION_SETUP.md`
- **Twilio only:** `TWILIO_SETUP.md`
- **Spotify only:** `SPOTIFY_SETUP.md`

