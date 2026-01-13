import type { ISupabaseClient } from "../di/supabase.js";
import type {
  Order,
  OrderWithDetails,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderStatus,
} from "@mytudo/shared";
import type { PaginationMeta } from "@mytudo/shared";

interface DbOrder {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: OrderStatus;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export class OrderModel {
  constructor(private supabase: ISupabaseClient) {}

  private mapToOrder(dbOrder: DbOrder): Order {
    return {
      id: dbOrder.id,
      listingId: dbOrder.listing_id,
      buyerId: dbOrder.buyer_id,
      sellerId: dbOrder.seller_id,
      status: dbOrder.status,
      message: dbOrder.message,
      createdAt: dbOrder.created_at,
      updatedAt: dbOrder.updated_at,
    };
  }

  async findById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToOrder(data);
  }

  async findByIdWithDetails(id: string): Promise<OrderWithDetails | null> {
    const { data, error } = await this.supabase
      .getClient()
      .from("orders")
      .select(
        `
        *,
        listings (
          *,
          wardrobe_items (*)
        ),
        buyer:buyer_id (id, full_name, avatar_url),
        seller:seller_id (id, full_name, avatar_url)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      ...this.mapToOrder(data),
      listing: {
        id: data.listings.id,
        sellerId: data.listings.seller_id,
        wardrobeItemId: data.listings.wardrobe_item_id,
        price: Number(data.listings.price),
        condition: data.listings.condition,
        description: data.listings.description,
        status: data.listings.status,
        createdAt: data.listings.created_at,
        updatedAt: data.listings.updated_at,
        wardrobeItem: {
          id: data.listings.wardrobe_items.id,
          userId: data.listings.wardrobe_items.user_id,
          wardrobeId: data.listings.wardrobe_items.wardrobe_id,
          imageUrl: data.listings.wardrobe_items.image_url,
          category: data.listings.wardrobe_items.category,
          color: data.listings.wardrobe_items.color,
          name: data.listings.wardrobe_items.name,
          brand: data.listings.wardrobe_items.brand,
          size: data.listings.wardrobe_items.size,
          material: data.listings.wardrobe_items.material,
          purchasePrice: data.listings.wardrobe_items.purchase_price,
          createdAt: data.listings.wardrobe_items.created_at,
          updatedAt: data.listings.wardrobe_items.updated_at,
        },
        seller: {
          id: data.seller.id,
          fullName: data.seller.full_name,
          avatarUrl: data.seller.avatar_url,
        },
      },
      buyer: {
        id: data.buyer.id,
        fullName: data.buyer.full_name,
        avatarUrl: data.buyer.avatar_url,
      },
      seller: {
        id: data.seller.id,
        fullName: data.seller.full_name,
        avatarUrl: data.seller.avatar_url,
      },
    };
  }

  async findByBuyer(
    buyerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: Order[]; meta: PaginationMeta }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .getClient()
      .from("orders")
      .select("*", { count: "exact" })
      .eq("buyer_id", buyerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    return {
      items: (data || []).map((item) => this.mapToOrder(item)),
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findBySeller(
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: Order[]; meta: PaginationMeta }> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase
      .getClient()
      .from("orders")
      .select("*", { count: "exact" })
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);

    return {
      items: (data || []).map((item) => this.mapToOrder(item)),
      meta: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async findByListing(listingId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .getClient()
      .from("orders")
      .select("*")
      .eq("listing_id", listingId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    return (data || []).map((item) => this.mapToOrder(item));
  }

  async create(
    buyerId: string,
    sellerId: string,
    data: CreateOrderRequest
  ): Promise<Order> {
    const dbData = {
      listing_id: data.listingId,
      buyer_id: buyerId,
      seller_id: sellerId,
      message: data.message || null,
      status: "pending" as OrderStatus,
    };

    const { data: result, error } = await this.supabase
      .getClient()
      .from("orders")
      .insert(dbData)
      .select()
      .single();

    if (error) throw new Error(`Failed to create order: ${error.message}`);
    return this.mapToOrder(result);
  }

  async update(id: string, data: UpdateOrderRequest): Promise<Order> {
    const dbData: Partial<DbOrder> = {};
    if (data.status !== undefined) dbData.status = data.status;

    const { data: result, error } = await this.supabase
      .getClient()
      .from("orders")
      .update(dbData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update order: ${error.message}`);
    return this.mapToOrder(result);
  }
}
