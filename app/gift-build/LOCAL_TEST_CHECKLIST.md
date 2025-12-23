# 🧪 Local Testing Checklist

## Test URL
http://localhost:3001/gift

## What to Test

### 1. Page Loads
- [ ] Visit http://localhost:3001/gift
- [ ] Page displays correctly
- [ ] Pricing shows: $199 (crossed out $399, Save $200)

### 2. Photo Upload
- [ ] Click "Upload Photo"
- [ ] Select an image file
- [ ] Photo preview appears

### 3. Video Upload
- [ ] Click "Upload Video"
- [ ] Select a video file
- [ ] Video uploads to Mux (shows "Uploading video..." then "✓ Video uploaded successfully")

### 4. Generate Preview
- [ ] After photo is uploaded, "Generate Preview" button appears
- [ ] Click "Generate Preview"
- [ ] QR code preview appears

### 5. Checkout Flow
- [ ] After preview is generated, click checkout button
- [ ] Should redirect to Stripe Checkout
- [ ] Stripe checkout page loads

### 6. Test Payment (Use Stripe Test Card)
- [ ] Card: 4242 4242 4242 4242
- [ ] Expiry: Any future date
- [ ] CVC: Any 3 digits
- [ ] Complete payment
- [ ] Should redirect to /thank-you page

### 7. Webhook Test
- [ ] Check Supabase `orders` table
- [ ] New order should appear after payment
- [ ] Order should have all metadata fields

## Common Issues to Check

- **Photo upload fails**: Check Supabase storage bucket `photos` exists and is public
- **Video upload fails**: Check Mux tokens are correct
- **Checkout fails**: Check Stripe Price ID is correct
- **Webhook fails**: Check webhook secret and endpoint URL

## If Everything Works
✅ Ready to commit and push!







