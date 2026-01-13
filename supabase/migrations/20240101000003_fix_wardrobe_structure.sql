-- Migration: 003_fix_wardrobe_structure
-- Description: Fix wardrobe structure - items must belong to one wardrobe, create default wardrobes

-- ================================
-- STEP 1: Create default wardrobes for existing users
-- ================================

-- For each existing user, create a default public wardrobe
INSERT INTO wardrobes (user_id, name, visibility)
SELECT DISTINCT user_id, 'Tủ đồ chính', 'public'::wardrobe_visibility
FROM wardrobe_items
WHERE user_id NOT IN (SELECT user_id FROM wardrobes);

-- ================================
-- STEP 2: Assign all existing items to their owner's default wardrobe
-- ================================

UPDATE wardrobe_items wi
SET wardrobe_id = w.id
FROM wardrobes w
WHERE wi.user_id = w.user_id
  AND wi.wardrobe_id IS NULL
  AND w.name = 'Tủ đồ chính';

-- ================================
-- STEP 3: Make wardrobe_id NOT NULL (now all items have a wardrobe)
-- ================================

ALTER TABLE wardrobe_items ALTER COLUMN wardrobe_id SET NOT NULL;

-- ================================
-- STEP 4: Update RLS policies for better permission handling
-- ================================

-- Drop old policy
DROP POLICY IF EXISTS "Users can view wardrobe items" ON wardrobe_items;

-- New policy: Users can view their own items OR items in public wardrobes
CREATE POLICY "Users can view wardrobe items" ON wardrobe_items
    FOR SELECT USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM wardrobes w 
            WHERE w.id = wardrobe_items.wardrobe_id 
            AND w.visibility = 'public'
        )
    );

-- ================================
-- STEP 5: Add function to create default wardrobe on user creation
-- ================================

CREATE OR REPLACE FUNCTION create_default_wardrobe()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a default public wardrobe for new users
    INSERT INTO wardrobes (user_id, name, visibility)
    VALUES (NEW.id, 'Tủ đồ chính', 'public'::wardrobe_visibility);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create default wardrobe
-- DROP TRIGGER IF EXISTS on_user_created_create_wardrobe ON users;
-- CREATE TRIGGER on_user_created_create_wardrobe
--     AFTER INSERT ON users
--     FOR EACH ROW
--     EXECUTE FUNCTION create_default_wardrobe();
