import { apiClient } from "./client";
import type {
  LoginWithEmailRequest,
  RegisterWithEmailRequest,
  SendMagicLinkRequest,
  SendMagicLinkResponse,
  AuthResponse,
  UserProfile,
  UpdateProfileRequest,
  RefreshTokenRequest,
} from "@/shared";

export const authApi = {
  loginWithEmail: async (
    data: LoginWithEmailRequest,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data.data;
  },

  registerWithEmail: async (
    data: RegisterWithEmailRequest,
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", data);
    return response.data.data;
  },

  sendMagicLink: async (
    data: SendMagicLinkRequest,
  ): Promise<SendMagicLinkResponse> => {
    const response = await apiClient.post("/auth/send-magic-link", data);
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
    data: RefreshTokenRequest,
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post("/auth/refresh", data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};
