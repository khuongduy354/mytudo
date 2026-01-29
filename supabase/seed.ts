import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA4NTA2Njg2Mn0.FmKuMDbnAdc84UNz83CmnTSK53RVok_zDY0vEuyoeRX5cE3-Fgj6D5GT2YN2NMk6zI5A2q3-v-fYjCNKMiTE9g";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test users for development
const testUsers = [
  {
    email: "minhanh@test.com",
    password: "Test@123",
    fullName: "Minh Anh",
  },
  {
    email: "thuha@test.com",
    password: "Test@123",
    fullName: "Thu Hà",
  },
  {
    email: "lanphuong@test.com",
    password: "Test@123",
    fullName: "Lan Phương",
  },
];

async function seedAuthUsers() {
  console.log("🌱 Seeding auth users...");

  // First, delete existing test users to start fresh
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  for (const existing of existingUsers.users) {
    if (testUsers.some((u) => u.email === existing.email)) {
      await supabase.auth.admin.deleteUser(existing.id);
      console.log(`🗑️  Deleted existing user: ${existing.email}`);
    }
  }

  const createdUsers: { [email: string]: string } = {};

  for (const user of testUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
      },
    });

    if (error) {
      console.error(`❌ Error creating user ${user.email}:`, error.message);
    } else if (data.user) {
      createdUsers[user.email] = data.user.id;
      console.log(`✅ Created user: ${user.email} with ID: ${data.user.id}`);
    }
  }

  return createdUsers;
}

async function seedApplicationData(userIds: { [email: string]: string }) {
  console.log("🌱 Seeding application data...");

  const user1Id = userIds["minhanh@test.com"];
  const user2Id = userIds["thuha@test.com"];
  const user3Id = userIds["lanphuong@test.com"];

  if (!user1Id || !user2Id || !user3Id) {
    console.error("❌ Missing user IDs, cannot seed application data");
    return;
  }

  // Insert users into public.users table (upsert to handle re-runs)
  const { error: usersError } = await supabase.from("users").upsert(
    [
      {
        id: user1Id,
        email: "minhanh@test.com",
        full_name: "Minh Anh",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=minhanh",
      },
      {
        id: user2Id,
        email: "thuha@test.com",
        full_name: "Thu Hà",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=thuha",
      },
      {
        id: user3Id,
        email: "lanphuong@test.com",
        full_name: "Lan Phương",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=lanphuong",
      },
    ],
    { onConflict: "id" }
  );

  if (usersError) {
    console.error("❌ Error seeding users:", usersError.message);
    return; // Don't continue if users failed
  } else {
    console.log("✅ Seeded users");
  }

  // Seed wardrobes for each user
  const { data: wardrobes, error: wardrobesError } = await supabase
    .from("wardrobes")
    .insert([
      {
        user_id: user1Id,
        name: "Tủ đồ chính",
        visibility: "public",
      },
      {
        user_id: user2Id,
        name: "Tủ đồ chính",
        visibility: "public",
      },
      {
        user_id: user3Id,
        name: "Tủ đồ chính",
        visibility: "public",
      },
    ])
    .select();

  if (wardrobesError) {
    console.error("❌ Error seeding wardrobes:", wardrobesError.message);
    return;
  } else {
    console.log("✅ Seeded wardrobes");
  }

  const [wardrobe1, wardrobe2, wardrobe3] = wardrobes!;

  // Seed wardrobe items for User 1 (Minh Anh)
  const { data: wardrobeItems1, error: wardrobeError1 } = await supabase
    .from("wardrobe_items")
    .insert([
      {
        user_id: user1Id,
        wardrobe_id: wardrobe1.id,
        image_url:
          "https://placehold.co/400x500/ffffff/333333?text=Ao+So+Mi+Trang",
        category: "tops",
        color: "white",
        name: "Áo sơ mi trắng công sở",
        brand: "Zara",
        size: "M",
        material: "Cotton",
        purchase_price: 799000,
      },
      {
        user_id: user1Id,
        wardrobe_id: wardrobe1.id,
        image_url:
          "https://placehold.co/400x500/1a1a2e/ffffff?text=Quan+Tay+Den",
        category: "bottoms",
        color: "black",
        name: "Quần tây đen",
        brand: "H&M",
        size: "M",
        material: "Polyester",
        purchase_price: 599000,
      },
      {
        user_id: user1Id,
        wardrobe_id: wardrobe1.id,
        image_url: "https://placehold.co/400x500/ff6b6b/ffffff?text=Ao+Thun+Do",
        category: "tops",
        color: "red",
        name: "Áo thun đỏ basic",
        brand: "Uniqlo",
        size: "S",
        material: "Cotton",
        purchase_price: 299000,
      },
      {
        user_id: user1Id,
        wardrobe_id: wardrobe1.id,
        image_url: "https://placehold.co/400x500/4ecdc4/ffffff?text=Vay+Xanh",
        category: "bottoms",
        color: "blue",
        name: "Váy xanh ngọc",
        brand: "Local Brand",
        size: "S",
        material: "Linen",
        purchase_price: 450000,
      },
    ])
    .select();

  if (wardrobeError1) {
    console.error("❌ Error seeding wardrobe items:", wardrobeError1.message);
  } else {
    console.log("✅ Seeded wardrobe items for Minh Anh");
  }

  // Seed wardrobe items for User 2 (Thu Hà)
  await supabase.from("wardrobe_items").insert([
    {
      user_id: user2Id,
      wardrobe_id: wardrobe2.id,
      image_url:
        "https://placehold.co/400x500/f8b500/333333?text=Ao+Khoac+Vintage",
      category: "tops",
      color: "yellow",
      name: "Áo khoác vintage",
      brand: "Vintage Shop",
      size: "M",
      material: "Denim",
      purchase_price: 350000,
    },
    {
      user_id: user2Id,
      wardrobe_id: wardrobe2.id,
      image_url:
        "https://placehold.co/400x500/2d3436/ffffff?text=Quan+Jean+Ong+Rong",
      category: "bottoms",
      color: "black",
      name: "Quần jean ống rộng",
      brand: "Levis",
      size: "S",
      material: "Denim",
      purchase_price: 890000,
    },
    {
      user_id: user2Id,
      wardrobe_id: wardrobe2.id,
      image_url: "https://placehold.co/400x500/e17055/ffffff?text=Tui+Xach+Da",
      category: "accessories",
      color: "brown",
      name: "Túi xách da vintage",
      brand: "Unknown",
      material: "Leather",
      purchase_price: 200000,
    },
    {
      user_id: user2Id,
      wardrobe_id: wardrobe2.id,
      image_url:
        "https://placehold.co/400x500/00b894/ffffff?text=Sneakers+Trang",
      category: "footwear",
      color: "white",
      name: "Sneakers trắng",
      brand: "Converse",
      size: "38",
      material: "Canvas",
      purchase_price: 1200000,
    },
  ]);

  console.log("✅ Seeded wardrobe items for Thu Hà");

  // Seed wardrobe items for User 3 (Lan Phương)
  await supabase.from("wardrobe_items").insert([
    {
      user_id: user3Id,
      wardrobe_id: wardrobe3.id,
      image_url: "https://placehold.co/400x500/dfe6e9/333333?text=Ao+Len+Xam",
      category: "tops",
      color: "gray",
      name: "Áo len xám minimalist",
      brand: "COS",
      size: "M",
      material: "Wool",
      purchase_price: 1500000,
    },
    {
      user_id: user3Id,
      wardrobe_id: wardrobe3.id,
      image_url:
        "https://placehold.co/400x500/2d3436/ffffff?text=Quan+Culottes",
      category: "bottoms",
      color: "black",
      name: "Quần culottes đen",
      brand: "Massimo Dutti",
      size: "M",
      material: "Cotton",
      purchase_price: 1200000,
    },
    {
      user_id: user3Id,
      wardrobe_id: wardrobe3.id,
      image_url: "https://placehold.co/400x500/b2bec3/333333?text=Giay+Loafer",
      category: "footwear",
      color: "beige",
      name: "Giày loafer da",
      brand: "Charles & Keith",
      size: "37",
      material: "Leather",
      purchase_price: 1800000,
    },
  ]);

  console.log("✅ Seeded wardrobe items for Lan Phương");

  // Create listings from wardrobe items
  if (wardrobeItems1 && wardrobeItems1.length >= 2) {
    const { error: listingsError } = await supabase.from("listings").insert([
      {
        seller_id: user1Id,
        wardrobe_item_id: wardrobeItems1[0].id,
        price: 350000,
        condition: "like_new",
        description: "Mặc 2 lần, còn rất mới. Lý do bán: không hợp style",
        status: "active",
      },
      {
        seller_id: user1Id,
        wardrobe_item_id: wardrobeItems1[1].id,
        price: 250000,
        condition: "used",
        description: "Đã mặc nhiều lần nhưng vẫn còn đẹp, không bị phai màu",
        status: "active",
      },
    ]);

    if (listingsError) {
      console.error("❌ Error seeding listings:", listingsError.message);
    } else {
      console.log("✅ Seeded listings");
    }
  }
}

async function main() {
  try {
    const userIds = await seedAuthUsers();
    await seedApplicationData(userIds);
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

main();
