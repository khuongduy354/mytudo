import type { WardrobeModel } from "../models/wardrobe.model.js";
import type { ListingModel } from "../models/listing.model.js";
import type {
  WardrobeItem,
  CreateWardrobeItemRequest,
  UpdateWardrobeItemRequest,
  WardrobeFilters,
  PaginationMeta,
  Wardrobe,
  CreateWardrobeRequest,
  UpdateWardrobeRequest,
} from "@mytudo/shared";

export class WardrobeService {
  constructor(
    private wardrobeModel: WardrobeModel,
    private listingModel: ListingModel
  ) {}

  async getItems(
    userId: string,
    filters: WardrobeFilters
  ): Promise<{ items: WardrobeItem[]; meta: PaginationMeta }> {
    const result = await this.wardrobeModel.findByUser(userId, filters);

    // Check which items have active listings
    const itemsWithListingStatus = await Promise.all(
      result.items.map(async (item) => {
        const listing = await this.listingModel.findByWardrobeItemId(item.id);
        return {
          ...item,
          hasListing: listing !== null && listing.status === "active",
        };
      })
    );

    return {
      items: itemsWithListingStatus,
      meta: result.meta,
    };
  }

  async getItem(id: string, userId: string): Promise<WardrobeItem | null> {
    const item = await this.wardrobeModel.findById(id);
    if (!item || item.userId !== userId) return null;

    const listing = await this.listingModel.findByWardrobeItemId(id);
    return {
      ...item,
      hasListing: listing !== null && listing.status === "active",
    };
  }

  async createItem(
    userId: string,
    data: CreateWardrobeItemRequest
  ): Promise<WardrobeItem> {
    // If no wardrobe specified, use default wardrobe
    let wardrobeId = data.wardrobeId;
    if (!wardrobeId) {
      const defaultWardrobe = await this.wardrobeModel.getDefaultWardrobe(
        userId
      );
      if (!defaultWardrobe) {
        throw new Error("No default wardrobe found");
      }
      wardrobeId = defaultWardrobe.id;
    }

    return this.wardrobeModel.create(userId, { ...data, wardrobeId });
  }

  async updateItem(
    id: string,
    userId: string,
    data: UpdateWardrobeItemRequest
  ): Promise<WardrobeItem> {
    // Verify ownership
    const existing = await this.wardrobeModel.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Item not found or access denied");
    }

    return this.wardrobeModel.update(id, userId, data);
  }

  async deleteItem(id: string, userId: string): Promise<void> {
    // Verify ownership
    const existing = await this.wardrobeModel.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Item not found or access denied");
    }

    // Check if item has active listing
    const listing = await this.listingModel.findByWardrobeItemId(id);
    if (listing && listing.status === "active") {
      throw new Error(
        "Cannot delete item with active listing. Remove the listing first."
      );
    }

    return this.wardrobeModel.delete(id, userId);
  }

  async getItemCount(userId: string): Promise<number> {
    return this.wardrobeModel.countByUser(userId);
  }

  // ================================
  // WARDROBE MANAGEMENT
  // ================================

  async getWardrobes(userId: string): Promise<Wardrobe[]> {
    return this.wardrobeModel.findWardrobesByUser(userId);
  }

  async getWardrobe(id: string, userId: string): Promise<Wardrobe | null> {
    const wardrobe = await this.wardrobeModel.findWardrobeById(id);
    if (!wardrobe || wardrobe.userId !== userId) return null;
    return wardrobe;
  }

  async createWardrobe(
    userId: string,
    data: CreateWardrobeRequest
  ): Promise<Wardrobe> {
    return this.wardrobeModel.createWardrobe(userId, data);
  }

  async updateWardrobe(
    id: string,
    userId: string,
    data: UpdateWardrobeRequest
  ): Promise<Wardrobe> {
    const existing = await this.wardrobeModel.findWardrobeById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Wardrobe not found or access denied");
    }

    return this.wardrobeModel.updateWardrobe(id, userId, data);
  }

  async deleteWardrobe(id: string, userId: string): Promise<void> {
    const existing = await this.wardrobeModel.findWardrobeById(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Wardrobe not found or access denied");
    }

    return this.wardrobeModel.deleteWardrobe(id, userId);
  }
}
