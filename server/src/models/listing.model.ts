import type { ISupabaseClient } from "../di/supabase.js";
import type {
  Listing,
  ListingWithDetails,
  CreateListingRequest,
  UpdateListingRequest,
  MarketplaceFilters,
  ListingCondition,
  ListingStatus,
} from "@mytudo/shared";
import type { PaginationMeta } from "@mytudo/shared";

interface DbListing {
  id: string;
  seller_id: string;
  wardrobe_item_id: string;
  price: number;
  condition: ListingCondition;
  description: string | null;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
}

export class ListingModel {
  constructor(private supabase: ISupabaseClient) {}

  private mapToListing(dbListing: DbListing): Listing {
    return {
      id: dbListing.id,
      sellerId: dbListing.seller_id,
      wardrobeItemId: dbListing.wardrobe_item_id,
      price: Number(dbListing.price),
      condition: dbListing.condition,
      description: dbListing.description,
      status: dbListing.status,
      createdAt: dbListing.created_at,
      updatedAt: dbListing.updated_at,
    };
  }

  async findById(id: string): Promise<Listing | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToListing(data);
  }

  async findByIdWithDetails(
    id: string,
    currentUserId?: string
  ): Promise<ListingWithDetails | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("listings")
      .select(
        `
        *,
        wardrobe_items (*),
        users:seller_id!inner (id, full_name, avatar_url)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;

    // Check if wishlisted
    let isWishlisted = false;
    if (currentUserId) {
      const { data: wishlistData } = await this.supabase
        .getClient()
        .from("wishlist")
        .select("id")
        .eq("user_id", currentUserId)
        .eq("listing_id", id)
        .single();
      isWishlisted = !!wishlistData;
    }

    return {
      ...this.mapToListing(data),
      wardrobeItem: {
        id: data.wardrobe_items.id,
        userId: data.wardrobe_items.user_id,
        wardrobeId: data.wardrobe_items.wardrobe_id,
        imageUrl: data.wardrobe_items.image_url,
        category: data.wardrobe_items.category,
        color: data.wardrobe_items.color,
        name: data.wardrobe_items.name,
        brand: data.wardrobe_items.brand,
        size: data.wardrobe_items.size,
        material: data.wardrobe_items.material,
        purchasePrice: data.wardrobe_items.purchase_price,
        createdAt: data.wardrobe_items.created_at,
        updatedAt: data.wardrobe_items.updated_at,
      },
      seller: {
        id: data.users.id,
        fullName: data.users.full_name,
        avatarUrl: data.users.avatar_url,
      },
      isWishlisted,
    };
  }

  async findBySeller(
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: Listing[]; meta: PaginationMeta }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .getClient()
      .from("listings")
      .select(
        `
        *,
        wardrobe_items (*)
      `,
        { count: "exact" }
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch listings: ${error.message}`);

    const items = (data || []).map((item) => ({
      ...this.mapToListing(item),
      wardrobeItem: item.wardrobe_items
        ? {
            id: item.wardrobe_items.id,
            userId: item.wardrobe_items.user_id,
            wardrobeId: item.wardrobe_items.wardrobe_id,
            imageUrl: item.wardrobe_items.image_url,
            category: item.wardrobe_items.category,
            color: item.wardrobe_items.color,
            name: item.wardrobe_items.name,
            brand: item.wardrobe_items.brand,
            size: item.wardrobe_items.size,
            material: item.wardrobe_items.material,
            purchasePrice: item.wardrobe_items.purchase_price,
            createdAt: item.wardrobe_items.created_at,
            updatedAt: item.wardrobe_items.updated_at,
          }
        : undefined,
    }));

    return {
      items,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findByWardrobeItemId(wardrobeItemId: string): Promise<Listing | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("listings")
      .select("*")
      .eq("wardrobe_item_id", wardrobeItemId)
      .single();

    if (error || !data) return null;
    return this.mapToListing(data);
  }

  async marketplace(
    filters: MarketplaceFilters,
    currentUserId?: string
  ): Promise<{ items: ListingWithDetails[]; meta: PaginationMeta }> {
    const {
      category,
      minPrice,
      maxPrice,
      condition,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = filters;
    const offset = (page - 1) * limit;

    let query = this.supabase
      .getClient()
      .from("listings")
      .select(
        `
        *,
        wardrobe_items!inner (
          *,
          wardrobes!inner(
            id,
            visibility
          )
        ),
        users:seller_id!inner (id, full_name, avatar_url)
      `,
        { count: "exact" }
      )
      .eq("status", "active");

    if (category) {
      query = query.eq("wardrobe_items.category", category);
    }

    if (minPrice !== undefined) {
      query = query.gte("price", minPrice);
    }

    if (maxPrice !== undefined) {
      query = query.lte("price", maxPrice);
    }

    if (condition) {
      query = query.eq("condition", condition);
    }

    if (search) {
      query = query.or(
        `wardrobe_items.name.ilike.%${search}%,wardrobe_items.brand.ilike.%${search}%`
      );
    }

    // Sorting
    switch (sort) {
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new Error(`Failed to fetch marketplace: ${error.message}`);

    // Get wishlist status for all items
    let wishlistedIds: Set<string> = new Set();
    if (currentUserId && data && data.length > 0) {
      const listingIds = data.map((l) => l.id);
      const { data: wishlistData } = await this.supabase
        .getClient()
        .from("wishlist")
        .select("listing_id")
        .eq("user_id", currentUserId)
        .in("listing_id", listingIds);

      wishlistedIds = new Set(wishlistData?.map((w) => w.listing_id) || []);
    }

    const items: ListingWithDetails[] = (data || [])
      .filter((item) => {
        // Filter out invalid data and non-public wardrobes
        if (!item.wardrobe_items || !item.users) return false;
        if (!item.wardrobe_items.wardrobes) return false;
        return item.wardrobe_items.wardrobes.visibility === "public";
      })
      .map((item) => ({
        ...this.mapToListing(item),
        wardrobeItem: {
          id: item.wardrobe_items.id,
          userId: item.wardrobe_items.user_id,
          wardrobeId: item.wardrobe_items.wardrobe_id,
          imageUrl: item.wardrobe_items.image_url,
          category: item.wardrobe_items.category,
          color: item.wardrobe_items.color,
          name: item.wardrobe_items.name,
          brand: item.wardrobe_items.brand,
          size: item.wardrobe_items.size,
          material: item.wardrobe_items.material,
          purchasePrice: item.wardrobe_items.purchase_price,
          createdAt: item.wardrobe_items.created_at,
          updatedAt: item.wardrobe_items.updated_at,
        },
        seller: {
          id: item.users.id,
          fullName: item.users.full_name,
          avatarUrl: item.users.avatar_url,
        },
        isWishlisted: wishlistedIds.has(item.id),
      }));

    return {
      items,
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async create(sellerId: string, data: CreateListingRequest): Promise<Listing> {
    const dbData = {
      seller_id: sellerId,
      wardrobe_item_id: data.wardrobeItemId,
      price: data.price,
      condition: data.condition,
      description: data.description || null,
      status: "active" as ListingStatus,
    };

    const { data: result, error } = await this.supabase
      .getClient()
      .from("listings")
      .insert(dbData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create listing: ${error.message}`);
    return this.mapToListing(result);
  }

  async update(
    id: string,
    sellerId: string,
    data: UpdateListingRequest
  ): Promise<Listing> {
    const dbData: Partial<DbListing> = {};
    if (data.price !== undefined) dbData.price = data.price;
    if (data.condition !== undefined) dbData.condition = data.condition;
    if (data.description !== undefined)
      dbData.description = data.description || null;
    if (data.status !== undefined) dbData.status = data.status;

    const { data: result, error } = await this.supabase
      .getClient()
      .from("listings")
      .update(dbData)
      .eq("id", id)
      .eq("seller_id", sellerId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update listing: ${error.message}`);
    return this.mapToListing(result);
  }

  async delete(id: string, sellerId: string): Promise<void> {
    const { error } = await this.supabase
      .getClient()
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("seller_id", sellerId);

    if (error) throw new Error(`Failed to delete listing: ${error.message}`);
  }
}
