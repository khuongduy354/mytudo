// Auth types - derived from schemas
import type {
  LoginWithEmailInput,
  RegisterWithEmailInput,
  SendMagicLinkInput,
  UpdateProfileInput,
  RefreshTokenInput,
} from "../schemas/auth.schema";

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Email/password auth - derived from schemas
export type LoginWithEmailRequest = LoginWithEmailInput;
export type RegisterWithEmailRequest = RegisterWithEmailInput;

// Magic link (passwordless email login) - derived from schemas
export type SendMagicLinkRequest = SendMagicLinkInput;

export interface SendMagicLinkResponse {
  message: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserProfile;
}

// Profile update - derived from schemas
export type UpdateProfileRequest = UpdateProfileInput;

// Refresh token - derived from schemas
export type RefreshTokenRequest = RefreshTokenInput;
