// Listing/Marketplace types

import type { WardrobeItem } from "./wardrobe";
import type { UserProfile } from "./auth";

export type ListingCondition = "new" | "like_new" | "used";
export type ListingStatus = "active" | "sold" | "removed" | "cancelled";
export type ListingSortBy = "newest" | "price_asc" | "price_desc";

export interface Listing {
  id: string;
  sellerId: string;
  wardrobeItemId: string;
  wardrobeItem?: WardrobeItem; // Include for convenience in my-listings
  price: number;
  condition: ListingCondition;
  description: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

// Listing with related data for display
export interface ListingWithDetails extends Listing {
  wardrobeItem: WardrobeItem;
  seller: Pick<UserProfile, "id" | "fullName" | "avatarUrl">;
  isWishlisted?: boolean;
}

export interface CreateListingRequest {
  wardrobeItemId: string;
  price: number;
  condition: ListingCondition;
  description?: string;
}

export interface UpdateListingRequest {
  price?: number;
  condition?: ListingCondition;
  description?: string;
  status?: ListingStatus;
}

export interface MarketplaceFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ListingCondition;
  search?: string;
  sort?: ListingSortBy;
  page?: number;
  limit?: number;
}

export const LISTING_CONDITIONS: ListingCondition[] = [
  "new",
  "like_new",
  "used",
];

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "Mới (còn tag)",
  like_new: "Như mới",
  used: "Đã sử dụng",
};

export const STATUS_LABELS: Record<ListingStatus, string> = {
  active: "Đang bán",
  sold: "Đã bán",
  removed: "Đã gỡ",
  cancelled: "Đã hủy",
};
