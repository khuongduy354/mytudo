import { apiClient } from "./client";
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  AuthResponse,
  UserProfile,
  UpdateProfileRequest,
  RefreshTokenRequest,
} from "@mytudo/shared";

export const authApi = {
  sendOtp: async (data: SendOtpRequest): Promise<SendOtpResponse> => {
    const response = await apiClient.post("/auth/send-otp", data);
    return response.data.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/verify-otp", data);
    return response.data.data;
  },

  getMe: async (): Promise<UserProfile> => {
    const response = await apiClient.get("/auth/me");
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.put("/auth/profile", data);
    return response.data.data;
  },

  refreshToken: async (
    data: RefreshTokenRequest
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post("/auth/refresh", data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};
