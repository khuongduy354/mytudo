// Wardrobe types

export type ItemCategory = "tops" | "bottoms" | "footwear" | "accessories";

export interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  category: ItemCategory;
  color: string;
  name: string | null;
  brand: string | null;
  size: string | null;
  material: string | null;
  purchasePrice: number | null;
  createdAt: string;
  updatedAt: string;
  // Virtual field: whether item has an active listing
  hasListing?: boolean;
}

export interface CreateWardrobeItemRequest {
  imageUrl: string;
  category: ItemCategory;
  color: string;
  name?: string;
  brand?: string;
  size?: string;
  material?: string;
  purchasePrice?: number;
}

export interface UpdateWardrobeItemRequest {
  imageUrl?: string;
  category?: ItemCategory;
  color?: string;
  name?: string;
  brand?: string;
  size?: string;
  material?: string;
  purchasePrice?: number;
}

export interface WardrobeFilters {
  category?: ItemCategory;
  color?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const ITEM_CATEGORIES: ItemCategory[] = [
  "tops",
  "bottoms",
  "footwear",
  "accessories",
];

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  tops: "Áo",
  bottoms: "Quần/Váy",
  footwear: "Giày dép",
  accessories: "Phụ kiện",
};

export const COMMON_COLORS = [
  "black",
  "white",
  "gray",
  "red",
  "blue",
  "green",
  "yellow",
  "pink",
  "purple",
  "orange",
  "brown",
  "beige",
  "navy",
];
