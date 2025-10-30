# Next Steps to Complete Stripe Setup

## What's Done ✅
- Node.js v25.0.0 installed
- Dependencies installed (Express, Stripe)
- Backend server created
- Frontend checkout page created

## What You Need to Do:

### 1. Get Your Stripe Keys
1. Go to https://dashboard.stripe.com/register
2. Sign up for a free account (test mode)
3. Go to Developers > API Keys
4. Copy your **Publishable key** (pk_test_...)
5. Click "Reveal" to show your **Secret key** (sk_test_...)

### 2. Set Up Environment Variable
Create a `.env` file in this directory:
```bash
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

### 3. Update checkout.js
Edit `checkout.js` line 1:
```javascript
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');
```

### 4. Start the Server
```bash
npm start
```

### 5. Test It
Open http://localhost:3000/checkout.html

Use test card: `4242 4242 4242 4242`
