// Listing/Marketplace types - derived from schemas

import type { WardrobeItem } from "./wardrobe";
import type { UserProfile } from "./auth";
import type {
  ListingConditionInput,
  ListingStatusInput,
  CreateListingInput,
  UpdateListingInput,
  MarketplaceFiltersInput,
} from "../schemas/listing.schema";

// Derived from schemas
export type ListingCondition = ListingConditionInput;
export type ListingStatus = ListingStatusInput;
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

// Derived from schemas
export type CreateListingRequest = CreateListingInput;
export type UpdateListingRequest = UpdateListingInput;

// MarketplaceFilters extends schema input with optional fields for client usage
export interface MarketplaceFilters extends Partial<MarketplaceFiltersInput> {
  status?: ListingStatus; // Added for client-side filtering
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
