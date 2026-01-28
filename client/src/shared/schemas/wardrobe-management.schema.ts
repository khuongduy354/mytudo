import { z } from "zod";

export const wardrobeVisibilitySchema = z.enum(["public", "private"]);

export const createWardrobeSchema = z.object({
  name: z
    .string()
    .min(1, "Tên tủ đồ không được để trống")
    .max(100, "Tên tủ đồ quá dài"),
  visibility: wardrobeVisibilitySchema.optional().default("private"),
});

export const updateWardrobeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  visibility: wardrobeVisibilitySchema.optional(),
});

export type CreateWardrobeInput = z.infer<typeof createWardrobeSchema>;
export type UpdateWardrobeInput = z.infer<typeof updateWardrobeSchema>;
