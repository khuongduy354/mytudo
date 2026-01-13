import { z } from "zod";

// Email validation
const emailSchema = z.string().email("Email không hợp lệ");

// Login via email/password
export const loginWithEmailSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

// Register via email/password
export const registerWithEmailSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  fullName: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
});

// Magic link (passwordless email login)
export const sendMagicLinkSchema = z.object({
  email: emailSchema,
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự")
    .optional(),
  avatarUrl: z.string().url("URL avatar không hợp lệ").optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token là bắt buộc"),
});

// Type exports
export type LoginWithEmailInput = z.infer<typeof loginWithEmailSchema>;
export type RegisterWithEmailInput = z.infer<typeof registerWithEmailSchema>;
export type SendMagicLinkInput = z.infer<typeof sendMagicLinkSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
