import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const supabaseUrl = process.env.SUPABASE_URL || "http://127.0.0.1:54321";
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJFUzI1NiIsImtpZCI6ImI4MTI2OWYxLTIxZDgtNGYyZS1iNzE5LWMyMjQwYTg0MGQ5MCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MjA4NTA2Njg2Mn0.FmKuMDbnAdc84UNz83CmnTSK53RVok_zDY0vEuyoeRX5cE3-Fgj6D5GT2YN2NMk6zI5A2q3-v-fYjCNKMiTE9g";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Real outfit images from Unsplash
const REAL_ITEMS = [
  {
    category: "tops",
    color: "white",
    name: "Classic White T-Shirt",
    brand: "Uniqlo",
    size: "M",
    material: "Cotton",
    purchase_price: 299000,
    image_url:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "bottoms",
    color: "blue",
    name: "Blue Denim Jeans",
    brand: "Levis",
    size: "32",
    material: "Denim",
    purchase_price: 1200000,
    image_url:
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "tops",
    color: "black",
    name: "Black Leather Jacket",
    brand: "Zara",
    size: "L",
    material: "Leather",
    purchase_price: 2500000,
    image_url:
      "https://images.unsplash.com/photo-1520183802803-06f731a2059f?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "footwear",
    color: "white",
    name: "White Sneakers",
    brand: "Nike",
    size: "42",
    material: "Leather",
    purchase_price: 3000000,
    image_url:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "tops",
    color: "red",
    name: "Red Hoodie",
    brand: "H&M",
    size: "XL",
    material: "Cotton",
    purchase_price: 599000,
    image_url:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "tops",
    color: "beige",
    name: "Beige Trench Coat",
    brand: "Burberry",
    size: "M",
    material: "Cotton",
    purchase_price: 5000000,
    image_url:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800",
  },
   {
    category: "bottoms",
    color: "black",
    name: "Black Skirt",
    brand: "Zara",
    size: "S",
    material: "Polyester",
    purchase_price: 450000,
    image_url:
      "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800",
  },
  {
    category: "accessories",
    color: "brown",
    name: "Brown Leather Bag",
    brand: "Coach",
    material: "Leather",
    purchase_price: 4000000,
    image_url:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800",
  },
];

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

async function checkAIService(): Promise<boolean> {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/health`);
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

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

async function generateEmbeddingsBatch(items: typeof REAL_ITEMS): Promise<(number[] | null)[]> {
  console.log(`⚡ Generating embeddings for ${items.length} items in batch...`);
  
  try {
    const formData = new FormData();
    
    // 1. Fetch all images and append to FormData
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        console.log(`   Downloading ${item.name}...`);
        const imageRes = await fetch(item.image_url);
        if (!imageRes.ok) throw new Error(`Failed to fetch image: ${item.image_url}`);
        
        const imageBlob = await imageRes.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        formData.append("files", new Blob([buffer], { type: "image/jpeg" }), `image_${i}.jpg`);
    }

    // 2. Call AI Service Batch Endpoint
    const aiRes = await fetch(`${AI_SERVICE_URL}/batch/generate-embedding`, {
        method: "POST",
        body: formData,
    });

    if (!aiRes.ok) {
        const txt = await aiRes.text();
        throw new Error(`AI Service error: ${aiRes.status} - ${txt}`);
    }

    const data = await aiRes.json();
    
    // 3. Map results back to order
    // Response format: { results: [ { index: 0, success: true, embedding: [...] }, ... ], total: N, ... }
    const embeddings: (number[] | null)[] = new Array(items.length).fill(null);
    
    if (data.results && Array.isArray(data.results)) {
        for (const result of data.results) {
            if (result.success && result.embedding) {
                embeddings[result.index] = result.embedding;
            } else {
                console.error(`   ❌ Failed to generate embedding for item ${result.index}: ${result.error}`);
            }
        }
    }
    
    console.log(`✅ Batch generation complete. Successful: ${data.successful}/${data.total}`);
    return embeddings;

  } catch (error) {
    console.error(`❌ Error generating batch embeddings:`, error);
    throw error;
  }
}

async function seedApplicationData(userIds: { [email: string]: string }) {
  console.log("🌱 Seeding application data...");

  // Strict check for AI Service
  const aiServiceUp = await checkAIService();
  if (!aiServiceUp) {
      console.error("⛔ FATAL: AI Service is NOT reachable at " + AI_SERVICE_URL);
      console.error("   Please make sure the AI service is running (e.g., ./start_local.sh)");
      console.error("   and that the port matches (default 8001).");
      process.exit(1);
  }
  console.log("✅ AI Service is connected.");

  // Generate embeddings for ALL items in batch first
  let allEmbeddings: (number[] | null)[] = [];
  try {
      allEmbeddings = await generateEmbeddingsBatch(REAL_ITEMS);
  } catch (e) {
      console.error("⛔ Failed to generate embeddings, aborting seed.");
      process.exit(1);
  }

  const user1Id = userIds["minhanh@test.com"];
  const user2Id = userIds["thuha@test.com"];
  const user3Id = userIds["lanphuong@test.com"];

  // Insert users into public.users
  await supabase.from("users").upsert(
    [
      { id: user1Id, email: "minhanh@test.com", full_name: "Minh Anh", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=minhanh" },
      { id: user2Id, email: "thuha@test.com", full_name: "Thu Hà", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=thuha" },
      { id: user3Id, email: "lanphuong@test.com", full_name: "Lan Phương", avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=lanphuong" },
    ],
    { onConflict: "id" }
  );

  // Seed wardrobes
  const { data: wardrobes } = await supabase
    .from("wardrobes")
    .insert([
      { user_id: user1Id, name: "Tủ đồ chính", visibility: "public" },
      { user_id: user2Id, name: "Tủ đồ chính", visibility: "public" },
      { user_id: user3Id, name: "Tủ đồ chính", visibility: "public" },
    ])
    .select();

  const [wardrobe1, wardrobe2, wardrobe3] = wardrobes!;

  // We assign based on global index in REAL_ITEMS
  const seedItem = async (userId: string, wardrobeId: string, itemIndex: number, variationSuffix: string = "") => {
      const item = REAL_ITEMS[itemIndex];
      const embedding = allEmbeddings[itemIndex];

      await supabase.from("wardrobe_items").insert({
          user_id: userId,
          wardrobe_id: wardrobeId,
          ...item,
          name: variationSuffix ? `${item.name} (${variationSuffix})` : item.name,
          embedding: embedding
      });
      console.log(`✅ Added ${item.name} ${variationSuffix} for user ${userId.slice(0, 5)}...`);
  }

  console.log("🚀 Generating 50+ wardrobe items...");

  // Generate 60 items total (20 per user)
  // We have 8 base items. We will cycle through them.
  const TOTAL_ITEMS = 60;
  const ITEMS_PER_USER = 20;

  const users = [
      { id: user1Id, wardrobeId: wardrobe1.id },
      { id: user2Id, wardrobeId: wardrobe2.id },
      { id: user3Id, wardrobeId: wardrobe3.id }
  ];

  // Distribute items uniquely among users
  // User 1 gets items 0-2
  // User 2 gets items 3-5
  // User 3 gets items 6-7
  let itemIndex = 0;
  const itemsPerUserDistribution = [3, 3, 2]; // Total 8 items

  for (let u = 0; u < users.length; u++) {
      const user = users[u];
      const count = itemsPerUserDistribution[u];
      
      for (let i = 0; i < count; i++) {
          if (itemIndex < REAL_ITEMS.length) {
              await seedItem(user.id, user.wardrobeId, itemIndex);
              itemIndex++;
          }
      }
  }

  console.log("✅ Seeded wardrobe items.");
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
