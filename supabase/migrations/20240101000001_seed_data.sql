-- Migration: 002_seed_data
-- Description: Seed data for development and testing

-- ================================
-- CREATE TEST AUTH USERS
-- ================================

-- Create test users directly in auth.users for local development
-- Password for all test users: "Test@123"

INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    phone,
    phone_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change,
    aud,
    role,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    last_sign_in_at
) VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        '00000000-0000-0000-0000-000000000000',
        'minhanh@test.com',
        '$2a$10$rqiVHfM5XyJLGzLx8p6bLOqBfEd.x0ZPQ4NQJBhFjWzKWmXXXXXXX', -- Test@123
        NOW(),
        '+84901234567',
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Minh Anh"}',
        false,
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        '00000000-0000-0000-0000-000000000000',
        'thuha@test.com',
        '$2a$10$rqiVHfM5XyJLGzLx8p6bLOqBfEd.x0ZPQ4NQJBhFjWzKWmXXXXXXX', -- Test@123
        NOW(),
        '+84912345678',
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Thu Hà"}',
        false,
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        '00000000-0000-0000-0000-000000000000',
        'lanphuong@test.com',
        '$2a$10$rqiVHfM5XyJLGzLx8p6bLOqBfEd.x0ZPQ4NQJBhFjWzKWmXXXXXXX', -- Test@123
        NOW(),
        '+84923456789',
        NOW(),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        'authenticated',
        'authenticated',
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Lan Phương"}',
        false,
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- Create identities for the users
INSERT INTO auth.identities (
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES
    (
        'minhanh@test.com',
        '11111111-1111-1111-1111-111111111111',
        '{"sub":"11111111-1111-1111-1111-111111111111","email":"minhanh@test.com"}',
        'email',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        'thuha@test.com',
        '22222222-2222-2222-2222-222222222222',
        '{"sub":"22222222-2222-2222-2222-222222222222","email":"thuha@test.com"}',
        'email',
        NOW(),
        NOW(),
        NOW()
    ),
    (
        'lanphuong@test.com',
        '33333333-3333-3333-3333-333333333333',
        '{"sub":"33333333-3333-3333-3333-333333333333","email":"lanphuong@test.com"}',
        'email',
        NOW(),
        NOW(),
        NOW()
    )
ON CONFLICT (provider, provider_id) DO NOTHING;

-- ================================
-- SEED APPLICATION DATA
-- ================================

DO $$
DECLARE
    user1_id UUID := '11111111-1111-1111-1111-111111111111';
    user2_id UUID := '22222222-2222-2222-2222-222222222222';
    user3_id UUID := '33333333-3333-3333-3333-333333333333';
    item1_id UUID;
    item2_id UUID;
    item3_id UUID;
    item4_id UUID;
    item5_id UUID;
    item6_id UUID;
    listing1_id UUID;
    listing2_id UUID;
    listing3_id UUID;
BEGIN
    -- Insert application users
    INSERT INTO users (id, email, phone, full_name, avatar_url)
    VALUES 
        (user1_id, 'minhanh@test.com', '+84901234567', 'Minh Anh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=minhanh'),
        (user2_id, 'thuha@test.com', '+84912345678', 'Thu Hà', 'https://api.dicebear.com/7.x/avataaars/svg?seed=thuha'),
        (user3_id, 'lanphuong@test.com', '+84923456789', 'Lan Phương', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lanphuong')
    ON CONFLICT (id) DO NOTHING;

    -- Wardrobe items for User 1 (Minh Anh)
    INSERT INTO wardrobe_items (id, user_id, image_url, category, color, name, brand, size, material, purchase_price)
    VALUES 
        (gen_random_uuid(), user1_id, 'https://placehold.co/400x500/ffffff/333333?text=Ao+So+Mi+Trang', 'tops', 'white', 'Áo sơ mi trắng công sở', 'Zara', 'M', 'Cotton', 799000),
        (gen_random_uuid(), user1_id, 'https://placehold.co/400x500/1a1a2e/ffffff?text=Quan+Tay+Den', 'bottoms', 'black', 'Quần tây đen', 'H&M', 'M', 'Polyester', 599000),
        (gen_random_uuid(), user1_id, 'https://placehold.co/400x500/ff6b6b/ffffff?text=Ao+Thun+Do', 'tops', 'red', 'Áo thun đỏ basic', 'Uniqlo', 'S', 'Cotton', 299000),
        (gen_random_uuid(), user1_id, 'https://placehold.co/400x500/4ecdc4/ffffff?text=Vay+Xanh', 'bottoms', 'blue', 'Váy xanh ngọc', 'Local Brand', 'S', 'Linen', 450000);
    
    -- Get item IDs for listings
    SELECT id INTO item1_id FROM wardrobe_items WHERE user_id = user1_id LIMIT 1;
    SELECT id INTO item2_id FROM wardrobe_items WHERE user_id = user1_id OFFSET 1 LIMIT 1;

    -- Wardrobe items for User 2 (Thu Hà)
    INSERT INTO wardrobe_items (id, user_id, image_url, category, color, name, brand, size, material, purchase_price)
    VALUES 
        (gen_random_uuid(), user2_id, 'https://placehold.co/400x500/f8b500/333333?text=Ao+Khoac+Vintage', 'tops', 'yellow', 'Áo khoác vintage', 'Vintage Shop', 'M', 'Denim', 350000),
        (gen_random_uuid(), user2_id, 'https://placehold.co/400x500/2d3436/ffffff?text=Quan+Jean+Ong+Rong', 'bottoms', 'black', 'Quần jean ống rộng', 'Levis', 'S', 'Denim', 890000),
        (gen_random_uuid(), user2_id, 'https://placehold.co/400x500/e17055/ffffff?text=Tui+Xach+Da', 'accessories', 'brown', 'Túi xách da vintage', 'Unknown', NULL, 'Leather', 200000),
        (gen_random_uuid(), user2_id, 'https://placehold.co/400x500/00b894/ffffff?text=Sneakers+Trang', 'footwear', 'white', 'Sneakers trắng', 'Converse', '38', 'Canvas', 1200000);
    
    SELECT id INTO item3_id FROM wardrobe_items WHERE user_id = user2_id LIMIT 1;
    SELECT id INTO item4_id FROM wardrobe_items WHERE user_id = user2_id OFFSET 1 LIMIT 1;

    -- Wardrobe items for User 3 (Lan Phương)
    INSERT INTO wardrobe_items (id, user_id, image_url, category, color, name, brand, size, material, purchase_price)
    VALUES 
        (gen_random_uuid(), user3_id, 'https://placehold.co/400x500/dfe6e9/333333?text=Ao+Len+Xam', 'tops', 'gray', 'Áo len xám minimalist', 'COS', 'M', 'Wool', 1500000),
        (gen_random_uuid(), user3_id, 'https://placehold.co/400x500/2d3436/ffffff?text=Quan+Culottes', 'bottoms', 'black', 'Quần culottes đen', 'Massimo Dutti', 'M', 'Cotton', 1200000),
        (gen_random_uuid(), user3_id, 'https://placehold.co/400x500/b2bec3/333333?text=Giay+Loafer', 'footwear', 'beige', 'Giày loafer da', 'Charles & Keith', '37', 'Leather', 1800000);

    SELECT id INTO item5_id FROM wardrobe_items WHERE user_id = user3_id LIMIT 1;
    SELECT id INTO item6_id FROM wardrobe_items WHERE user_id = user3_id OFFSET 1 LIMIT 1;

    -- Create some listings
    INSERT INTO listings (id, seller_id, wardrobe_item_id, price, condition, description, status)
    VALUES 
        (gen_random_uuid(), user1_id, item1_id, 350000, 'like_new', 'Mặc 2 lần, còn rất mới. Lý do bán: không hợp style', 'active'),
        (gen_random_uuid(), user1_id, item2_id, 250000, 'used', 'Đã mặc nhiều lần nhưng vẫn còn đẹp, không bị phai màu', 'active');
    
    SELECT id INTO listing1_id FROM listings WHERE seller_id = user1_id LIMIT 1;
    SELECT id INTO listing2_id FROM listings WHERE seller_id = user1_id OFFSET 1 LIMIT 1;

    INSERT INTO listings (id, seller_id, wardrobe_item_id, price, condition, description, status)
    VALUES 
        (gen_random_uuid(), user2_id, item3_id, 200000, 'like_new', 'Áo khoác vintage cực đẹp, mua về mặc 1 lần', 'active'),
        (gen_random_uuid(), user3_id, item5_id, 800000, 'new', 'Mới mua, còn tag. Bán vì mua nhầm size', 'active');
    
    SELECT id INTO listing3_id FROM listings WHERE seller_id = user2_id LIMIT 1;

    -- Add some wishlist items
    INSERT INTO wishlist (user_id, listing_id)
    VALUES 
        (user2_id, listing1_id),
        (user3_id, listing1_id),
        (user1_id, listing3_id);

    RAISE NOTICE 'Seed data inserted successfully!';
END $$;
