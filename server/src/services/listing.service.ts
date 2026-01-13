import type { ListingModel } from "../models/listing.model.js";
import type { WardrobeModel } from "../models/wardrobe.model.js";
import type {
  Listing,
  ListingWithDetails,
  CreateListingRequest,
  UpdateListingRequest,
  MarketplaceFilters,
  PaginationMeta,
} from "@mytudo/shared";

export class ListingService {
  constructor(
    private listingModel: ListingModel,
    private wardrobeModel: WardrobeModel
  ) {}

  async createListing(
    sellerId: string,
    data: CreateListingRequest
  ): Promise<Listing> {
    // Verify the wardrobe item belongs to the seller
    const item = await this.wardrobeModel.findById(data.wardrobeItemId);
    if (!item || item.userId !== sellerId) {
      throw new Error("Wardrobe item not found or access denied");
    }

    // Verify the item is in a public wardrobe
    const wardrobe = await this.wardrobeModel.findWardrobeById(item.wardrobeId);
    if (!wardrobe || wardrobe.visibility !== "public") {
      throw new Error(
        "Cannot list items from private wardrobes. Please move the item to a public wardrobe first."
      );
    }

    // Check if item already has a listing
    const existingListing = await this.listingModel.findByWardrobeItemId(
      data.wardrobeItemId
    );
    if (existingListing) {
      throw new Error("This item already has a listing");
    }

    return this.listingModel.create(sellerId, data);
  }

  async getMyListings(
    sellerId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: Listing[]; meta: PaginationMeta }> {
    return this.listingModel.findBySeller(sellerId, page, limit);
  }

  async updateListing(
    id: string,
    sellerId: string,
    data: UpdateListingRequest
  ): Promise<Listing> {
    // Verify ownership
    const existing = await this.listingModel.findById(id);
    if (!existing || existing.sellerId !== sellerId) {
      throw new Error("Listing not found or access denied");
    }

    return this.listingModel.update(id, sellerId, data);
  }

  async removeListing(id: string, sellerId: string): Promise<Listing> {
    // Verify ownership
    const existing = await this.listingModel.findById(id);
    if (!existing || existing.sellerId !== sellerId) {
      throw new Error("Listing not found or access denied");
    }

    // Soft delete by setting status to 'removed'
    return this.listingModel.update(id, sellerId, { status: "removed" });
  }

  async getMarketplace(
    filters: MarketplaceFilters,
    currentUserId?: string
  ): Promise<{ items: ListingWithDetails[]; meta: PaginationMeta }> {
    return this.listingModel.marketplace(filters, currentUserId);
  }

  async getListingDetails(
    id: string,
    currentUserId?: string
  ): Promise<ListingWithDetails | null> {
    return this.listingModel.findByIdWithDetails(id, currentUserId);
  }
}
