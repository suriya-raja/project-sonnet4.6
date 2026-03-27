-- ========================================
-- NOGIRR Database Schema for Supabase
-- Run this in Supabase SQL Editor
-- ========================================

-- Users table (includes NGO flag)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_ngo BOOLEAN DEFAULT FALSE,
  ngo_name TEXT,
  city TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  score INTEGER DEFAULT 0,
  donation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Food listings
CREATE TABLE IF NOT EXISTS food_listings (
  id SERIAL PRIMARY KEY,
  donor_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  quantity TEXT NOT NULL,
  photo_url TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'available',
  accepted_by INTEGER REFERENCES users(id),
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  food_listing_id INTEGER NOT NULL,
  donor_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'accepted',
  order_type TEXT DEFAULT 'food',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- FARM RESCUE MODULE (KhetSetu)
-- ========================================

-- Farm listings table
CREATE TABLE IF NOT EXISTS farm_listings (
  id SERIAL PRIMARY KEY,
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  crop_type TEXT NOT NULL,
  description TEXT,
  quantity TEXT NOT NULL,
  price_per_kg DECIMAL DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  freshness_hours INTEGER DEFAULT 48,
  ai_detected_crop TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT DEFAULT 'available',
  claimed_by INTEGER REFERENCES users(id),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_donor ON food_listings(donor_id);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC);
CREATE INDEX IF NOT EXISTS idx_orders_donor ON orders(donor_id);
CREATE INDEX IF NOT EXISTS idx_orders_receiver ON orders(receiver_id);
CREATE INDEX IF NOT EXISTS idx_farm_status ON farm_listings(status);
CREATE INDEX IF NOT EXISTS idx_farm_farmer ON farm_listings(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farm_crop ON farm_listings(crop_type);

-- Disable RLS for simplicity (app handles auth via JWT)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_listings ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations via anon key)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on food_listings" ON food_listings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on orders" ON orders FOR ALL USING (true) WITH CHECK (true);
<<<<<<< HEAD

-- ========================================
-- UPDATES FOR GOOGLE SSO & OTP PASSWORD RESET
-- ========================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires_at TIMESTAMPTZ;

-- Make password_hash, phone, and city nullable to support Google Login without requiring them initially
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE users ALTER COLUMN city DROP NOT NULL;
=======
CREATE POLICY "Allow all on farm_listings" ON farm_listings FOR ALL USING (true) WITH CHECK (true);

-- RPC function to increment user score
CREATE OR REPLACE FUNCTION increment_score(user_id INTEGER, points INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET score = score + points,
      donation_count = donation_count + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
>>>>>>> 426c9821a5fc61d181e61627446731784926f276
