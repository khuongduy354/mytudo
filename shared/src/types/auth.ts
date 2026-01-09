// Auth types

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Email/password auth
export interface LoginWithEmailRequest {
  email: string;
  password: string;
}

export interface RegisterWithEmailRequest {
  email: string;
  password: string;
  fullName?: string;
}

// Phone OTP auth
export interface SendOtpRequest {
  phone: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserProfile;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
