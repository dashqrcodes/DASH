# 📋 Complete DASH User Flow - Groman Memorial Package

## 🎯 Overview

This document outlines the complete user journey from account creation to delivery for the **Groman Memorial Package**.

---

## 🔄 Complete Flow

### **Step 1: User Account Creation**
- **Page:** `/account`
- **Action:** User creates their own profile/account
- **Data Stored:** 
  - User ID
  - User name
  - Account info
- **Storage:** Supabase `memorials` table (user_id field)

### **Step 2: Create Memorial (Dead Person's Profile)**
- **Page:** `/create-memorial`
- **Action:** User fills out the memorial profile:
  - Photo upload
  - Full name
  - Sunrise date (birth)
  - Sunset date (passing)
- **Data Stored:**
  - `memorials` table: `loved_one_name`, `sunrise_date`, `sunset_date`, `card_design`
- **Next:** Navigate to card/poster builder

### **Step 3: Design 4x6 Memorial Cards**
- **Page:** `/memorial-card-builder-4x6`
- **Action:** User designs front and back of memorial card
- **Features:**
  - Photo enhancement
  - Design templates
  - QR code generation
  - Text customization
- **Data Stored:**
  - `card_design` JSONB in `memorials` table
  - localStorage for preview

### **Step 4: Design 20x30 Poster** (Optional)
- **Page:** `/poster-builder`
- **Action:** User designs memorial poster
- **Data Stored:**
  - `poster_design` JSONB in `memorials` table
  - localStorage for preview

### **Step 5: Checkout & Payment**
- **Page:** `/checkout`
- **Action:** User reviews order and approves
- **Payment Flow:**
  1. User clicks "Approve & Pay"
  2. **Stripe Payment** is processed
  3. **Groman Funeral Director** account accepts payment
  4. Payment is recorded in `payments` table
  5. Order is created in `orders` table
- **Data Stored:**
  - `orders` table: order details, status, card/poster designs
  - `payments` table: Stripe payment intent, amount, status
  - Order number generated

### **Step 6: Order Sent to Print Shop**
- **API:** `/api/checkout-complete`
- **Action:** 
  - PDFs generated for card front/back and poster
  - Order emailed to print shop (`david@dashqrcodes.com`)
  - Order status: `sent`
- **Data Stored:**
  - `pdfs` table: PDF file URLs
  - `orders` table: status updated to `sent`
  - `order_status_history` table: status change logged

### **Step 7: Print Shop Fulfillment**
- **Page:** `/print-shop/dashboard`
- **Action:** Print shop processes order
- **Status Flow:**
  1. `pending` → Order received
  2. `in_progress` → Print team started production
  3. `ready` → Ready for courier pickup
  4. `picked_up` → Courier picked up
  5. `delivered` → Delivered to Groman Mortuary
- **Data Stored:**
  - `orders` table: status updates
  - `order_status_history` table: timeline entries
  - `deliveries` table: Uber delivery tracking

### **Step 8: Uber Delivery**
- **Action:** Uber Direct courier picks up and delivers
- **Tracking:**
  - Courier status: `requested` → `en_route` → `picked_up` → `delivered`
  - ETA tracking
  - Delivery address: Groman Mortuary
- **Data Stored:**
  - `deliveries` table: tracking number, courier info, status
  - `orders` table: status updated to `delivered`

---

## 🗄️ Database Tables Used

### **Core Tables:**
- `memorials` - Memorial profiles (dead person's info)
- `orders` - Print orders (cards, posters)
- `payments` - Stripe payment records
- `pdfs` - Generated PDF files
- `deliveries` - Uber delivery tracking
- `order_status_history` - Order status timeline
- `vendors` - Print shops (B.O. Printing, etc.)

### **Storage Buckets:**
- `memorials` - User memorial photos/videos
- `heaven-assets` - HEAVEN demo videos, assets

---

## 💳 Payment Flow (Groman Funeral Director)

### **Current Implementation:**
1. User approves order on `/checkout`
2. Stripe payment intent created
3. **Groman Funeral Director** account processes payment
4. Payment status stored in `payments` table
5. Order status updated to `approved` → `sent`

### **Payment Data:**
- `stripe_payment_intent_id` - Stripe payment ID
- `stripe_customer_id` - Customer ID
- `amount` - Payment amount
- `status` - Payment status (pending → succeeded)
- `order_id` - Linked to order

---

## 📦 Order Fulfillment Flow

### **Order Status Pipeline:**
```
draft → approved → sent → received → printing → waiting_courier → enroute → delivered → completed
```

### **Print Shop Dashboard:**
- View all orders
- Update order status
- Track delivery
- Manage courier requests

### **Delivery Tracking:**
- Uber Direct integration
- Real-time tracking
- ETA updates
- Delivery confirmation

---

## 🔗 Key Connections

### **User → Memorial:**
- User creates account (`/account`)
- User creates memorial (`/create-memorial`)
- Memorial linked to user via `user_id`

### **Memorial → Order:**
- Memorial data used in card/poster design
- Order created with memorial ID
- Order contains `card_design` and `poster_design` JSONB

### **Order → Payment:**
- Order triggers payment
- Payment linked to order via `order_id`
- Groman account processes payment

### **Order → Print Shop:**
- Order sent to print shop via email
- PDFs generated and attached
- Print shop dashboard shows order

### **Order → Delivery:**
- Print shop marks order `ready`
- Uber courier requested
- Delivery tracked in `deliveries` table
- Delivered to Groman Mortuary

---

## ✅ Current Status

### **✅ Implemented:**
- [x] User account page (`/account`)
- [x] Create memorial page (`/create-memorial`)
- [x] 4x6 card builder (`/memorial-card-builder-4x6`)
- [x] 20x30 poster builder (`/poster-builder`)
- [x] Checkout page (`/checkout`)
- [x] Payment API (`/api/checkout-complete`)
- [x] Print shop dashboard (`/print-shop/dashboard`)
- [x] Order API (`/api/print-shop/orders`)
- [x] Delivery tracking
- [x] Supabase database tables
- [x] Supabase storage buckets

### **🔧 Needs Integration:**
- [ ] Stripe payment with Groman account (currently test mode)
- [ ] Email sending to print shop (currently test mode)
- [ ] Uber Direct API integration (currently simulated)
- [ ] Supabase data persistence (currently localStorage fallback)

---

## 🚀 Next Steps

1. **Connect Stripe to Groman Account:**
   - Set up Stripe Connect for Groman
   - Configure payment acceptance flow
   - Test payment processing

2. **Enable Email Sending:**
   - Set up email service (SendGrid, Resend, etc.)
   - Configure print shop email
   - Test PDF email delivery

3. **Integrate Uber Direct:**
   - Set up Uber Direct API
   - Implement courier request
   - Add real-time tracking

4. **Complete Supabase Integration:**
   - Migrate from localStorage to Supabase
   - Test all database operations
   - Verify data persistence

---

## 📝 Notes

- **Groman Mortuary** is hardcoded in several places (poster-builder, print-shop orders)
- **Test Mode** is currently enabled in checkout (skips PDF generation and email)
- **Payment Flow** needs to be connected to actual Groman Stripe account
- **Delivery** is currently simulated (needs Uber Direct API)

---

**Last Updated:** Current session
**Status:** Flow documented, integration in progress

