import type { WardrobeModel } from "../models/wardrobe.model.js";
import type { ListingModel } from "../models/listing.model.js";
import type {
  WardrobeItem,
  CreateWardrobeItemRequest,
  UpdateWardrobeItemRequest,
  WardrobeFilters,
  PaginationMeta,
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
    return this.wardrobeModel.create(userId, data);
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
}
