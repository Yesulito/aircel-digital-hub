-- Hiredan Database Schema

-- Users Table
CREATE TYPE user_role AS ENUM ('renter', 'landlord', 'agent', 'admin');
CREATE TYPE verification_status AS ENUM ('not_verified', 'pending', 'verified', 'rejected');

CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'renter',
  avatar_url TEXT,
  verification_status verification_status DEFAULT 'not_verified',
  is_suspended BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ghana_card_number_encrypted TEXT NOT NULL,
  front_image_url TEXT NOT NULL,
  back_image_url TEXT NOT NULL,
  selfie_url TEXT NOT NULL,
  status verification_status DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings Table
CREATE TYPE availability_status AS ENUM ('available_now', 'available_from', 'not_available');
CREATE TYPE listing_status AS ENUM ('active', 'hidden', 'removed');

CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  price DECIMAL NOT NULL,
  availability_status availability_status DEFAULT 'available_now',
  available_from DATE,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  street_name TEXT,
  landmark TEXT,
  rooms INTEGER NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms INTEGER NOT NULL,
  bathroom_type TEXT NOT NULL,
  kitchen_type TEXT NOT NULL,
  parking BOOLEAN DEFAULT FALSE,
  facilities JSONB DEFAULT '[]',
  status listing_status DEFAULT 'active',
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Images Table
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved Listings Table
CREATE TABLE IF NOT EXISTS saved_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  landlord_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, reviewed, dismissed
  admin_action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- user, listing, review, category, verification
  target_id UUID,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP Store for verification
CREATE TABLE IF NOT EXISTS otps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  otp TEXT NOT NULL,
  attempts INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: Anyone can read profiles, users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- OTPs: Anyone can insert, system handles verification
-- OTPs: No public access, handled by service role in API routes

-- Categories: Anyone can read, only admin can manage
CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Listings: Anyone can read active listings, landlords can manage own
CREATE POLICY "Active listings are viewable by everyone" ON listings FOR SELECT USING (status = 'active');
CREATE POLICY "Landlords can insert own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = landlord_id);
CREATE POLICY "Landlords can update own listings" ON listings FOR UPDATE USING (auth.uid() = landlord_id);
CREATE POLICY "Landlords can delete own listings" ON listings FOR DELETE USING (auth.uid() = landlord_id);

-- Listing Images: Anyone can read, landlords can manage own
CREATE POLICY "Listing images are viewable by everyone" ON listing_images FOR SELECT USING (true);
CREATE POLICY "Landlords can manage own listing images" ON listing_images FOR ALL USING (
  EXISTS (SELECT 1 FROM listings WHERE id = listing_images.listing_id AND landlord_id = auth.uid())
);

-- Saved Listings: Users can manage their own
CREATE POLICY "Users can view own saved listings" ON saved_listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saved listings" ON saved_listings FOR ALL USING (auth.uid() = user_id);

-- Reviews: Anyone can read, logged in users can insert
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (is_hidden = false);
CREATE POLICY "Renters can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Verification Requests: Users can insert own, admins can manage
CREATE POLICY "Users can insert verification requests" ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own verification requests" ON verification_requests FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (for initial setup, assuming an 'admin' role in users table)
CREATE POLICY "Admins have full access to reports" ON reports FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins have full access to verification_requests" ON verification_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Indexes for Search Performance
CREATE INDEX idx_listings_region ON listings(region);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_bedrooms ON listings(bedrooms);
CREATE INDEX idx_listings_availability_status ON listings(availability_status);
