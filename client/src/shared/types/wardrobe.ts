// Wardrobe types - derived from schemas

import type {
  ItemCategoryInput,
  CreateWardrobeItemInput,
  UpdateWardrobeItemInput,
  WardrobeFiltersInput,
} from "../schemas/wardrobe.schema";

// Derived from schemas
export type ItemCategory = ItemCategoryInput;
export type WardrobeVisibility = "public" | "private";

export interface Wardrobe {
  id: string;
  userId: string;
  name: string;
  visibility: WardrobeVisibility;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  itemCount?: number;
}

export interface CreateWardrobeRequest {
  name: string;
  visibility?: WardrobeVisibility;
}

export interface UpdateWardrobeRequest {
  name?: string;
  visibility?: WardrobeVisibility;
}

export interface WardrobeItem {
  id: string;
  userId: string;
  wardrobeId: string;
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

// Derived from schemas but extended with additional fields not in validation schemas
export interface CreateWardrobeItemRequest extends CreateWardrobeItemInput {
  wardrobeId?: string;
}

export interface UpdateWardrobeItemRequest extends UpdateWardrobeItemInput {
  wardrobeId?: string;
}

export interface WardrobeFilters extends Partial<WardrobeFiltersInput> {
  wardrobeId?: string;
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
