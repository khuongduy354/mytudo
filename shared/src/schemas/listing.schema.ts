import { z } from "zod";
import { itemCategorySchema } from "./wardrobe.schema";

export const listingConditionSchema = z.enum(["new", "like_new", "used"]);
export const listingStatusSchema = z.enum(["active", "sold", "removed"]);
export const listingSortBySchema = z.enum([
  "newest",
  "price_asc",
  "price_desc",
]);

export const createListingSchema = z.object({
  wardrobeItemId: z.string().uuid("ID sản phẩm không hợp lệ"),
  price: z
    .number()
    .positive("Giá phải lớn hơn 0")
    .max(100000000, "Giá không được vượt quá 100 triệu"),
  condition: listingConditionSchema,
  description: z.string().max(1000).optional(),
});

export const updateListingSchema = z.object({
  price: z.number().positive("Giá phải lớn hơn 0").max(100000000).optional(),
  condition: listingConditionSchema.optional(),
  description: z.string().max(1000).optional().nullable(),
  status: listingStatusSchema.optional(),
});

export const marketplaceFiltersSchema = z.object({
  category: itemCategorySchema.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  condition: listingConditionSchema.optional(),
  search: z.string().optional(),
  sort: listingSortBySchema.default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// Type exports
export type ListingConditionInput = z.infer<typeof listingConditionSchema>;
export type ListingStatusInput = z.infer<typeof listingStatusSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type MarketplaceFiltersInput = z.infer<typeof marketplaceFiltersSchema>;
