-- Migration: 001_initial_schema
-- Description: Create initial tables for MYTuDo app

-- ================================
-- ENUMS
-- ================================

CREATE TYPE item_category AS ENUM ('tops', 'bottoms', 'footwear', 'accessories');
CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'used');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'removed', 'cancelled');

-- ================================
-- TABLES
-- ================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT user_identifier_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- Wardrobe items
CREATE TABLE wardrobe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    category item_category NOT NULL,
    color VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    brand VARCHAR(50),
    size VARCHAR(20),
    material VARCHAR(50),
    purchase_price DECIMAL(12, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for wardrobe_items
CREATE INDEX idx_wardrobe_items_user_id ON wardrobe_items(user_id);
CREATE INDEX idx_wardrobe_items_category ON wardrobe_items(category);
CREATE INDEX idx_wardrobe_items_user_category ON wardrobe_items(user_id, category);

-- Marketplace listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wardrobe_item_id UUID NOT NULL REFERENCES wardrobe_items(id) ON DELETE CASCADE,
    price DECIMAL(12, 2) NOT NULL CHECK (price > 0),
    condition listing_condition NOT NULL,
    description TEXT,
    status listing_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_wardrobe_item_listing UNIQUE (wardrobe_item_id)
);

-- Indexes for listings
CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_status_created ON listings(status, created_at DESC);

-- Wishlist (saved listings)
CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_listing_wishlist UNIQUE (user_id, listing_id)
);

-- Indexes for wishlist
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- ================================
-- TRIGGERS for updated_at
-- ================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wardrobe_items_updated_at
    BEFORE UPDATE ON wardrobe_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Users: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Wardrobe items: users can CRUD their own items
CREATE POLICY "Users can view own wardrobe" ON wardrobe_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wardrobe" ON wardrobe_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobe" ON wardrobe_items
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobe" ON wardrobe_items
    FOR DELETE USING (auth.uid() = user_id);

-- Listings: anyone can view active listings, sellers manage their own
CREATE POLICY "Anyone can view active listings" ON listings
    FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Sellers can insert listings" ON listings
    FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings" ON listings
    FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own listings" ON listings
    FOR DELETE USING (auth.uid() = seller_id);

-- Wishlist: users manage their own
CREATE POLICY "Users can view own wishlist" ON wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to wishlist" ON wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from wishlist" ON wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- ================================
-- STORAGE BUCKET
-- ================================

-- Create storage bucket for wardrobe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wardrobe-images', 'wardrobe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'wardrobe-images' 
    AND auth.role() = 'authenticated'
);

-- Storage policy: public read access
CREATE POLICY "Public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'wardrobe-images');

-- Storage policy: users can delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'wardrobe-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
