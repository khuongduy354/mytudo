import type { WishlistModel } from "../models/wishlist.model.js";
import type { ListingModel } from "../models/listing.model.js";
import type {
  WishlistItem,
  ListingWithDetails,
  PaginationMeta,
} from "@mytudo/shared";

export class WishlistService {
  constructor(
    private wishlistModel: WishlistModel,
    private listingModel: ListingModel
  ) {}

  async getWishlist(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: ListingWithDetails[]; meta: PaginationMeta }> {
    const wishlistResult = await this.wishlistModel.findByUser(
      userId,
      page,
      limit
    );

    // Get listing details for each wishlist item
    const items: ListingWithDetails[] = [];
    for (const wishlistItem of wishlistResult.items) {
      const listing = await this.listingModel.findByIdWithDetails(
        wishlistItem.listingId,
        userId
      );
      if (listing) {
        items.push(listing);
      }
    }

    return {
      items,
      meta: wishlistResult.meta,
    };
  }

  async addToWishlist(
    userId: string,
    listingId: string
  ): Promise<WishlistItem> {
    // Verify listing exists and is active
    const listing = await this.listingModel.findById(listingId);
    if (!listing || listing.status !== "active") {
      throw new Error("Listing not found or not available");
    }

    // Check if already in wishlist
    const exists = await this.wishlistModel.exists(userId, listingId);
    if (exists) {
      throw new Error("Item already in wishlist");
    }

    return this.wishlistModel.add(userId, listingId);
  }

  async removeFromWishlist(userId: string, listingId: string): Promise<void> {
    return this.wishlistModel.remove(userId, listingId);
  }

  async isWishlisted(userId: string, listingId: string): Promise<boolean> {
    return this.wishlistModel.exists(userId, listingId);
  }
}
