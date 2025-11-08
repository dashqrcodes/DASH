-- ============================================
-- ADDITIONAL TABLES FOR DASH BUSINESS OPERATIONS
-- ============================================
-- Run this AFTER the main schema setup
-- Copy everything below and paste into Supabase SQL Editor
-- ============================================

-- VENDORS: Print shops and vendors
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  vendor_type TEXT CHECK (vendor_type IN ('printshop', 'graphic_designer', 'delivery')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ORDERS: Card and poster orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  order_type TEXT CHECK (order_type IN ('card', 'poster', 'both')),
  product_type TEXT CHECK (product_type IN ('4x6_card', '20x30_poster')),
  quantity INTEGER DEFAULT 100,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent', 'received', 'printing', 'waiting_courier', 'enroute', 'delivered', 'completed')),
  card_design JSONB,
  poster_design JSONB,
  vendor_id UUID REFERENCES vendors(id),
  print_shop_email TEXT DEFAULT 'david@dashqrcodes.com',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- PDFS: Generated PDF files for print orders
CREATE TABLE IF NOT EXISTS pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  pdf_type TEXT CHECK (pdf_type IN ('card_front', 'card_back', 'poster')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- PAYMENTS: Stripe payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- DELIVERIES: Uber/delivery tracking
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  delivery_type TEXT CHECK (delivery_type IN ('uber', 'usps', 'fedex', 'ups', 'custom')),
  tracking_number TEXT,
  courier_name TEXT,
  courier_phone TEXT,
  pickup_location TEXT,
  delivery_location TEXT,
  pickup_address TEXT,
  delivery_address TEXT,
  estimated_pickup_time TIMESTAMP WITH TIME ZONE,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_pickup_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'picked_up', 'enroute', 'delivered', 'failed')),
  current_location TEXT,
  eta_minutes INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ORDER_STATUS_HISTORY: Track order status changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- DESIGN_REVISIONS: Track design changes/approvals
CREATE TABLE IF NOT EXISTS design_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  revision_number INTEGER DEFAULT 1,
  design_data JSONB NOT NULL,
  approved_by_user_id UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- NOTIFICATIONS: Order status notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  notification_type TEXT CHECK (notification_type IN ('order_sent', 'order_received', 'printing', 'waiting_courier', 'enroute', 'delivered', 'payment_succeeded', 'payment_failed')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email);
CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(vendor_type);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_pdfs_order_id ON pdfs(order_id);
CREATE INDEX IF NOT EXISTS idx_pdfs_pdf_type ON pdfs(pdf_type);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_number ON deliveries(tracking_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at);

CREATE INDEX IF NOT EXISTS idx_design_revisions_order_id ON design_revisions(order_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_order_id ON notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- VENDORS POLICIES (admin can manage, users can read)
CREATE POLICY "Users can read vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Admins can manage vendors" ON vendors FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  auth.jwt() ->> 'email' = 'david@dashqrcodes.com'
);

-- ORDERS POLICIES
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendors can read assigned orders" ON orders FOR SELECT USING (
  vendor_id IN (SELECT id FROM vendors WHERE email = auth.jwt() ->> 'email')
);

-- PDFS POLICIES
CREATE POLICY "Users can read own pdfs" ON pdfs FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM orders WHERE id = pdfs.order_id));
CREATE POLICY "System can insert pdfs" ON pdfs FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can read pdfs for own orders" ON pdfs FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM orders WHERE id = pdfs.order_id));

-- PAYMENTS POLICIES
CREATE POLICY "Users can read own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update payments" ON payments FOR UPDATE USING (true);

-- DELIVERIES POLICIES
CREATE POLICY "Users can read own deliveries" ON deliveries FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM orders WHERE id = deliveries.order_id));
CREATE POLICY "System can manage deliveries" ON deliveries FOR ALL USING (true);

-- ORDER_STATUS_HISTORY POLICIES
CREATE POLICY "Users can read own order history" ON order_status_history FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM orders WHERE id = order_status_history.order_id));
CREATE POLICY "System can insert order history" ON order_status_history FOR INSERT WITH CHECK (true);

-- DESIGN_REVISIONS POLICIES
CREATE POLICY "Users can read own design revisions" ON design_revisions FOR SELECT 
  USING (auth.uid() IN (SELECT user_id FROM orders WHERE id = design_revisions.order_id));
CREATE POLICY "Users can insert own design revisions" ON design_revisions FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT user_id FROM orders WHERE id = design_revisions.order_id));

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- ============================================
-- INSERT DEFAULT VENDOR
-- ============================================

INSERT INTO vendors (name, email, vendor_type, is_active)
VALUES ('B.O. Printing', 'david@dashqrcodes.com', 'printshop', true)
ON CONFLICT DO NOTHING;

