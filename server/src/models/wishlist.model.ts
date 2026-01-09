import type { ISupabaseClient } from "../di/supabase.js";
import type { WishlistItem } from "@mytudo/shared";
import type { PaginationMeta } from "@mytudo/shared";

interface DbWishlistItem {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export class WishlistModel {
  constructor(private supabase: ISupabaseClient) {}

  private mapToWishlistItem(dbItem: DbWishlistItem): WishlistItem {
    return {
      id: dbItem.id,
      userId: dbItem.user_id,
      listingId: dbItem.listing_id,
      createdAt: dbItem.created_at,
    };
  }

  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: WishlistItem[]; meta: PaginationMeta }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .getClient()
      .from("wishlist")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch wishlist: ${error.message}`);

    return {
      items: (data || []).map((item) => this.mapToWishlistItem(item)),
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async add(userId: string, listingId: string): Promise<WishlistItem> {
    const { data, error } = await this.supabase
      .getClient()
      .from("wishlist")
      .insert({ user_id: userId, listing_id: listingId })
      .select()
      .single();

    if (error) throw new Error(`Failed to add to wishlist: ${error.message}`);
    return this.mapToWishlistItem(data);
  }

  async remove(userId: string, listingId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from("wishlist")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);

    if (error)
      throw new Error(`Failed to remove from wishlist: ${error.message}`);
  }

  async exists(userId: string, listingId: string): Promise<boolean> {
    const { data } = await this.supabase
      .getClient()
      .from("wishlist")
      .select("id")
      .eq("user_id", userId)
      .eq("listing_id", listingId)
      .single();

    return !!data;
  }
}
