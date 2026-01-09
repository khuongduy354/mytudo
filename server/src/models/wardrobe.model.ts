import type { ISupabaseClient } from "../di/supabase.js";
import type {
  WardrobeItem,
  CreateWardrobeItemRequest,
  UpdateWardrobeItemRequest,
  WardrobeFilters,
  ItemCategory,
} from "@mytudo/shared";
import type { PaginationMeta } from "@mytudo/shared";

interface DbWardrobeItem {
  id: string;
  user_id: string;
  image_url: string;
  category: ItemCategory;
  color: string;
  name: string | null;
  brand: string | null;
  size: string | null;
  material: string | null;
  purchase_price: number | null;
  created_at: string;
  updated_at: string;
}

export class WardrobeModel {
  constructor(private supabase: ISupabaseClient) {}

  private mapToWardrobeItem(dbItem: DbWardrobeItem): WardrobeItem {
    return {
      id: dbItem.id,
      userId: dbItem.user_id,
      imageUrl: dbItem.image_url,
      category: dbItem.category,
      color: dbItem.color,
      name: dbItem.name,
      brand: dbItem.brand,
      size: dbItem.size,
      material: dbItem.material,
      purchasePrice: dbItem.purchase_price,
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at,
    };
  }

  async findById(id: string): Promise<WardrobeItem | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("wardrobe_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToWardrobeItem(data);
  }

  async findByUser(
    userId: string,
    filters: WardrobeFilters
  ): Promise<{ items: WardrobeItem[]; meta: PaginationMeta }> {
    const { category, color, search, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .getClient()
      .from("wardrobe_items")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (color) {
      query = query.eq("color", color);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch wardrobe: ${error.message}`);

    const items = (data || []).map((item) => this.mapToWardrobeItem(item));
    const total = count || 0;

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(
    userId: string,
    data: CreateWardrobeItemRequest
  ): Promise<WardrobeItem> {
    const dbData = {
      user_id: userId,
      image_url: data.imageUrl,
      category: data.category,
      color: data.color,
      name: data.name || null,
      brand: data.brand || null,
      size: data.size || null,
      material: data.material || null,
      purchase_price: data.purchasePrice || null,
    };

    const { data: result, error } = await this.supabase
      .getClient()
      .from("wardrobe_items")
      .insert(dbData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create item: ${error.message}`);
    return this.mapToWardrobeItem(result);
  }

  async update(
    id: string,
    userId: string,
    data: UpdateWardrobeItemRequest
  ): Promise<WardrobeItem> {
    const dbData: Partial<DbWardrobeItem> = {};
    if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
    if (data.category !== undefined) dbData.category = data.category;
    if (data.color !== undefined) dbData.color = data.color;
    if (data.name !== undefined) dbData.name = data.name || null;
    if (data.brand !== undefined) dbData.brand = data.brand || null;
    if (data.size !== undefined) dbData.size = data.size || null;
    if (data.material !== undefined) dbData.material = data.material || null;
    if (data.purchasePrice !== undefined)
      dbData.purchase_price = data.purchasePrice || null;

    const { data: result, error } = await this.supabase
      .getClient()
      .from("wardrobe_items")
      .update(dbData)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update item: ${error.message}`);
    return this.mapToWardrobeItem(result);
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from("wardrobe_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to delete item: ${error.message}`);
  }

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .getClient()
      .from("wardrobe_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw new Error(`Failed to count items: ${error.message}`);
    return count || 0;
  }
}
