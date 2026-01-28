// Wishlist types

import type { ListingWithDetails } from "./listing";

export interface WishlistItem {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface WishlistItemWithListing extends WishlistItem {
  listing: ListingWithDetails;
}
