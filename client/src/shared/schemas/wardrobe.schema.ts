import { z } from "zod";

export const itemCategorySchema = z.enum([
  "tops",
  "bottoms",
  "footwear",
  "accessories",
]);

export const createWardrobeItemSchema = z.object({
  imageUrl: z.string().url("URL ảnh không hợp lệ"),
  category: itemCategorySchema,
  color: z.string().min(1, "Màu sắc là bắt buộc").max(50),
  name: z.string().max(100).optional(),
  brand: z.string().max(50).optional(),
  size: z.string().max(20).optional(),
  material: z.string().max(50).optional(),
  purchasePrice: z.number().positive().optional(),
  embedding: z.array(z.number()).optional(),
});

export const updateWardrobeItemSchema = z.object({
  imageUrl: z.string().url("URL ảnh không hợp lệ").optional(),
  category: itemCategorySchema.optional(),
  color: z.string().min(1).max(50).optional(),
  name: z.string().max(100).optional().nullable(),
  brand: z.string().max(50).optional().nullable(),
  size: z.string().max(20).optional().nullable(),
  material: z.string().max(50).optional().nullable(),
  purchasePrice: z.number().positive().optional().nullable(),
});

export const wardrobeFiltersSchema = z.object({
  category: itemCategorySchema.optional(),
  color: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

// Type exports
export type ItemCategoryInput = z.infer<typeof itemCategorySchema>;
export type CreateWardrobeItemInput = z.infer<typeof createWardrobeItemSchema>;
export type UpdateWardrobeItemInput = z.infer<typeof updateWardrobeItemSchema>;
export type WardrobeFiltersInput = z.infer<typeof wardrobeFiltersSchema>;
