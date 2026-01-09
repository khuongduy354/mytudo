import { z } from "zod";

// Phone validation (Vietnamese format)
const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;

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

// Phone OTP flow
export const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(
      phoneRegex,
      "Số điện thoại không hợp lệ. Ví dụ: +84901234567 hoặc 0901234567"
    ),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(phoneRegex, "Số điện thoại không hợp lệ"),
  otp: z
    .string()
    .length(6, "Mã OTP phải có 6 chữ số")
    .regex(/^[0-9]+$/, "Mã OTP chỉ chứa số"),
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
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
