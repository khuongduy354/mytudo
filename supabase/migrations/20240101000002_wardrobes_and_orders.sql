-- Migration: 002_wardrobes_and_orders
-- Description: Add wardrobes table and orders table for C2C marketplace

-- ================================
-- ENUMS
-- ================================

CREATE TYPE wardrobe_visibility AS ENUM ('public', 'private');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');

-- ================================
-- WARDROBES TABLE
-- ================================

-- Wardrobes (a user can have multiple wardrobes)
CREATE TABLE wardrobes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    visibility wardrobe_visibility NOT NULL DEFAULT 'private',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for wardrobes
CREATE INDEX idx_wardrobes_user_id ON wardrobes(user_id);

-- Add wardrobe_id to wardrobe_items (nullable for backward compatibility)
ALTER TABLE wardrobe_items ADD COLUMN wardrobe_id UUID REFERENCES wardrobes(id) ON DELETE SET NULL;
CREATE INDEX idx_wardrobe_items_wardrobe_id ON wardrobe_items(wardrobe_id);

-- ================================
-- ORDERS TABLE
-- ================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_listing_pending_order UNIQUE (listing_id, buyer_id)
);

-- Indexes for orders
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);
CREATE INDEX idx_orders_listing_id ON orders(listing_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ================================
-- TRIGGERS for updated_at
-- ================================

CREATE TRIGGER update_wardrobes_updated_at
    BEFORE UPDATE ON wardrobes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================

ALTER TABLE wardrobes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Wardrobes: users can CRUD their own wardrobes, view public wardrobes
CREATE POLICY "Users can view own wardrobes" ON wardrobes
    FOR SELECT USING (auth.uid() = user_id OR visibility = 'public');

CREATE POLICY "Users can insert own wardrobes" ON wardrobes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wardrobes" ON wardrobes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wardrobes" ON wardrobes
    FOR DELETE USING (auth.uid() = user_id);

-- Orders: buyers and sellers can view their orders
CREATE POLICY "Buyers and sellers can view orders" ON orders
    FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Buyers can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers and sellers can update orders" ON orders
    FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Update wardrobe_items policy to allow viewing items in public wardrobes
DROP POLICY IF EXISTS "Users can view own wardrobe" ON wardrobe_items;
CREATE POLICY "Users can view wardrobe items" ON wardrobe_items
    FOR SELECT USING (
        auth.uid() = user_id 
        OR wardrobe_id IN (SELECT id FROM wardrobes WHERE visibility = 'public')
    );
